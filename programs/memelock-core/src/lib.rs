use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("Mem1ockCorexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod memelock_core {
    use super::*;

    /// Create a new token lock with a single unlock timestamp
    pub fn create_lock(ctx: Context<CreateLock>, params: CreateLockParams) -> Result<()> {
        instructions::create_lock::handler(ctx, params)
    }

    /// Create a new vesting contract with progressive unlock schedule
    pub fn create_vesting(ctx: Context<CreateVesting>, params: CreateVestingParams) -> Result<()> {
        instructions::create_vesting::handler(ctx, params)
    }

    /// Withdraw unlocked tokens from a lock or vesting contract
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, amount)
    }

    /// Cancel a lock or vesting contract (if permitted)
    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        instructions::cancel::handler(ctx)
    }

    /// Transfer recipient to a new address (if permitted)
    pub fn transfer_recipient(ctx: Context<TransferRecipient>) -> Result<()> {
        instructions::transfer_recipient::handler(ctx)
    }

    /// Pause a vesting contract (if permitted)
    pub fn pause(ctx: Context<Pause>) -> Result<()> {
        instructions::pause::handler(ctx)
    }

    /// Unpause a vesting contract
    pub fn unpause(ctx: Context<Unpause>) -> Result<()> {
        instructions::unpause::handler(ctx)
    }

    /// Initialize the protocol config (admin only, called once)
    pub fn initialize_config(ctx: Context<InitializeConfig>, params: ConfigParams) -> Result<()> {
        instructions::initialize_config::handler(ctx, params)
    }

    /// Update protocol config (admin only)
    pub fn update_config(ctx: Context<UpdateConfig>, params: ConfigParams) -> Result<()> {
        instructions::update_config::handler(ctx, params)
    }
}

