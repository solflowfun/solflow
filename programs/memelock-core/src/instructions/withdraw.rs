use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{Contract, ContractState};
use crate::error::MemeLockError;
use crate::utils::WITHDRAW_MAX;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// Recipient claiming tokens (must be contract recipient or authorized)
    #[account(mut)]
    pub recipient: Signer<'info>,
    
    /// Token mint
    pub mint: InterfaceAccount<'info, Mint>,
    
    /// Contract PDA
    #[account(
        mut,
        has_one = mint,
        has_one = recipient,
        has_one = escrow_token_account,
        seeds = [
            b"contract",
            contract.sender.as_ref(),
            mint.key().as_ref(),
            get_nonce_from_contract(&contract).as_ref(),
        ],
        bump = contract.bump,
    )]
    pub contract: Account<'info, Contract>,
    
    /// Escrow token account holding locked tokens
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = contract,
        associated_token::token_program = token_program,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Recipient's token account to receive tokens
    #[account(
        init_if_needed,
        payer = recipient,
        associated_token::mint = mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Token program
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

/// Helper to get nonce from contract - this is a workaround since we store it implicitly
/// In production, you'd store the nonce in the contract or derive it differently
fn get_nonce_from_contract(contract: &Contract) -> [u8; 8] {
    // The nonce is part of the PDA derivation, we reconstruct it from created_at
    // This is a simplification - in production you'd store the nonce explicitly
    contract.created_at.to_le_bytes()
}

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check contract state
    let state = contract.state();
    require!(
        state == ContractState::Active || state == ContractState::Scheduled,
        MemeLockError::ContractNotActive
    );
    
    // If scheduled and start time reached, activate
    if state == ContractState::Scheduled && now >= contract.start_ts {
        contract.state = ContractState::Active as u8;
    }
    
    // Calculate claimable amount
    let claimable = contract.calculate_claimable(now);
    require!(claimable > 0, MemeLockError::NothingToWithdraw);
    
    // Determine actual withdrawal amount
    let withdraw_amount = if amount == WITHDRAW_MAX {
        claimable
    } else {
        require!(amount <= claimable, MemeLockError::WithdrawalExceedsClaimable);
        amount
    };
    
    // Build signer seeds for escrow transfer
    let sender_key = contract.sender;
    let mint_key = ctx.accounts.mint.key();
    let nonce = get_nonce_from_contract(contract);
    let bump = [contract.bump];
    
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"contract",
        sender_key.as_ref(),
        mint_key.as_ref(),
        nonce.as_ref(),
        bump.as_ref(),
    ]];
    
    // Transfer tokens from escrow to recipient
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.contract.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        signer_seeds,
    );
    
    transfer_checked(cpi_ctx, withdraw_amount, ctx.accounts.mint.decimals)?;
    
    // Update contract state
    contract.withdrawn_amount = contract.withdrawn_amount.saturating_add(withdraw_amount);
    contract.last_withdrawn_at = now;
    
    // Check if fully withdrawn
    if contract.withdrawn_amount >= contract.total_amount {
        contract.state = ContractState::Completed as u8;
    }
    
    msg!("Withdrawn {} tokens, total withdrawn: {}", withdraw_amount, contract.withdrawn_amount);
    
    // Emit event
    emit!(TokensWithdrawn {
        contract: ctx.accounts.contract.key(),
        recipient: ctx.accounts.recipient.key(),
        amount: withdraw_amount,
        total_withdrawn: contract.withdrawn_amount,
        remaining: contract.total_amount.saturating_sub(contract.withdrawn_amount),
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct TokensWithdrawn {
    pub contract: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub total_withdrawn: u64,
    pub remaining: u64,
    pub timestamp: i64,
}

