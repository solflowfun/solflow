use anchor_lang::prelude::*;

use crate::state::Config;
use crate::error::MemeLockError;
use super::initialize_config::ConfigParams;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    /// Admin updating the config
    pub admin: Signer<'info>,
    
    /// Config PDA
    #[account(
        mut,
        seeds = [Config::SEED],
        bump = config.bump,
        has_one = admin @ MemeLockError::AdminOnly,
    )]
    pub config: Account<'info, Config>,
}

pub fn handler(ctx: Context<UpdateConfig>, params: ConfigParams) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    // Update all configurable parameters
    config.admin = params.admin;
    config.treasury = params.treasury;
    config.oracle_signer = params.oracle_signer;
    config.protocol_fee_bps = params.protocol_fee_bps;
    config.creation_fee_lamports = params.creation_fee_lamports;
    config.auto_claim_setup_fee = params.auto_claim_setup_fee;
    config.auto_claim_withdraw_fee = params.auto_claim_withdraw_fee;
    config.yield_boost_fee_bps = params.yield_boost_fee_bps;
    config.min_lock_duration = params.min_lock_duration;
    config.max_lock_duration = params.max_lock_duration;
    config.yield_boost_enabled = params.yield_boost_enabled;
    
    msg!("Config updated");
    
    emit!(ConfigUpdated {
        admin: params.admin,
        treasury: params.treasury,
        protocol_fee_bps: params.protocol_fee_bps,
        yield_boost_fee_bps: params.yield_boost_fee_bps,
    });
    
    Ok(())
}

#[event]
pub struct ConfigUpdated {
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub protocol_fee_bps: u16,
    pub yield_boost_fee_bps: u16,
}

