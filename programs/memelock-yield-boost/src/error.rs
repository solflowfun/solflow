use anchor_lang::prelude::*;

#[error_code]
pub enum YieldBoostError {
    // General errors
    #[msg("Protocol is currently paused")]
    ProtocolPaused,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Invalid parameter provided")]
    InvalidParameter,
    
    #[msg("Arithmetic overflow occurred")]
    MathOverflow,
    
    // Attestation errors
    #[msg("Invalid oracle attestation signature")]
    InvalidAttestation,
    
    #[msg("Attestation has expired")]
    AttestationExpired,
    
    #[msg("Attestation wallet mismatch")]
    AttestationWalletMismatch,
    
    #[msg("Attestation mint mismatch")]
    AttestationMintMismatch,
    
    #[msg("Attestation amount exceeds locked amount")]
    AttestationAmountMismatch,
    
    // Fee errors
    #[msg("Fee amount does not match expected")]
    FeeMismatch,
    
    #[msg("Fee is below minimum")]
    FeeBelowMinimum,
    
    #[msg("Fee exceeds maximum")]
    FeeExceedsMaximum,
    
    // Boost state errors
    #[msg("Yield boost already enabled for this contract")]
    BoostAlreadyEnabled,
    
    #[msg("Yield boost not enabled")]
    BoostNotEnabled,
    
    #[msg("Yield boost already funded")]
    BoostAlreadyFunded,
    
    #[msg("Yield boost not funded")]
    BoostNotFunded,
    
    #[msg("Yield boost already closed")]
    BoostAlreadyClosed,
    
    #[msg("Yield boost not mature yet")]
    BoostNotMature,
    
    #[msg("No yield available to claim")]
    NoYieldToClaim,
    
    #[msg("Too early to claim yield (minimum 7 days)")]
    TooEarlyToClaimYield,
    
    // Treasury errors
    #[msg("Insufficient treasury balance")]
    InsufficientTreasury,
    
    #[msg("Daily allocation limit exceeded")]
    DailyAllocationExceeded,
    
    #[msg("Boost amount exceeds per-contract limit")]
    BoostExceedsLimit,
    
    // Lock contract errors
    #[msg("Lock contract not active")]
    LockNotActive,
    
    #[msg("Lock duration too short for yield boost")]
    LockDurationTooShort,
    
    #[msg("Lock has already ended")]
    LockAlreadyEnded,
    
    // Model errors
    #[msg("Model B is not enabled")]
    ModelBNotEnabled,
    
    // LST errors
    #[msg("Invalid LST mint")]
    InvalidLstMint,
    
    #[msg("LST conversion failed")]
    LstConversionFailed,
}

