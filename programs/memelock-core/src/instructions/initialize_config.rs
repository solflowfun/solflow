use anchor_lang::prelude::*;

use crate::state::Config;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ConfigParams {
    /// Admin authority
    pub admin: Pubkey,
    /// Treasury address
    pub treasury: Pubkey,
    /// Oracle signer for yield boost attestations
    pub oracle_signer: Pubkey,
    /// Protocol fee in basis points
    pub protocol_fee_bps: u16,
    /// Flat creation fee in lamports
    pub creation_fee_lamports: u64,
    /// Auto-claim setup fee
    pub auto_claim_setup_fee: u64,
    /// Auto-claim per-withdraw fee
    pub auto_claim_withdraw_fee: u64,
    /// Yield boost fee in basis points
    pub yield_boost_fee_bps: u16,
    /// Minimum lock duration in seconds
    pub min_lock_duration: u64,
    /// Maximum lock duration in seconds
    pub max_lock_duration: u64,
    /// Whether yield boost is enabled
    pub yield_boost_enabled: bool,
}

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    /// Admin initializing the config
    #[account(mut)]
    pub admin: Signer<'info>,
    
    /// Config PDA (singleton)
    #[account(
        init,
        payer = admin,
        space = Config::LEN,
        seeds = [Config::SEED],
        bump,
    )]
    pub config: Account<'info, Config>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeConfig>, params: ConfigParams) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    config.version = 1;
    config.bump = ctx.bumps.config;
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
    config.paused = false;
    config.yield_boost_enabled = params.yield_boost_enabled;
    config.total_contracts = 0;
    config.total_value_locked_usd = 0;
    
    msg!("Config initialized with admin: {}", params.admin);
    
    Ok(())
}

