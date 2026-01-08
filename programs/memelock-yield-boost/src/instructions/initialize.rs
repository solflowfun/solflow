use anchor_lang::prelude::*;

use crate::state::{YieldBoostConfig, Treasury};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeParams {
    pub admin: Pubkey,
    pub oracle_signer: Pubkey,
    pub lst_mint: Pubkey,
    pub fee_bps: u16,
    pub min_fee_lamports: u64,
    pub max_fee_lamports: u64,
    pub max_boost_per_contract: u64,
    pub max_daily_allocation: u64,
    pub min_lock_duration: u64,
    pub protocol_yield_share_bps: u16,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Admin initializing the program
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// Config PDA
    #[account(
        init,
        payer = admin,
        space = YieldBoostConfig::LEN,
        seeds = [YieldBoostConfig::SEED],
        bump,
    )]
    pub config: Account<'info, YieldBoostConfig>,
    
    /// Treasury PDA
    #[account(
        init,
        payer = admin,
        space = Treasury::LEN,
        seeds = [YieldBoostConfig::TREASURY_SEED],
        bump,
    )]
    pub treasury: Account<'info, Treasury>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let treasury = &mut ctx.accounts.treasury;
    
    config.version = 1;
    config.bump = ctx.bumps.config;
    config.admin = params.admin;
    config.treasury = ctx.accounts.treasury.key();
    config.treasury_bump = ctx.bumps.treasury;
    config.oracle_signer = params.oracle_signer;
    config.fee_bps = params.fee_bps;
    config.lst_mint = params.lst_mint;
    config.min_fee_lamports = params.min_fee_lamports;
    config.max_fee_lamports = params.max_fee_lamports;
    config.max_boost_per_contract = params.max_boost_per_contract;
    config.max_daily_allocation = params.max_daily_allocation;
    config.daily_allocation_used = 0;
    config.last_allocation_reset = 0;
    config.min_lock_duration = params.min_lock_duration;
    config.model_b_enabled = false; // Model A by default (recommended)
    config.protocol_yield_share_bps = params.protocol_yield_share_bps;
    config.total_boosts = 0;
    config.total_sol_matched = 0;
    config.total_yield_distributed = 0;
    config.paused = false;
    
    treasury.bump = ctx.bumps.treasury;
    treasury.total_deposited = 0;
    treasury.total_withdrawn = 0;
    treasury.total_staked = 0;
    
    msg!("Yield boost program initialized with admin: {}", params.admin);
    
    Ok(())
}

