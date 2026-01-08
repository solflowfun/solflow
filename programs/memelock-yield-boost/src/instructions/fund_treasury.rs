use anchor_lang::prelude::*;

use crate::state::{YieldBoostConfig, Treasury};

#[derive(Accounts)]
pub struct FundTreasury<'info> {
    /// Depositor adding funds
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    /// Config
    #[account(
        seeds = [YieldBoostConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, YieldBoostConfig>,
    
    /// Treasury PDA
    #[account(
        mut,
        seeds = [YieldBoostConfig::TREASURY_SEED],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<FundTreasury>, amount: u64) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    
    // Transfer SOL to treasury
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.depositor.key(),
        &ctx.accounts.treasury.key(),
        amount,
    );
    
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.depositor.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
        ],
    )?;
    
    // Update stats
    treasury.total_deposited = treasury.total_deposited.saturating_add(amount);
    
    msg!("Treasury funded with {} lamports", amount);
    
    emit!(TreasuryFunded {
        depositor: ctx.accounts.depositor.key(),
        amount,
        total_deposited: treasury.total_deposited,
    });
    
    Ok(())
}

#[event]
pub struct TreasuryFunded {
    pub depositor: Pubkey,
    pub amount: u64,
    pub total_deposited: u64,
}

