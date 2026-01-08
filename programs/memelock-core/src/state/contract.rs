use anchor_lang::prelude::*;

/// Maximum title length in bytes
pub const MAX_TITLE_LEN: usize = 64;
/// Maximum memo length in bytes  
pub const MAX_MEMO_LEN: usize = 256;

/// Contract type - Lock (single unlock) or Vesting (progressive unlock)
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ContractKind {
    /// Single unlock at end timestamp - irreversible
    Lock,
    /// Progressive unlock with schedule
    Vesting,
}

/// Contract state
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ContractState {
    /// Created but start time hasn't been reached yet
    Scheduled,
    /// Currently active and potentially unlocking
    Active,
    /// Paused - no unlocking happens
    Paused,
    /// Fully unlocked and all tokens withdrawn
    Completed,
    /// Canceled by permitted party
    Canceled,
}

/// Permission mode for cancel/transfer operations
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum PermissionMode {
    /// Neither party can perform the action
    Neither,
    /// Only sender can perform
    Sender,
    /// Only recipient can perform
    Recipient,
    /// Either party can perform
    Both,
}

/// Unlock interval for vesting schedules
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum UnlockInterval {
    /// Every second (continuous)
    Second,
    /// Every minute
    Minute,
    /// Every hour
    Hourly,
    /// Every day (86400 seconds)
    Daily,
    /// Every week (604800 seconds)
    Weekly,
    /// Every 30 days (2592000 seconds)
    Monthly,
    /// Every 90 days (7776000 seconds)
    Quarterly,
    /// Every 365 days (31536000 seconds)
    Yearly,
    /// Custom interval in seconds
    Custom { seconds: u64 },
}

impl UnlockInterval {
    pub fn to_seconds(&self) -> u64 {
        match self {
            UnlockInterval::Second => 1,
            UnlockInterval::Minute => 60,
            UnlockInterval::Hourly => 3600,
            UnlockInterval::Daily => 86400,
            UnlockInterval::Weekly => 604800,
            UnlockInterval::Monthly => 2592000,
            UnlockInterval::Quarterly => 7776000,
            UnlockInterval::Yearly => 31536000,
            UnlockInterval::Custom { seconds } => *seconds,
        }
    }
}

/// Main contract account - stores all lock/vesting state
#[account]
#[derive(Default)]
pub struct Contract {
    /// Version for future upgrades
    pub version: u8,
    
    /// Lock or Vesting
    pub kind: u8, // Stored as u8 for space efficiency
    
    /// Current state
    pub state: u8,
    
    /// Bump seed for PDA derivation
    pub bump: u8,
    
    /// Token mint being locked
    pub mint: Pubkey,
    
    /// Who created and funded the lock
    pub sender: Pubkey,
    
    /// Who can claim unlocked tokens
    pub recipient: Pubkey,
    
    /// Escrow token account holding locked tokens (PDA)
    pub escrow_token_account: Pubkey,
    
    /// Unix timestamp when contract starts (can be future)
    pub start_ts: i64,
    
    /// Unix timestamp when contract fully unlocks
    pub end_ts: i64,
    
    /// Unlock interval in seconds (0 for locks)
    pub unlock_interval_seconds: u64,
    
    /// Cliff amount (absolute, not percentage)
    pub cliff_amount: u64,
    
    /// Total tokens locked
    pub total_amount: u64,
    
    /// Tokens already withdrawn
    pub withdrawn_amount: u64,
    
    /// Timestamp when contract was created
    pub created_at: i64,
    
    /// Timestamp when last withdrawal occurred
    pub last_withdrawn_at: i64,
    
    /// Cancel permission mode
    pub cancelable_by: u8,
    
    /// Recipient transfer permission mode
    pub transferable_by: u8,
    
    /// Whether contract can be paused (vesting only)
    pub pausable: bool,
    
    /// Timestamp when paused (0 if not paused)
    pub paused_at: i64,
    
    /// Total time spent paused (for accurate unlock calculations)
    pub total_paused_duration: u64,
    
