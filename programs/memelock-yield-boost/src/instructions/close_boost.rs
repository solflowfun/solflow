use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked, CloseAccount, close_account};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{YieldBoostConfig, Treasury, YieldBoost, BoostState};
use crate::error::YieldBoostError;

#[derive(Accounts)]
pub struct CloseBoost<'info> {
    /// Operator or user closing the boost
    #[account(mut)]
    pub closer: Signer<'info>,
    
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
    
    /// YieldBoost account to close
    #[account(
        mut,
        seeds = [YieldBoost::SEED, yield_boost.contract.as_ref()],
        bump = yield_boost.bump,
        close = closer,
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
    
    /// Treasury's LST token account (receives principal in Model A)
    #[account(
        mut,
        associated_token::mint = lst_mint,
        associated_token::authority = treasury,
        associated_token::token_program = token_program,
    )]
    pub treasury_lst_account: InterfaceAccount<'info, TokenAccount>,
    
    /// User's LST account (receives principal in Model B)
    #[account(
        mut,
        associated_token::mint = lst_mint,
        associated_token::authority = yield_boost.user,
        associated_token::token_program = token_program,
    )]
    pub user_lst_account: InterfaceAccount<'info, TokenAccount>,
    
    /// Token program
    pub token_program: Interface<'info, TokenInterface>,
    
    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
    
    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseBoost>) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    let yield_boost = &ctx.accounts.yield_boost;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // Check boost is in claimed state (yield already distributed)
    require!(
        yield_boost.state() == BoostState::Claimed,
        YieldBoostError::BoostNotMature
    );
    
    // Get remaining principal in escrow
    let remaining_principal = ctx.accounts.lst_escrow.amount;
    
    // Build signer seeds
    let contract_key = yield_boost.contract;
    let bump = [yield_boost.bump];
    let signer_seeds: &[&[&[u8]]] = &[&[
        YieldBoost::SEED,
        contract_key.as_ref(),
        bump.as_ref(),
    ]];
    
    // Transfer principal based on model
    if remaining_principal > 0 {
        let destination = if yield_boost.is_model_b {
            // Model B: Principal goes to user
            ctx.accounts.user_lst_account.to_account_info()
        } else {
            // Model A: Principal returns to treasury
            ctx.accounts.treasury_lst_account.to_account_info()
        };
        
        let transfer_accounts = TransferChecked {
            from: ctx.accounts.lst_escrow.to_account_info(),
            mint: ctx.accounts.lst_mint.to_account_info(),
            to: destination,
            authority: ctx.accounts.yield_boost.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_accounts,
            signer_seeds,
        );
        
        transfer_checked(cpi_ctx, remaining_principal, ctx.accounts.lst_mint.decimals)?;
        
        // Update treasury stats if Model A
        if !yield_boost.is_model_b {
            treasury.total_staked = treasury.total_staked.saturating_sub(remaining_principal);
        }
    }
    
    // Close escrow account
    let close_accounts = CloseAccount {
        account: ctx.accounts.lst_escrow.to_account_info(),
        destination: ctx.accounts.closer.to_account_info(),
        authority: ctx.accounts.yield_boost.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_accounts,
        signer_seeds,
    );
    
    close_account(cpi_ctx)?;
    
    msg!(
        "Boost closed: {} principal to {}",
        remaining_principal,
        if yield_boost.is_model_b { "user" } else { "treasury" }
    );
    
    emit!(BoostClosed {
        yield_boost: ctx.accounts.yield_boost.key(),
        principal_returned: remaining_principal,
        returned_to_treasury: !yield_boost.is_model_b,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct BoostClosed {
    pub yield_boost: Pubkey,
    pub principal_returned: u64,
    pub returned_to_treasury: bool,
    pub timestamp: i64,
}

