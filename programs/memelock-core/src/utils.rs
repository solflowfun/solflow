use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

/// Magic number to withdraw all available tokens (like Streamflow)
pub const WITHDRAW_MAX: u64 = u64::MAX;

/// Minimum lock duration: 1 minute (for testing)
pub const MIN_LOCK_DURATION_DEV: u64 = 60;

/// Minimum lock duration: 1 hour (for production)
pub const MIN_LOCK_DURATION_PROD: u64 = 3600;

/// Maximum lock duration: 10 years
pub const MAX_LOCK_DURATION: u64 = 315_360_000;

/// Validate that a timestamp is in the future
pub fn validate_future_timestamp(ts: i64, clock: &Clock) -> bool {
    ts > clock.unix_timestamp
}

/// Validate duration constraints
pub fn validate_duration(start_ts: i64, end_ts: i64, min_duration: u64, max_duration: u64) -> Result<()> {
    require!(end_ts > start_ts, crate::error::MemeLockError::StartAfterEnd);
    
    let duration = (end_ts - start_ts) as u64;
    require!(duration >= min_duration, crate::error::MemeLockError::DurationTooShort);
    require!(duration <= max_duration, crate::error::MemeLockError::DurationTooLong);
    
    Ok(())
}

/// Validate unlock interval divides evenly into duration
pub fn validate_interval(start_ts: i64, end_ts: i64, interval_seconds: u64) -> Result<()> {
    require!(interval_seconds > 0, crate::error::MemeLockError::InvalidInterval);
    
    let duration = (end_ts - start_ts) as u64;
    require!(
        duration % interval_seconds == 0,
        crate::error::MemeLockError::IntervalNotDivisible
    );
    
    Ok(())
}

/// Calculate protocol fee
pub fn calculate_fee(amount: u64, fee_bps: u16) -> u64 {
    // fee_bps is in basis points (100 = 1%)
    amount
        .checked_mul(fee_bps as u64)
        .unwrap_or(0)
        .checked_div(10_000)
        .unwrap_or(0)
}

/// Get current unix timestamp from clock
pub fn get_current_timestamp(clock: &Clock) -> i64 {
    clock.unix_timestamp
}

/// Check if a token is Token-2022
pub fn is_token_2022(mint_info: &AccountInfo) -> bool {
    mint_info.owner == &anchor_spl::token_2022::ID
}

/// Transfer tokens using the appropriate token program (SPL or Token-2022)
pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    authority: &AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    amount: u64,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let cpi_accounts = anchor_spl::token_interface::TransferChecked {
        from: from.to_account_info(),
        mint: from.to_account_info(), // Will be overridden below
        to: to.to_account_info(),
        authority: authority.clone(),
    };
    
    let cpi_ctx = if let Some(seeds) = signer_seeds {
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            cpi_accounts,
            seeds,
        )
    } else {
        CpiContext::new(
            token_program.to_account_info(),
            cpi_accounts,
        )
    };
    
    anchor_spl::token_interface::transfer_checked(cpi_ctx, amount, from.decimals)?;
    
    Ok(())
}

/// Seeds for contract PDA
pub fn get_contract_seeds<'a>(
    sender: &'a Pubkey,
    mint: &'a Pubkey,
    nonce: &'a [u8],
    bump: &'a [u8],
) -> [&'a [u8]; 5] {
    [b"contract", sender.as_ref(), mint.as_ref(), nonce, bump]
}

/// Seeds for escrow token account PDA
pub fn get_escrow_seeds<'a>(contract: &'a Pubkey, bump: &'a [u8]) -> [&'a [u8]; 3] {
    [b"escrow", contract.as_ref(), bump]
}

