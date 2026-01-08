use anchor_lang::prelude::*;

/// Maximum URL length
pub const MAX_URL_LEN: usize = 128;
/// Maximum project name length
pub const MAX_PROJECT_NAME_LEN: usize = 64;

/// Contract metadata (optional, for enhanced UX)
#[account]
pub struct ContractMetadata {
    /// Contract this metadata belongs to
    pub contract: Pubkey,
    
    /// Bump seed
    pub bump: u8,
    
    /// Title/name of the lock
    pub title: String,
    
    /// Description/memo
    pub memo: String,
    
    /// Project name (for grouping)
    pub project_name: String,
    
    /// Project website
    pub website: String,
    
    /// Twitter/X handle
    pub twitter: String,
    
    /// Discord invite link
    pub discord: String,
    
    /// Telegram link
    pub telegram: String,
    
    /// Token logo URL
    pub logo_url: String,
    
    /// Whether this is a "verified" project (admin-set)
    pub verified: bool,
    
    /// Reserved
    pub _reserved: [u8; 64],
}

impl ContractMetadata {
    pub const LEN: usize = 8 + // discriminator
        32 + // contract
        1 + // bump
        (4 + 64) + // title (String with max length)
        (4 + 256) + // memo
        (4 + 64) + // project_name
        (4 + 128) + // website
        (4 + 64) + // twitter
        (4 + 128) + // discord
        (4 + 128) + // telegram
        (4 + 256) + // logo_url
        1 + // verified
        64; // reserved
    
    pub const SEED: &'static [u8] = b"metadata";
}

/// Project account - aggregates multiple contracts under one project
#[account]
pub struct Project {
    /// Project slug (URL-friendly identifier)
    pub slug: String,
    
    /// Bump seed
    pub bump: u8,
    
    /// Project owner/admin
    pub owner: Pubkey,
    
    /// Project name
    pub name: String,
    
    /// Description
    pub description: String,
    
    /// Website URL
    pub website: String,
    
    /// Twitter handle
    pub twitter: String,
    
    /// Logo URL
    pub logo_url: String,
    
    /// Whether verified by protocol admin
    pub verified: bool,
    
    /// Number of contracts associated
    pub contract_count: u32,
    
    /// Total value locked across all contracts
    pub total_value_locked: u64,
    
    /// Created at timestamp
    pub created_at: i64,
    
    /// Reserved
    pub _reserved: [u8; 64],
}

impl Project {
    pub const LEN: usize = 8 + // discriminator
        (4 + 32) + // slug
        1 + // bump
        32 + // owner
        (4 + 64) + // name
        (4 + 256) + // description
        (4 + 128) + // website
        (4 + 64) + // twitter
        (4 + 256) + // logo_url
        1 + // verified
        4 + // contract_count
        8 + // total_value_locked
        8 + // created_at
        64; // reserved
    
    pub const SEED: &'static [u8] = b"project";
}

