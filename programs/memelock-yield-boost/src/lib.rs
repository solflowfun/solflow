use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("Mem1ockYie1dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod memelock_yield_boost {
    use super::*;

    /// Initialize the yield boost program config
    pub fn initialize(ctx: Context<Initialize>, params: InitializeParams) -> Result<()> {
        instructions::initialize::handler(ctx, params)
    }

    /// Enable yield boost for a lock/vesting contract
    pub fn enable_yield_boost(
        ctx: Context<EnableYieldBoost>,
        params: EnableYieldBoostParams,
    ) -> Result<()> {
        instructions::enable_yield_boost::handler(ctx, params)
    }

    /// Fund the yield boost by depositing matched SOL and converting to LST
    pub fn fund_boost(ctx: Context<FundBoost>) -> Result<()> {
        instructions::fund_boost::handler(ctx)
    }

    /// Claim accrued yield from the boost
    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        instructions::claim_yield::handler(ctx)
    }

    /// Close the yield boost after maturity (Model A: principal returns to treasury)
    pub fn close_boost(ctx: Context<CloseBoost>) -> Result<()> {
        instructions::close_boost::handler(ctx)
    }

    /// Update yield boost config (admin only)
    pub fn update_config(ctx: Context<UpdateBoostConfig>, params: UpdateConfigParams) -> Result<()> {
        instructions::update_config::handler(ctx, params)
    }

    /// Add funds to treasury
    pub fn fund_treasury(ctx: Context<FundTreasury>, amount: u64) -> Result<()> {
        instructions::fund_treasury::handler(ctx, amount)
    }

    /// Withdraw from treasury (admin only)
    pub fn withdraw_treasury(ctx: Context<WithdrawTreasury>, amount: u64) -> Result<()> {
        instructions::withdraw_treasury::handler(ctx, amount)
    }
}

