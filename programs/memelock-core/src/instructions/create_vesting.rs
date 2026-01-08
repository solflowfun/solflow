use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{Contract, ContractState, Config};
use crate::error::MemeLockError;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateVestingParams {
    /// Total amount of tokens to vest
    pub amount: u64,
    /// Recipient who receives vested tokens
    pub recipient: Pubkey,
    /// Unix timestamp when vesting starts (can be now or future)
    pub start_ts: i64,
    /// Unix timestamp when vesting ends (fully vested)
    pub end_ts: i64,
    /// Unlock interval in seconds (e.g., 86400 for daily)
    pub unlock_interval_seconds: u64,
    /// Cliff amount (absolute tokens released at first unlock)
    pub cliff_amount: u64,
    /// Cancel permission mode
    pub cancelable_by: u8,
    /// Transfer recipient permission mode
    pub transferable_by: u8,
    /// Whether contract can be paused
    pub pausable: bool,
    /// Unique nonce for this contract
    pub nonce: [u8; 8],
    /// Optional title
    pub title: Option<String>,
    /// Optional memo
    pub memo: Option<String>,
}

#[derive(Accounts)]
#[instruction(params: CreateVestingParams)]
pub struct CreateVesting<'info> {
    /// Sender who creates and funds the vesting
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// Token mint being vested
    pub mint: InterfaceAccount<'info, Mint>,
    
    /// Sender's token account to transfer from
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = sender,
        associated_token::token_program = token_program,
    )]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Contract PDA
    #[account(
        init,
        payer = sender,
        space = Contract::LEN,
        seeds = [
            b"contract",
            sender.key().as_ref(),
            mint.key().as_ref(),
            params.nonce.as_ref(),
        ],
        bump,
    )]
    pub contract: Account<'info, Contract>,
    
    /// Escrow token account
    #[account(
        init,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = contract,
        associated_token::token_program = token_program,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Protocol config
    #[account(
        seeds = [Config::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,
    
    /// Protocol treasury for fees
    /// CHECK: Just receiving SOL
    #[account(mut, address = config.treasury)]
    pub treasury: AccountInfo<'info>,
    
    /// Token program
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateVesting>, params: CreateVestingParams) -> Result<()> {
    let config = &ctx.accounts.config;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Validate protocol is not paused
    require!(!config.paused, MemeLockError::ProtocolPaused);
    
    // Validate amount
    require!(params.amount > 0, MemeLockError::ZeroAmount);
    
    // Validate cliff doesn't exceed total
    require!(params.cliff_amount <= params.amount, MemeLockError::CliffExceedsTotal);
    
    // Validate timestamps
    require!(params.end_ts > params.start_ts, MemeLockError::StartAfterEnd);
    
    // Start time can be now or future
    let effective_start = if params.start_ts <= now { now } else { params.start_ts };
    
    // Validate duration
    let duration = (params.end_ts - effective_start) as u64;
    require!(duration >= config.min_lock_duration, MemeLockError::DurationTooShort);
    require!(duration <= config.max_lock_duration, MemeLockError::DurationTooLong);
    
    // Validate interval
    require!(params.unlock_interval_seconds > 0, MemeLockError::InvalidInterval);
    require!(
        duration % params.unlock_interval_seconds == 0,
        MemeLockError::IntervalNotDivisible
    );
    
    // Ensure at least one interval
    let total_intervals = duration / params.unlock_interval_seconds;
    require!(total_intervals >= 1, MemeLockError::InvalidInterval);
    
    // Pay creation fee if configured
    if config.creation_fee_lamports > 0 {
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.sender.key(),
            &ctx.accounts.treasury.key(),
            config.creation_fee_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.sender.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
        )?;
    }
    
    // Transfer tokens to escrow
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.sender_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.sender.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );
    
    transfer_checked(cpi_ctx, params.amount, ctx.accounts.mint.decimals)?;
    
    // Determine initial state
    let initial_state = if params.start_ts > now {
        ContractState::Scheduled
    } else {
        ContractState::Active
    };
    
    // Initialize contract state
    let contract = &mut ctx.accounts.contract;
    contract.version = 1;
    contract.kind = 1; // Vesting
    contract.state = initial_state as u8;
    contract.bump = ctx.bumps.contract;
    contract.mint = ctx.accounts.mint.key();
    contract.sender = ctx.accounts.sender.key();
    contract.recipient = params.recipient;
    contract.escrow_token_account = ctx.accounts.escrow_token_account.key();
    contract.start_ts = params.start_ts;
    contract.end_ts = params.end_ts;
    contract.unlock_interval_seconds = params.unlock_interval_seconds;
    contract.cliff_amount = params.cliff_amount;
    contract.total_amount = params.amount;
    contract.withdrawn_amount = 0;
    contract.created_at = now;
    contract.last_withdrawn_at = 0;
    contract.cancelable_by = params.cancelable_by;
    contract.transferable_by = params.transferable_by;
    contract.pausable = params.pausable;
    contract.paused_at = 0;
    contract.total_paused_duration = 0;
    contract.yield_boost_enabled = false;
    contract.yield_boost_account = Pubkey::default();
    contract.auto_claim_enabled = false;
    
    msg!(
        "Vesting created: {} tokens, {} intervals of {} seconds, {} cliff",
        params.amount,
        total_intervals,
        params.unlock_interval_seconds,
        params.cliff_amount
    );
    
    // Emit event
    emit!(VestingCreated {
        contract: contract.key(),
        sender: ctx.accounts.sender.key(),
        recipient: params.recipient,
        mint: ctx.accounts.mint.key(),
        amount: params.amount,
        start_ts: params.start_ts,
        end_ts: params.end_ts,
        unlock_interval_seconds: params.unlock_interval_seconds,
        cliff_amount: params.cliff_amount,
        total_intervals,
        created_at: now,
    });
    
    Ok(())
}

#[event]
pub struct VestingCreated {
    pub contract: Pubkey,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub start_ts: i64,
    pub end_ts: i64,
    pub unlock_interval_seconds: u64,
    pub cliff_amount: u64,
    pub total_intervals: u64,
    pub created_at: i64,
}

