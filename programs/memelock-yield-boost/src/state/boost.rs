use anchor_lang::prelude::*;

/// Attestation data signed by oracle
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Attestation {
    /// Wallet that made the purchase
    pub wallet: Pubkey,
    /// Token mint purchased
    pub mint: Pubkey,
    /// Amount being locked (prorated if partial)
    pub amount_locked: u64,
    /// Computed buy value in lamports (SOL)
    pub buy_value_lamports: u64,
    /// Quote asset used (0 = SOL, 1 = USDC)
    pub quote_asset: u8,
    /// Hash of transaction signatures used
    pub txs_hash: [u8; 32],
    /// When attestation was issued
    pub issued_at: i64,
    /// When attestation expires
    pub expires_at: i64,
}

impl Attestation {
    /// Verify the attestation hasn't expired
    pub fn is_valid(&self, now: i64) -> bool {
        now < self.expires_at
    }
}

/// Boost state enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum BoostState {
    /// Enabled but not yet funded
    Pending,
    /// Funded and actively accruing yield
    Active,
    /// Yield claimed, waiting for close
    Claimed,
    /// Fully closed
    Closed,
    /// Canceled early
    Canceled,
}

/// Yield boost account linked to a lock/vesting contract
#[account]
#[derive(Default)]
pub struct YieldBoost {
    /// Version
    pub version: u8,
    
    /// Bump seed
    pub bump: u8,
    
    /// Current state
    pub state: u8,
    
    /// Associated lock/vesting contract
    pub contract: Pubkey,
    
    /// User who enabled boost
    pub user: Pubkey,
    
    /// Token mint being locked
    pub mint: Pubkey,
    
    /// Attested buy value in lamports
    pub buy_value_lamports: u64,
    
    /// Fee paid by user in lamports
    pub fee_paid: u64,
    
    /// Principal SOL matched by protocol (staked)
    pub principal_matched: u64,
    
    /// LST escrow token account
    pub lst_escrow: Pubkey,
    
    /// LST amount deposited at funding time
    pub lst_amount_deposited: u64,
    
    /// LST amount at last calculation (for yield tracking)
    pub lst_amount_last: u64,
    
    /// Yield accrued so far (in LST)
    pub yield_accrued: u64,
    
    /// Yield claimed so far (in lamports)
    pub yield_claimed: u64,
    
    /// Timestamp when boost was enabled
    pub enabled_at: i64,
    
    /// Timestamp when boost was funded
    pub funded_at: i64,
    
    /// Lock end timestamp (for maturity check)
    pub lock_end_ts: i64,
    
    /// Timestamp when yield was last calculated
    pub last_yield_calc_at: i64,
    
    /// Whether this is Model B (user gets principal + yield)
    pub is_model_b: bool,
    
    /// Hash of attestation transactions
    pub attestation_txs_hash: [u8; 32],
    
    /// Reserved
    pub _reserved: [u8; 64],
}

impl YieldBoost {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        1 + // bump
        1 + // state
        32 + // contract
        32 + // user
        32 + // mint
        8 + // buy_value_lamports
        8 + // fee_paid
        8 + // principal_matched
        32 + // lst_escrow
        8 + // lst_amount_deposited
        8 + // lst_amount_last
        8 + // yield_accrued
        8 + // yield_claimed
        8 + // enabled_at
        8 + // funded_at
        8 + // lock_end_ts
        8 + // last_yield_calc_at
        1 + // is_model_b
        32 + // attestation_txs_hash
        64; // reserved
    
    pub const SEED: &'static [u8] = b"yield_boost";
    pub const LST_ESCROW_SEED: &'static [u8] = b"lst_escrow";
    
    pub fn state(&self) -> BoostState {
        match self.state {
            0 => BoostState::Pending,
            1 => BoostState::Active,
            2 => BoostState::Claimed,
            3 => BoostState::Closed,
            _ => BoostState::Canceled,
        }
    }
    
    /// Check if boost is mature (lock has ended)
    pub fn is_mature(&self, now: i64) -> bool {
        now >= self.lock_end_ts
    }
    
    /// Minimum time before any yield can be claimed (anti-spam)
    pub const MIN_YIELD_CLAIM_DURATION: i64 = 7 * 24 * 60 * 60; // 7 days
    
    /// Check if enough time has passed for yield claim
    pub fn can_claim_yield(&self, now: i64) -> bool {
        now >= self.funded_at + Self::MIN_YIELD_CLAIM_DURATION
    }
}

