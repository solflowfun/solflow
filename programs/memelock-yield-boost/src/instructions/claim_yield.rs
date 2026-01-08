use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{YieldBoostConfig, YieldBoost, BoostState};
use crate::error::YieldBoostError;

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    /// User claiming yield
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// Config
    #[account(
        mut,
        seeds = [YieldBoostConfig::SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, YieldBoostConfig>,
    
    /// YieldBoost account
    #[account(
        mut,
        seeds = [YieldBoost::SEED, yield_boost.contract.as_ref()],
        bump = yield_boost.bump,
        has_one = user,
    )]
    pub yield_boost: Account<'info, YieldBoost>,
    
    /// LST mint
    #[account(address = config.lst_mint)]
    pub lst_mint: InterfaceAccount<'info, Mint>,
    
    /// LST escrow for this boost
    #[account(
        mut,
        associated_token::mint = lst_mint,
        associated_token::authority = yield_boost,
        associated_token::token_program = token_program,
    )]
    pub lst_escrow: InterfaceAccount<'info, TokenAccount>,
    
    /// User's LST token account (destination)
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = lst_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_lst_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Protocol's LST account for yield share
    #[account(
        mut,
        associated_token::mint = lst_mint,
        associated_token::authority = config,
        associated_token::token_program = token_program,
    )]
    pub protocol_lst_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Token program
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ClaimYield>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let yield_boost = &mut ctx.accounts.yield_boost;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check boost is active
    require!(
        yield_boost.state() == BoostState::Active,
        YieldBoostError::BoostNotFunded
    );
    
    // Check minimum time has passed (anti-spam)
    require!(
        yield_boost.can_claim_yield(now),
        YieldBoostError::TooEarlyToClaimYield
    );
    
    // Check boost is mature (lock has ended)
    require!(
        yield_boost.is_mature(now),
        YieldBoostError::BoostNotMature
    );
    
    // Calculate yield
    // Current LST balance should be > deposited amount due to staking yield
    let current_lst_balance = ctx.accounts.lst_escrow.amount;
    let deposited = yield_boost.lst_amount_deposited;
    
    // Yield is the difference (LST accrues value over time)
    let total_yield = current_lst_balance.saturating_sub(deposited);
    
    require!(total_yield > 0, YieldBoostError::NoYieldToClaim);
    
    // Calculate protocol's share
    let protocol_share = total_yield
        .checked_mul(config.protocol_yield_share_bps as u64)
        .unwrap_or(0)
        .checked_div(10_000)
        .unwrap_or(0);
    
    let user_yield = total_yield.saturating_sub(protocol_share);
    
    // Build signer seeds for escrow transfer
    let contract_key = yield_boost.contract;
    let bump = [yield_boost.bump];
    let signer_seeds: &[&[&[u8]]] = &[&[
        YieldBoost::SEED,
        contract_key.as_ref(),
        bump.as_ref(),
    ]];
    
    // Transfer yield to user
    if user_yield > 0 {
        let transfer_accounts = TransferChecked {
            from: ctx.accounts.lst_escrow.to_account_info(),
            mint: ctx.accounts.lst_mint.to_account_info(),
            to: ctx.accounts.user_lst_account.to_account_info(),
            authority: ctx.accounts.yield_boost.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        
        transfer_checked(cpi_ctx, user_yield, ctx.accounts.lst_mint.decimals)?;
    }
    
    // Transfer protocol's share
    if protocol_share > 0 {
        let transfer_accounts = TransferChecked {
            from: ctx.accounts.lst_escrow.to_account_info(),
            mint: ctx.accounts.lst_mint.to_account_info(),
            to: ctx.accounts.protocol_lst_account.to_account_info(),
            authority: ctx.accounts.yield_boost.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        
        transfer_checked(cpi_ctx, protocol_share, ctx.accounts.lst_mint.decimals)?;
    }
    
    // Update state
    yield_boost.yield_accrued = yield_boost.yield_accrued.saturating_add(total_yield);
    yield_boost.yield_claimed = yield_boost.yield_claimed.saturating_add(user_yield);
    yield_boost.state = BoostState::Claimed as u8;
    yield_boost.last_yield_calc_at = now;
    
    // Update config stats
    config.total_yield_distributed = config.total_yield_distributed.saturating_add(user_yield);
    
    msg!(
        "Yield claimed: {} to user, {} to protocol",
        user_yield,
        protocol_share
    );
    
    emit!(YieldClaimed {
        yield_boost: ctx.accounts.yield_boost.key(),
        user: ctx.accounts.user.key(),
        user_yield,
        protocol_share,
        total_yield,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct YieldClaimed {
    pub yield_boost: Pubkey,
    pub user: Pubkey,
    pub user_yield: u64,
    pub protocol_share: u64,
    pub total_yield: u64,
    pub timestamp: i64,
}

