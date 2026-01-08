use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{Contract, ContractState, Config};
use crate::error::MemeLockError;
use crate::utils;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateLockParams {
    /// Total amount of tokens to lock
    pub amount: u64,
    /// Recipient who can claim tokens after unlock
    pub recipient: Pubkey,
    /// Unix timestamp when tokens unlock (must be future)
    pub unlock_ts: i64,
    /// Cancel permission mode (0=neither, 1=sender, 2=recipient, 3=both)
    pub cancelable_by: u8,
    /// Transfer recipient permission mode
    pub transferable_by: u8,
    /// Unique nonce for this contract (allows multiple locks of same token)
    pub nonce: [u8; 8],
    /// Optional title for the lock
    pub title: Option<String>,
    /// Optional memo/description
    pub memo: Option<String>,
}

#[derive(Accounts)]
#[instruction(params: CreateLockParams)]
pub struct CreateLock<'info> {
    /// Sender who creates and funds the lock
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// Token mint being locked
    pub mint: InterfaceAccount<'info, Mint>,
    
    /// Sender's token account to transfer from
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = sender,
        associated_token::token_program = token_program,
    )]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Contract PDA - stores lock state
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
    
    /// Escrow token account - holds locked tokens
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
    
    /// Token program (SPL or Token-2022)
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateLock>, params: CreateLockParams) -> Result<()> {
    let config = &ctx.accounts.config;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Validate protocol is not paused
    require!(!config.paused, MemeLockError::ProtocolPaused);
    
    // Validate amount
    require!(params.amount > 0, MemeLockError::ZeroAmount);
    
    // Validate unlock time is in the future
    require!(params.unlock_ts > now, MemeLockError::InvalidUnlockTime);
    
    // Validate duration
    let duration = (params.unlock_ts - now) as u64;
    require!(duration >= config.min_lock_duration, MemeLockError::DurationTooShort);
    require!(duration <= config.max_lock_duration, MemeLockError::DurationTooLong);
    
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
    
    // Initialize contract state
    let contract = &mut ctx.accounts.contract;
    contract.version = 1;
    contract.kind = 0; // Lock
    contract.state = ContractState::Active as u8;
    contract.bump = ctx.bumps.contract;
    contract.mint = ctx.accounts.mint.key();
    contract.sender = ctx.accounts.sender.key();
    contract.recipient = params.recipient;
    contract.escrow_token_account = ctx.accounts.escrow_token_account.key();
    contract.start_ts = now;
    contract.end_ts = params.unlock_ts;
    contract.unlock_interval_seconds = 0; // Not used for locks
    contract.cliff_amount = 0; // Not used for locks
    contract.total_amount = params.amount;
    contract.withdrawn_amount = 0;
    contract.created_at = now;
    contract.last_withdrawn_at = 0;
    contract.cancelable_by = params.cancelable_by;
    contract.transferable_by = params.transferable_by;
    contract.pausable = false; // Locks cannot be paused
    contract.paused_at = 0;
    contract.total_paused_duration = 0;
    contract.yield_boost_enabled = false;
    contract.yield_boost_account = Pubkey::default();
    contract.auto_claim_enabled = false;
    
    msg!("Lock created: {} tokens locked until {}", params.amount, params.unlock_ts);
    
    // Emit event
    emit!(LockCreated {
        contract: contract.key(),
        sender: ctx.accounts.sender.key(),
        recipient: params.recipient,
        mint: ctx.accounts.mint.key(),
        amount: params.amount,
        unlock_ts: params.unlock_ts,
        created_at: now,
    });
    
    Ok(())
}

#[event]
pub struct LockCreated {
    pub contract: Pubkey,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub unlock_ts: i64,
    pub created_at: i64,
}

