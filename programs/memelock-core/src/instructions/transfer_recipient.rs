use anchor_lang::prelude::*;

use crate::state::{Contract, ContractState};
use crate::error::MemeLockError;

#[derive(Accounts)]
pub struct TransferRecipient<'info> {
    /// Signer requesting transfer (must be permitted)
    pub signer: Signer<'info>,
    
    /// Contract PDA
    #[account(
        mut,
        seeds = [
            b"contract",
            contract.sender.as_ref(),
            contract.mint.as_ref(),
            contract.created_at.to_le_bytes().as_ref(),
        ],
        bump = contract.bump,
    )]
    pub contract: Account<'info, Contract>,
    
    /// New recipient address
    /// CHECK: Just storing the address
    pub new_recipient: AccountInfo<'info>,
}

pub fn handler(ctx: Context<TransferRecipient>) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check contract state allows transfer
    let state = contract.state();
    require!(
        state == ContractState::Active || state == ContractState::Scheduled || state == ContractState::Paused,
        MemeLockError::ContractNotActive
    );
    
    // Check permission
    require!(
        contract.can_transfer_recipient(&ctx.accounts.signer.key()),
        MemeLockError::TransferNotPermitted
    );
    
    let old_recipient = contract.recipient;
    let new_recipient = ctx.accounts.new_recipient.key();
    
    // Cannot transfer to same recipient
    require!(old_recipient != new_recipient, MemeLockError::InvalidParameter);
    
    // Update recipient
    contract.recipient = new_recipient;
    
    msg!("Recipient transferred from {} to {}", old_recipient, new_recipient);
    
    // Emit event
    emit!(RecipientTransferred {
        contract: ctx.accounts.contract.key(),
        transferred_by: ctx.accounts.signer.key(),
        old_recipient,
        new_recipient,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct RecipientTransferred {
    pub contract: Pubkey,
    pub transferred_by: Pubkey,
    pub old_recipient: Pubkey,
    pub new_recipient: Pubkey,
    pub timestamp: i64,
}

