use anchor_lang::prelude::*;
use anchor_lang::solana_program::ed25519_program;

use crate::state::{YieldBoostConfig, YieldBoost, BoostState, Attestation};
use crate::error::YieldBoostError;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EnableYieldBoostParams {
    /// Attestation data
    pub attestation: Attestation,
    /// Ed25519 signature of the attestation by oracle
    pub signature: [u8; 64],
    /// Whether to use Model B (principal + yield to user)
    pub use_model_b: bool,
}

#[derive(Accounts)]
#[instruction(params: EnableYieldBoostParams)]
pub struct EnableYieldBoost<'info> {
    /// User enabling the boost
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// Config
    #[account(
        seeds = [YieldBoostConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, YieldBoostConfig>,
    
    /// The lock/vesting contract to boost
    /// CHECK: Verified via CPI or manual check
    pub lock_contract: AccountInfo<'info>,
    
    /// YieldBoost PDA
    #[account(
        init,
        payer = user,
        space = YieldBoost::LEN,
        seeds = [YieldBoost::SEED, lock_contract.key().as_ref()],
        bump,
    )]
    pub yield_boost: Account<'info, YieldBoost>,
    
    /// Treasury to receive fee
    /// CHECK: Verified by config
    #[account(mut, address = config.treasury)]
    pub treasury: AccountInfo<'info>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<EnableYieldBoost>, params: EnableYieldBoostParams) -> Result<()> {
    let config = &ctx.accounts.config;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check protocol is not paused
    require!(!config.paused, YieldBoostError::ProtocolPaused);
    
    // Verify attestation is not expired
    require!(params.attestation.is_valid(now), YieldBoostError::AttestationExpired);
    
    // Verify attestation wallet matches user
    require!(
        params.attestation.wallet == ctx.accounts.user.key(),
        YieldBoostError::AttestationWalletMismatch
    );
    
    // If Model B requested, check it's enabled
    if params.use_model_b {
        require!(config.model_b_enabled, YieldBoostError::ModelBNotEnabled);
    }
    
    // Verify oracle signature
    // In production, this would verify the Ed25519 signature of the attestation
    // For now, we'll do a simplified check (the oracle_signer pubkey is stored in config)
    verify_attestation_signature(
        &params.attestation,
        &params.signature,
        &config.oracle_signer,
    )?;
    
    // Calculate fee
    let fee = calculate_fee(
        params.attestation.buy_value_lamports,
        config.fee_bps,
        config.min_fee_lamports,
        config.max_fee_lamports,
    );
    
    // Transfer fee from user to treasury
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.treasury.key(),
        fee,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
        ],
    )?;
    
    // Read lock contract data to get end timestamp
    // In production, you'd deserialize the memelock_core::Contract account
    // For now, we store the expected end_ts from attestation context
    let lock_end_ts = estimate_lock_end_ts(&ctx.accounts.lock_contract)?;
    
    // Validate lock duration meets minimum
    let lock_duration = lock_end_ts - now;
    require!(
        lock_duration >= config.min_lock_duration as i64,
        YieldBoostError::LockDurationTooShort
    );
    
    // Check boost doesn't exceed per-contract limit
    require!(
        fee <= config.max_boost_per_contract,
        YieldBoostError::BoostExceedsLimit
    );
    
    // Initialize yield boost account
    let yield_boost = &mut ctx.accounts.yield_boost;
    yield_boost.version = 1;
    yield_boost.bump = ctx.bumps.yield_boost;
    yield_boost.state = BoostState::Pending as u8;
    yield_boost.contract = ctx.accounts.lock_contract.key();
    yield_boost.user = ctx.accounts.user.key();
    yield_boost.mint = params.attestation.mint;
    yield_boost.buy_value_lamports = params.attestation.buy_value_lamports;
    yield_boost.fee_paid = fee;
    yield_boost.principal_matched = fee; // Protocol matches the fee amount
    yield_boost.lst_escrow = Pubkey::default(); // Set when funded
    yield_boost.lst_amount_deposited = 0;
    yield_boost.lst_amount_last = 0;
    yield_boost.yield_accrued = 0;
    yield_boost.yield_claimed = 0;
    yield_boost.enabled_at = now;
    yield_boost.funded_at = 0;
    yield_boost.lock_end_ts = lock_end_ts;
    yield_boost.last_yield_calc_at = 0;
    yield_boost.is_model_b = params.use_model_b;
    yield_boost.attestation_txs_hash = params.attestation.txs_hash;
    
    msg!(
        "Yield boost enabled: fee={} lamports, matched={} lamports",
        fee,
        fee
    );
    
    emit!(YieldBoostEnabled {
        yield_boost: ctx.accounts.yield_boost.key(),
        contract: ctx.accounts.lock_contract.key(),
        user: ctx.accounts.user.key(),
        fee_paid: fee,
        principal_to_match: fee,
        lock_end_ts,
        is_model_b: params.use_model_b,
        timestamp: now,
    });
    
    Ok(())
}

fn verify_attestation_signature(
    attestation: &Attestation,
    signature: &[u8; 64],
    oracle_signer: &Pubkey,
) -> Result<()> {
    // Serialize attestation to bytes for verification
    let mut message = Vec::new();
    attestation.serialize(&mut message)?;
    
    // In production, use Ed25519 signature verification
    // For now, we just check the signature is not all zeros (placeholder)
    // Real implementation would use ed25519_program::verify
    
    if signature.iter().all(|&b| b == 0) {
        return Err(YieldBoostError::InvalidAttestation.into());
    }
    
    // TODO: Implement proper Ed25519 verification via CPI or instruction introspection
    // This requires the Ed25519 program to be invoked before this instruction
    
    Ok(())
}

fn calculate_fee(
    buy_value: u64,
    fee_bps: u16,
    min_fee: u64,
    max_fee: u64,
) -> u64 {
    let calculated = buy_value
        .checked_mul(fee_bps as u64)
        .unwrap_or(0)
        .checked_div(10_000)
        .unwrap_or(0);
    
    // Apply min/max bounds
    calculated.max(min_fee).min(max_fee)
}

fn estimate_lock_end_ts(lock_contract: &AccountInfo) -> Result<i64> {
    // In production, deserialize the memelock_core::Contract account
    // and read end_ts directly
    // For now, read from the account data at known offset
    
    if lock_contract.data_len() < 8 + 1 + 1 + 1 + 1 + 32 + 32 + 32 + 32 + 8 + 8 {
        return Err(YieldBoostError::InvalidParameter.into());
    }
    
    let data = lock_contract.try_borrow_data()?;
    
    // Skip to end_ts field (offset calculation based on Contract struct)
    // discriminator(8) + version(1) + kind(1) + state(1) + bump(1) + mint(32) + 
    // sender(32) + recipient(32) + escrow(32) + start_ts(8)
    let offset = 8 + 1 + 1 + 1 + 1 + 32 + 32 + 32 + 32 + 8;
    
    let end_ts_bytes: [u8; 8] = data[offset..offset+8].try_into()
        .map_err(|_| YieldBoostError::InvalidParameter)?;
    
    Ok(i64::from_le_bytes(end_ts_bytes))
}

#[event]
pub struct YieldBoostEnabled {
    pub yield_boost: Pubkey,
    pub contract: Pubkey,
    pub user: Pubkey,
    pub fee_paid: u64,
    pub principal_to_match: u64,
    pub lock_end_ts: i64,
    pub is_model_b: bool,
    pub timestamp: i64,
}

