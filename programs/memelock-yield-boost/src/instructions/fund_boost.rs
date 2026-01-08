use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{YieldBoostConfig, Treasury, YieldBoost, BoostState};
use crate::error::YieldBoostError;

#[derive(Accounts)]
pub struct FundBoost<'info> {
    /// Crank/treasury operator (permissioned)
    #[account(mut)]
    pub operator: Signer<'info>,
    
    /// Config
    #[account(
        mut,
        seeds = [YieldBoostConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, YieldBoostConfig>,
    
    /// Treasury PDA
    #[account(
        mut,
        seeds = [YieldBoostConfig::TREASURY_SEED],
        bump = treasury.bump,
    )]
    pub treasury: Account<'info, Treasury>,
    
    /// YieldBoost account to fund
    #[account(
        mut,
        seeds = [YieldBoost::SEED, yield_boost.contract.as_ref()],
        bump = yield_boost.bump,
    )]
    pub yield_boost: Account<'info, YieldBoost>,
    
    /// LST mint (e.g., JitoSOL)
    #[account(address = config.lst_mint)]
    pub lst_mint: InterfaceAccount<'info, Mint>,
    
    /// Treasury's LST token account (source)
    #[account(
        mut,
        associated_token::mint = lst_mint,
        associated_token::authority = treasury,
        associated_token::token_program = token_program,
    )]
    pub treasury_lst_account: InterfaceAccount<'info, TokenAccount>,
    
    /// LST escrow for this boost (destination)
    #[account(
        init,
        payer = operator,
        associated_token::mint = lst_mint,
        associated_token::authority = yield_boost,
        associated_token::token_program = token_program,
    )]
    pub lst_escrow: InterfaceAccount<'info, TokenAccount>,
    
    /// Token program
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<FundBoost>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let treasury = &mut ctx.accounts.treasury;
    let yield_boost = &mut ctx.accounts.yield_boost;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check protocol not paused
    require!(!config.paused, YieldBoostError::ProtocolPaused);
    
    // Check boost is in pending state
    require!(
        yield_boost.state() == BoostState::Pending,
        YieldBoostError::BoostAlreadyFunded
    );
    
    // Check daily allocation limit
    let day_boundary = now - (now % 86400); // Start of current day
    if day_boundary > config.last_allocation_reset {
        // New day, reset allocation
        config.daily_allocation_used = 0;
        config.last_allocation_reset = day_boundary;
    }
    
    let amount_to_match = yield_boost.principal_matched;
    
    require!(
        config.daily_allocation_used.saturating_add(amount_to_match) <= config.max_daily_allocation,
        YieldBoostError::DailyAllocationExceeded
    );
    
    // Calculate LST amount to transfer
    // In production, this would query the LST exchange rate
    // For simplicity, we assume 1:1 rate (LST price is always >= SOL)
    let lst_amount = amount_to_match; // Simplified; real impl uses exchange rate
    
    // Check treasury has sufficient LST
    require!(
        ctx.accounts.treasury_lst_account.amount >= lst_amount,
        YieldBoostError::InsufficientTreasury
    );
    
    // Transfer LST from treasury to escrow
    let treasury_bump = treasury.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[
        YieldBoostConfig::TREASURY_SEED,
        &[treasury_bump],
    ]];
    
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.treasury_lst_account.to_account_info(),
        mint: ctx.accounts.lst_mint.to_account_info(),
        to: ctx.accounts.lst_escrow.to_account_info(),
        authority: ctx.accounts.treasury.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        signer_seeds,
    );
    
    transfer_checked(cpi_ctx, lst_amount, ctx.accounts.lst_mint.decimals)?;
    
    // Update yield boost state
    yield_boost.state = BoostState::Active as u8;
    yield_boost.lst_escrow = ctx.accounts.lst_escrow.key();
    yield_boost.lst_amount_deposited = lst_amount;
    yield_boost.lst_amount_last = lst_amount;
    yield_boost.funded_at = now;
    yield_boost.last_yield_calc_at = now;
    
    // Update config stats
    config.daily_allocation_used = config.daily_allocation_used.saturating_add(amount_to_match);
    config.total_boosts = config.total_boosts.saturating_add(1);
    config.total_sol_matched = config.total_sol_matched.saturating_add(amount_to_match);
    
    // Update treasury stats
    treasury.total_staked = treasury.total_staked.saturating_add(amount_to_match);
    
    msg!(
        "Boost funded: {} LST transferred, matched {} lamports",
        lst_amount,
        amount_to_match
    );
    
    emit!(YieldBoostFunded {
        yield_boost: ctx.accounts.yield_boost.key(),
        lst_amount,
        principal_matched: amount_to_match,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct YieldBoostFunded {
    pub yield_boost: Pubkey,
    pub lst_amount: u64,
    pub principal_matched: u64,
    pub timestamp: i64,
}

