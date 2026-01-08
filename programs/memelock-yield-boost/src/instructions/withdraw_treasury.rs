use anchor_lang::prelude::*;

use crate::state::{YieldBoostConfig, Treasury};
use crate::error::YieldBoostError;

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    /// Admin withdrawing funds
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// Config
    #[account(
        seeds = [YieldBoostConfig::SEED],
        bump = config.bump,
        has_one = admin @ YieldBoostError::Unauthorized,
    )]
    pub config: Account<'info, YieldBoostConfig>,
    
    /// Treasury PDA
    #[account(
        mut,
        seeds = [YieldBoostConfig::TREASURY_SEED],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,
    
    /// Destination account
    /// CHECK: Admin-specified destination
    #[account(mut)]
    pub destination: AccountInfo<'info>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    
    // Calculate available balance (total deposited minus what's staked)
    let available = ctx.accounts.treasury.to_account_info().lamports()
        .saturating_sub(treasury.total_staked);
    
    require!(amount <= available, YieldBoostError::InsufficientTreasury);
    
    // Transfer SOL from treasury to destination
    let treasury_bump = treasury.bump;
    
    **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? -= amount;
    **ctx.accounts.destination.try_borrow_mut_lamports()? += amount;
    
    // Update stats
    treasury.total_withdrawn = treasury.total_withdrawn.saturating_add(amount);
    
    msg!("Withdrew {} lamports from treasury", amount);
    
    emit!(TreasuryWithdrawn {
        admin: ctx.accounts.admin.key(),
        destination: ctx.accounts.destination.key(),
        amount,
        total_withdrawn: treasury.total_withdrawn,
    });
    
    Ok(())
}

#[event]
pub struct TreasuryWithdrawn {
    pub admin: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
    pub total_withdrawn: u64,
}

