use anchor_lang::prelude::*;

use crate::state::{Contract, ContractState};
use crate::error::MemeLockError;

#[derive(Accounts)]
pub struct Unpause<'info> {
    /// Sender who can unpause the contract
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

pub fn handler(ctx: Context<Unpause>) -> Result<()> {
    let contract = &mut ctx.accounts.contract;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check contract state
    let state = contract.state();
    require!(state == ContractState::Paused, MemeLockError::NotPaused);
    
    // Calculate pause duration and add to total
    let pause_duration = (now - contract.paused_at) as u64;
    contract.total_paused_duration = contract.total_paused_duration.saturating_add(pause_duration);
    
    // Unpause the contract
    contract.state = ContractState::Active as u8;
    contract.paused_at = 0;
    
    msg!("Contract unpaused. Was paused for {} seconds", pause_duration);
    
    // Emit event
    emit!(ContractUnpaused {
        contract: ctx.accounts.contract.key(),
        unpaused_by: ctx.accounts.sender.key(),
        pause_duration,
        total_paused_duration: contract.total_paused_duration,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct ContractUnpaused {
    pub contract: Pubkey,
    pub unpaused_by: Pubkey,
    pub pause_duration: u64,
    pub total_paused_duration: u64,
    pub timestamp: i64,
}