    /// Whether yield boost is enabled for this contract
    pub yield_boost_enabled: bool,
    
    /// Yield boost account if enabled
    pub yield_boost_account: Pubkey,
    
    /// Auto-claim enabled
    pub auto_claim_enabled: bool,
    
    /// Reserved space for future upgrades
    pub _reserved: [u8; 64],
}

impl Contract {
    pub const LEN: usize = 8 + // discriminator
        1 + // version
        1 + // kind
        1 + // state
        1 + // bump
        32 + // mint
        32 + // sender
        32 + // recipient
        32 + // escrow_token_account
        8 + // start_ts
        8 + // end_ts
        8 + // unlock_interval_seconds
        8 + // cliff_amount
        8 + // total_amount
        8 + // withdrawn_amount
        8 + // created_at
        8 + // last_withdrawn_at
        1 + // cancelable_by
        1 + // transferable_by
        1 + // pausable
        8 + // paused_at
        8 + // total_paused_duration
        1 + // yield_boost_enabled
        32 + // yield_boost_account
        1 + // auto_claim_enabled
        64; // reserved
    
    pub fn kind(&self) -> ContractKind {
        match self.kind {
            0 => ContractKind::Lock,
            _ => ContractKind::Vesting,
        }
    }
    
    pub fn state(&self) -> ContractState {
        match self.state {
            0 => ContractState::Scheduled,
            1 => ContractState::Active,
            2 => ContractState::Paused,
            3 => ContractState::Completed,
            _ => ContractState::Canceled,
        }
    }
    
    pub fn cancelable_by(&self) -> PermissionMode {
        match self.cancelable_by {
            0 => PermissionMode::Neither,
            1 => PermissionMode::Sender,
            2 => PermissionMode::Recipient,
            _ => PermissionMode::Both,
        }
    }
    
    pub fn transferable_by(&self) -> PermissionMode {
        match self.transferable_by {
            0 => PermissionMode::Neither,
            1 => PermissionMode::Sender,
            2 => PermissionMode::Recipient,
            _ => PermissionMode::Both,
        }
    }
    
    /// Calculate unlocked amount at a given timestamp
    pub fn calculate_unlocked(&self, now: i64) -> u64 {
        // Handle paused state
        if self.state() == ContractState::Paused {
            return self.calculate_unlocked_internal(self.paused_at);
        }
        
        // Adjust for total paused time
        let effective_now = if self.total_paused_duration > 0 {
            now - self.total_paused_duration as i64
        } else {
            now
        };
        
        self.calculate_unlocked_internal(effective_now)
    }
    
    fn calculate_unlocked_internal(&self, now: i64) -> u64 {
        // Not started yet
        if now < self.start_ts {
            return 0;
        }
        
        // Fully unlocked
        if now >= self.end_ts {
            return self.total_amount;
        }
        
        match self.kind() {
            ContractKind::Lock => {
                // Single unlock - nothing until end
                0
            }
            ContractKind::Vesting => {
                if self.unlock_interval_seconds == 0 {
                    return 0;
                }
                
                let elapsed = (now - self.start_ts) as u64;
                let total_duration = (self.end_ts - self.start_ts) as u64;
                
                // Calculate intervals
                let elapsed_intervals = elapsed / self.unlock_interval_seconds;
                let total_intervals = total_duration / self.unlock_interval_seconds;
                
                if total_intervals == 0 {
                    return 0;
                }
                
                // Base amount without cliff
                let base_amount = self.total_amount.saturating_sub(self.cliff_amount);
                
                // Linear vesting of base amount
                let vested_base = if elapsed_intervals >= total_intervals {
                    base_amount
                } else {
                    base_amount
                        .checked_mul(elapsed_intervals)
                        .unwrap_or(0)
                        .checked_div(total_intervals)
                        .unwrap_or(0)
                };
                
                // Cliff is unlocked at first interval
                let cliff = if elapsed_intervals > 0 {
                    self.cliff_amount
                } else {
                    0
                };
                
                vested_base.saturating_add(cliff)
            }
        }
    }
    
