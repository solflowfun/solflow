use anchor_lang::prelude::*;

/// Protocol configuration account (singleton)
#[account]
#[derive(Default)]
pub struct Config {
    /// Version for future upgrades
    pub version: u8,
    
    /// Bump seed for PDA
    pub bump: u8,
    
    /// Admin authority that can update config
    pub admin: Pubkey,
    
    /// Treasury address for protocol fees
    pub treasury: Pubkey,
    
    /// Oracle signer pubkey for yield boost attestations
    pub oracle_signer: Pubkey,
    
    /// Protocol fee in basis points (e.g., 50 = 0.5%)
    pub protocol_fee_bps: u16,
    
    /// Flat creation fee in lamports
    pub creation_fee_lamports: u64,
    
    /// Auto-claim setup fee in lamports
    pub auto_claim_setup_fee: u64,
    
    /// Auto-claim per-withdraw fee in lamports
    pub auto_claim_withdraw_fee: u64,
    
    /// Yield boost fee in basis points (applied to buy value)
    pub yield_boost_fee_bps: u16,
    
    /// Minimum lock duration in seconds
    pub min_lock_duration: u64,
    
    /// Maximum lock duration in seconds
    pub max_lock_duration: u64,
    
    /// Whether protocol is paused
    pub paused: bool,
    
    /// Whether yield boost feature is enabled
    pub yield_boost_enabled: bool,
    
    /// Total contracts created (for analytics)
    pub total_contracts: u64,
    
    /// Total tokens locked (by USD value at creation)
    pub total_value_locked_usd: u64,
    
    /// Reserved space for future upgrades
    pub _reserved: [u8; 128],
}

impl Config {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        1 + // bump
        32 + // admin
        32 + // treasury
        32 + // oracle_signer
        2 + // protocol_fee_bps
        8 + // creation_fee_lamports
        8 + // auto_claim_setup_fee
        8 + // auto_claim_withdraw_fee
        2 + // yield_boost_fee_bps
        8 + // min_lock_duration
        8 + // max_lock_duration
        1 + // paused
        1 + // yield_boost_enabled
        8 + // total_contracts
        8 + // total_value_locked_usd
        128; // reserved
    
    pub const SEED: &'static [u8] = b"config";
}

/// Auto-claim configuration for a contract
#[account]
pub struct AutoClaimConfig {
    /// Contract this config belongs to
    pub contract: Pubkey,
    
    /// Bump seed
    pub bump: u8,
    
    /// Whether auto-claim is active
    pub active: bool,
    
    /// Minimum amount to trigger auto-claim
    pub min_claim_amount: u64,
    
    /// Total fees prepaid by sender
    pub prepaid_fees: u64,
    
    /// Fees used so far
    pub fees_used: u64,
    
    /// Number of auto-claims executed
    pub claims_executed: u32,
    
    /// Last auto-claim timestamp
    pub last_claim_at: i64,
    
    /// Reserved
    pub _reserved: [u8; 32],
}

impl AutoClaimConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // contract
        1 + // bump
        1 + // active
        8 + // min_claim_amount
        8 + // prepaid_fees
        8 + // fees_used
        4 + // claims_executed
        8 + // last_claim_at
        32; // reserved
    
    pub const SEED: &'static [u8] = b"auto_claim";
}

