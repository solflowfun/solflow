use anchor_lang::prelude::*;

use crate::state::YieldBoostConfig;
use crate::error::YieldBoostError;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateConfigParams {
    pub admin: Option<Pubkey>,
    pub oracle_signer: Option<Pubkey>,
    pub lst_mint: Option<Pubkey>,
    pub fee_bps: Option<u16>,
    pub min_fee_lamports: Option<u64>,
    pub max_fee_lamports: Option<u64>,
    pub max_boost_per_contract: Option<u64>,
    pub max_daily_allocation: Option<u64>,
    pub min_lock_duration: Option<u64>,
    pub model_b_enabled: Option<bool>,
    pub protocol_yield_share_bps: Option<u16>,
    pub paused: Option<bool>,
}

#[derive(Accounts)]
pub struct UpdateBoostConfig<'info> {
    /// Admin updating config
    pub admin: Signer<'info>,
    
    /// Config PDA
    #[account(
        mut,
        seeds = [YieldBoostConfig::SEED],
        bump = config.bump,
        has_one = admin @ YieldBoostError::Unauthorized,
    )]
    pub config: Account<'info, YieldBoostConfig>,
}

pub fn handler(ctx: Context<UpdateBoostConfig>, params: UpdateConfigParams) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    // Update optional fields
    if let Some(admin) = params.admin {
        config.admin = admin;
    }
    if let Some(oracle_signer) = params.oracle_signer {
        config.oracle_signer = oracle_signer;
    }
    if let Some(lst_mint) = params.lst_mint {
        config.lst_mint = lst_mint;
    }
    if let Some(fee_bps) = params.fee_bps {
        config.fee_bps = fee_bps;
    }
    if let Some(min_fee_lamports) = params.min_fee_lamports {
        config.min_fee_lamports = min_fee_lamports;
    }
    if let Some(max_fee_lamports) = params.max_fee_lamports {
        config.max_fee_lamports = max_fee_lamports;
    }
    if let Some(max_boost_per_contract) = params.max_boost_per_contract {
        config.max_boost_per_contract = max_boost_per_contract;
    }
    if let Some(max_daily_allocation) = params.max_daily_allocation {
        config.max_daily_allocation = max_daily_allocation;
    }
    if let Some(min_lock_duration) = params.min_lock_duration {
        config.min_lock_duration = min_lock_duration;
    }
    if let Some(model_b_enabled) = params.model_b_enabled {
        config.model_b_enabled = model_b_enabled;
    }
    if let Some(protocol_yield_share_bps) = params.protocol_yield_share_bps {
        config.protocol_yield_share_bps = protocol_yield_share_bps;
    }
    if let Some(paused) = params.paused {
        config.paused = paused;
    }
    
    msg!("Yield boost config updated");
    
    Ok(())
}