    /// Calculate claimable amount (unlocked minus already withdrawn)
    pub fn calculate_claimable(&self, now: i64) -> u64 {
        self.calculate_unlocked(now).saturating_sub(self.withdrawn_amount)
    }
    
    /// Check if a party can cancel
    pub fn can_cancel(&self, signer: &Pubkey) -> bool {
        match self.cancelable_by() {
            PermissionMode::Neither => false,
            PermissionMode::Sender => *signer == self.sender,
            PermissionMode::Recipient => *signer == self.recipient,
            PermissionMode::Both => *signer == self.sender || *signer == self.recipient,
        }
    }
    
    /// Check if a party can transfer recipient
    pub fn can_transfer_recipient(&self, signer: &Pubkey) -> bool {
        match self.transferable_by() {
            PermissionMode::Neither => false,
            PermissionMode::Sender => *signer == self.sender,
            PermissionMode::Recipient => *signer == self.recipient,
            PermissionMode::Both => *signer == self.sender || *signer == self.recipient,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_contract(kind: ContractKind, total: u64, cliff: u64, interval: u64) -> Contract {
        Contract {
            version: 1,
            kind: if kind == ContractKind::Lock { 0 } else { 1 },
            state: 1, // Active
            bump: 255,
            mint: Pubkey::default(),
            sender: Pubkey::default(),
            recipient: Pubkey::default(),
            escrow_token_account: Pubkey::default(),
            start_ts: 1000,
            end_ts: 2000,
            unlock_interval_seconds: interval,
            cliff_amount: cliff,
            total_amount: total,
            withdrawn_amount: 0,
            created_at: 1000,
            last_withdrawn_at: 0,
            cancelable_by: 1,
            transferable_by: 1,
            pausable: true,
            paused_at: 0,
            total_paused_duration: 0,
            yield_boost_enabled: false,
            yield_boost_account: Pubkey::default(),
            auto_claim_enabled: false,
            _reserved: [0; 64],
        }
    }

    #[test]
    fn test_lock_unlocked_before_end() {
        let contract = create_test_contract(ContractKind::Lock, 1000, 0, 0);
        assert_eq!(contract.calculate_unlocked(500), 0);
        assert_eq!(contract.calculate_unlocked(1500), 0);
        assert_eq!(contract.calculate_unlocked(1999), 0);
    }

    #[test]
    fn test_lock_unlocked_at_end() {
        let contract = create_test_contract(ContractKind::Lock, 1000, 0, 0);
        assert_eq!(contract.calculate_unlocked(2000), 1000);
        assert_eq!(contract.calculate_unlocked(3000), 1000);
    }

    #[test]
    fn test_vesting_linear() {
        // 1000 tokens over 1000 seconds, 100 second intervals = 10 intervals
        let contract = create_test_contract(ContractKind::Vesting, 1000, 0, 100);
        
        assert_eq!(contract.calculate_unlocked(500), 0); // Before start
        assert_eq!(contract.calculate_unlocked(1000), 0); // At start, 0 intervals elapsed
        assert_eq!(contract.calculate_unlocked(1100), 100); // 1 interval
        assert_eq!(contract.calculate_unlocked(1500), 500); // 5 intervals
        assert_eq!(contract.calculate_unlocked(2000), 1000); // All unlocked
    }

    #[test]
    fn test_vesting_with_cliff() {
        // 1000 tokens, 200 cliff, over 1000 seconds, 100 second intervals
        let contract = create_test_contract(ContractKind::Vesting, 1000, 200, 100);
        
        assert_eq!(contract.calculate_unlocked(1000), 0); // At start, no cliff yet
        assert_eq!(contract.calculate_unlocked(1100), 280); // 200 cliff + 80 (800/10)
        assert_eq!(contract.calculate_unlocked(1500), 600); // 200 cliff + 400 (800*5/10)
        assert_eq!(contract.calculate_unlocked(2000), 1000); // All unlocked
    }
}

