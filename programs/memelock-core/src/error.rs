use anchor_lang::prelude::*;

#[error_code]
pub enum MemeLockError {
    // General errors
    #[msg("Protocol is currently paused")]
    ProtocolPaused,
    
    #[msg("Unauthorized operation")]
    Unauthorized,
    
    #[msg("Invalid parameter provided")]
    InvalidParameter,
    
    #[msg("Arithmetic overflow occurred")]
    MathOverflow,
    
    // Contract creation errors
    #[msg("Invalid unlock timestamp - must be in the future")]
    InvalidUnlockTime,
    
    #[msg("Start time must be before or equal to end time")]
    StartAfterEnd,
    
    #[msg("Lock duration is too short")]
    DurationTooShort,
    
    #[msg("Lock duration exceeds maximum allowed")]
    DurationTooLong,
    
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    
    #[msg("Cliff amount cannot exceed total amount")]
    CliffExceedsTotal,
    
    #[msg("Invalid unlock interval")]
    InvalidInterval,
    
    #[msg("Unlock interval must divide evenly into duration")]
    IntervalNotDivisible,
    
    // Contract state errors
    #[msg("Contract is not active")]
    ContractNotActive,
    
    #[msg("Contract has already ended")]
    ContractEnded,
    
    #[msg("Contract has not started yet")]
    ContractNotStarted,
    
    #[msg("Contract is already paused")]
    AlreadyPaused,
    
    #[msg("Contract is not paused")]
    NotPaused,
    
    #[msg("Contract cannot be paused")]
    NotPausable,
    
    #[msg("Contract is already canceled")]
    AlreadyCanceled,
    
    #[msg("Contract is already completed")]
    AlreadyCompleted,
    
    // Withdrawal errors
    #[msg("No tokens available to withdraw")]
    NothingToWithdraw,
    
    #[msg("Insufficient unlocked balance")]
    InsufficientUnlocked,
    
    #[msg("Withdrawal amount exceeds claimable balance")]
    WithdrawalExceedsClaimable,
    
    // Permission errors
    #[msg("Cancellation is not permitted for this contract")]
    CancelNotPermitted,
    
    #[msg("Recipient transfer is not permitted for this contract")]
    TransferNotPermitted,
    
    #[msg("Only the sender can perform this action")]
    SenderOnly,
    
    #[msg("Only the recipient can perform this action")]
    RecipientOnly,
    
    #[msg("Only admin can perform this action")]
    AdminOnly,
    
    // Token errors
    #[msg("Invalid token mint")]
    InvalidMint,
    
    #[msg("Invalid token account owner")]
    InvalidTokenOwner,
    
    #[msg("Token account mint mismatch")]
    MintMismatch,
    
    // Yield boost errors
    #[msg("Yield boost is not enabled for this contract")]
    YieldBoostNotEnabled,
    
    #[msg("Yield boost is already enabled")]
    YieldBoostAlreadyEnabled,
    
    #[msg("Invalid oracle attestation")]
    InvalidAttestation,
    
    #[msg("Attestation has expired")]
    AttestationExpired,
    
    #[msg("Fee amount does not match expected")]
    FeeMismatch,
    
    // Auto-claim errors
    #[msg("Auto-claim is not enabled for this contract")]
    AutoClaimNotEnabled,
    
    #[msg("Auto-claim is already enabled")]
    AutoClaimAlreadyEnabled,
    
    #[msg("Insufficient prepaid fees for auto-claim")]
    InsufficientAutoClaimFees,
    
    // Metadata errors
    #[msg("Title exceeds maximum length")]
    TitleTooLong,
    
    #[msg("Memo exceeds maximum length")]
    MemoTooLong,
    
    #[msg("URL exceeds maximum length")]
    UrlTooLong,
    
    #[msg("Project name exceeds maximum length")]
    ProjectNameTooLong,
    
    #[msg("Project slug is already taken")]
    ProjectSlugTaken,
}

