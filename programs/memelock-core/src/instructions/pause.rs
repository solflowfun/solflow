use anchor_lang::prelude::*;

use crate::state::{Contract, ContractState};
use crate::error::MemeLockError;

#[derive(Accounts)]
pub struct Pause<'info> {
    /// Sender who can pause the contract
    pub sender: Signer<'info>,
    
    /// Contract PDA
    #[account(
        mut,
        has_one = sender,
        seeds = [
            b"contract",
            contract.sender.as_ref(),
            contract.mint.as_ref(),
            contract.created_at.to_le_bytes().as_ref(),
        ],
        bump = contract.bump,
    )]
    pub contract: Account<'info, Contract>,
}

pub fn handler(ctx: Context<Pause>) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check contract is pausable
    require!(contract.pausable, MemeLockError::NotPausable);
    
    // Check contract state
    let state = contract.state();
    require!(
        state == ContractState::Active,
        MemeLockError::ContractNotActive
    );
    
    // Check not already paused
    require!(contract.paused_at == 0, MemeLockError::AlreadyPaused);
    
    // Pause the contract
    contract.state = ContractState::Paused as u8;
    contract.paused_at = now;
    
    msg!("Contract paused at {}", now);
    
    // Emit event
    emit!(ContractPaused {
        contract: ctx.accounts.contract.key(),
        paused_by: ctx.accounts.sender.key(),
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct ContractPaused {
    pub contract: Pubkey,
    pub paused_by: Pubkey,
    pub timestamp: i64,
}

