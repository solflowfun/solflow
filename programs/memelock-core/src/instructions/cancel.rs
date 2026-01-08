use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked, CloseAccount, close_account};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{Contract, ContractState};
use crate::error::MemeLockError;

#[derive(Accounts)]
pub struct Cancel<'info> {
    /// Signer requesting cancellation (must be permitted)
    #[account(mut)]
    pub signer: Signer<'info>,
    
    /// Token mint
    pub mint: InterfaceAccount<'info, Mint>,
    
    /// Contract PDA
    #[account(
        mut,
        has_one = mint,
        has_one = escrow_token_account,
        seeds = [
            b"contract",
            contract.sender.as_ref(),
            mint.key().as_ref(),
            contract.created_at.to_le_bytes().as_ref(),
        ],
        bump = contract.bump,
    )]
    pub contract: Account<'info, Contract>,
    
    /// Escrow token account
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = contract,
        associated_token::token_program = token_program,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Sender's token account (receives locked portion)
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = sender,
        associated_token::token_program = token_program,
    )]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Recipient's token account (receives unlocked portion)
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = recipient,
        associated_token::token_program = token_program,
    )]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Sender account (for ATA derivation)
    /// CHECK: Only used for ATA derivation
    #[account(address = contract.sender)]
    pub sender: AccountInfo<'info>,
    
    /// Recipient account (for ATA derivation)
    /// CHECK: Only used for ATA derivation
    #[account(address = contract.recipient)]
    pub recipient: AccountInfo<'info>,
    
    /// Token program
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Cancel>) -> Result<()> {
    let contract = &ctx.accounts.contract;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check contract can be canceled
    let state = contract.state();
    require!(
        state == ContractState::Active || state == ContractState::Scheduled || state == ContractState::Paused,
        MemeLockError::ContractNotActive
    );
    
    // Check permission
    require!(
        contract.can_cancel(&ctx.accounts.signer.key()),
        MemeLockError::CancelNotPermitted
    );
    
    // Calculate settlement amounts
    // Unlocked portion goes to recipient, locked portion returns to sender
    let unlocked = contract.calculate_unlocked(now);
    let unlocked_unclaimed = unlocked.saturating_sub(contract.withdrawn_amount);
    let locked_remaining = contract.total_amount.saturating_sub(unlocked);
    
    // Build signer seeds
    let sender_key = contract.sender;
    let mint_key = ctx.accounts.mint.key();
    let nonce = contract.created_at.to_le_bytes();
    let bump = [contract.bump];
    
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"contract",
        sender_key.as_ref(),
        mint_key.as_ref(),
        nonce.as_ref(),
        bump.as_ref(),
    ]];
    
    // Transfer unlocked portion to recipient
    if unlocked_unclaimed > 0 {
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
        
        transfer_checked(cpi_ctx, unlocked_unclaimed, ctx.accounts.mint.decimals)?;
    }
    
    // Transfer locked portion back to sender
    if locked_remaining > 0 {
        let transfer_accounts = TransferChecked {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.sender_token_account.to_account_info(),
            authority: ctx.accounts.contract.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        
        transfer_checked(cpi_ctx, locked_remaining, ctx.accounts.mint.decimals)?;
    }
    
    // Close escrow account (return rent to signer)
    let close_accounts = CloseAccount {
        account: ctx.accounts.escrow_token_account.to_account_info(),
        destination: ctx.accounts.signer.to_account_info(),
        authority: ctx.accounts.contract.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_accounts,
        signer_seeds,
    );
    
    close_account(cpi_ctx)?;
    
    // Update contract state
    let contract = &mut ctx.accounts.contract;
    contract.state = ContractState::Canceled as u8;
    contract.withdrawn_amount = contract.withdrawn_amount.saturating_add(unlocked_unclaimed);
    
    msg!(
        "Contract canceled: {} to recipient, {} returned to sender",
        unlocked_unclaimed,
        locked_remaining
    );
    
    // Emit event
    emit!(ContractCanceled {
        contract: ctx.accounts.contract.key(),
        canceled_by: ctx.accounts.signer.key(),
        unlocked_to_recipient: unlocked_unclaimed,
        locked_to_sender: locked_remaining,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct ContractCanceled {
    pub contract: Pubkey,
    pub canceled_by: Pubkey,
    pub unlocked_to_recipient: u64,
    pub locked_to_sender: u64,
    pub timestamp: i64,
}

