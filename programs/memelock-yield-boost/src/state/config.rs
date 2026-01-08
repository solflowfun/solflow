use anchor_lang::prelude::*;

/// Yield boost program configuration
#[account]
#[derive(Default)]
pub struct YieldBoostConfig {
    /// Version for upgrades
    pub version: u8,
    
    /// Bump seed
    pub bump: u8,
    
    /// Admin authority
    pub admin: Pubkey,
    
    /// Treasury PDA that holds SOL for matching
    pub treasury: Pubkey,
    
    /// Treasury bump
    pub treasury_bump: u8,
    
    /// Oracle signer pubkey for attestation verification
    pub oracle_signer: Pubkey,
    
    /// Fee in basis points applied to attested buy value
    pub fee_bps: u16,
    
    /// LST mint to use (e.g., JitoSOL, mSOL)
    pub lst_mint: Pubkey,
    
    /// Minimum fee in lamports
    pub min_fee_lamports: u64,
    
    /// Maximum fee in lamports (cap)
    pub max_fee_lamports: u64,
    
    /// Maximum boost per contract in lamports
    pub max_boost_per_contract: u64,
    
    /// Maximum daily boost allocation in lamports
    pub max_daily_allocation: u64,
    
    /// Today's allocation used
    pub daily_allocation_used: u64,
    
    /// Last allocation reset timestamp (day boundary)
    pub last_allocation_reset: i64,
    
    /// Minimum lock duration for yield boost eligibility
    pub min_lock_duration: u64,
    
    /// Whether Model B (principal + yield to user) is enabled
    pub model_b_enabled: bool,
    
    /// Protocol yield share in basis points (e.g., 1000 = 10%)
    pub protocol_yield_share_bps: u16,
    
    /// Total boosts created
    pub total_boosts: u64,
    
    /// Total SOL matched
    pub total_sol_matched: u64,
    
    /// Total yield distributed
    pub total_yield_distributed: u64,
    
    /// Whether program is paused
    pub paused: bool,
    
    /// Reserved space
    pub _reserved: [u8; 64],
}

impl YieldBoostConfig {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        1 + // bump
        32 + // admin
        32 + // treasury
        1 + // treasury_bump
        32 + // oracle_signer
        2 + // fee_bps
        32 + // lst_mint
        8 + // min_fee_lamports
        8 + // max_fee_lamports
        8 + // max_boost_per_contract
        8 + // max_daily_allocation
        8 + // daily_allocation_used
        8 + // last_allocation_reset
        8 + // min_lock_duration
        1 + // model_b_enabled
        2 + // protocol_yield_share_bps
        8 + // total_boosts
        8 + // total_sol_matched
        8 + // total_yield_distributed
        1 + // paused
        64; // reserved
    
    pub const SEED: &'static [u8] = b"yield_boost_config";
    pub const TREASURY_SEED: &'static [u8] = b"yield_boost_treasury";
}

/// Treasury account for holding SOL
#[account]
pub struct Treasury {
    /// Bump seed
    pub bump: u8,
    
    /// Total SOL deposited
    pub total_deposited: u64,
    
    /// Total SOL withdrawn
    pub total_withdrawn: u64,
    
    /// Total SOL currently staked (in LST form)
    pub total_staked: u64,
    
    /// Reserved
    pub _reserved: [u8; 32],
}

impl Treasury {
    pub const LEN: usize = 8 + // discriminator
        1 + // bump
        8 + // total_deposited
        8 + // total_withdrawn
        8 + // total_staked
        32; // reserved
}

