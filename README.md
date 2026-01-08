# SolFlow - MemeLock

![SolFlow Banner](./solflowbanner.jpg)

> Token locking, vesting, and yield boost platform for Solana memecoins

## Overview

SolFlow (MemeLock) is a comprehensive token locking and vesting protocol built on Solana. It provides:

- **Token Locks**: Single-unlock locks for team tokens, LP tokens, and marketing wallets
- **Vesting Schedules**: Progressive unlock with customizable intervals, cliffs, and permissions
- **Yield Boost**: Unique feature that matches your fee with staked SOL to earn yield while locked
- **Public Proof Pages**: Shareable verification pages to build trust with your community

## Features

### Token Lock (Single Unlock)

- Tokens locked until a specific timestamp
- Irreversible - provides maximum trust
- Configurable cancel/transfer permissions
- Optional yield boost

### Vesting Schedule

- Progressive unlock over time
- Daily, weekly, monthly, quarterly, or custom intervals
- Cliff amount released at first unlock
- Pausable by sender
- Cancel settles: unlocked → recipient, locked → sender

### Yield Boost

1. User provides buy transaction signatures
2. Oracle computes cost basis from on-chain swaps
3. Fee = 2% of buy value
4. Protocol matches fee with staked SOL (LST)
5. At maturity, user receives yield; principal returns to treasury

**Model A (Default)**: Yield-only boost - sustainable economics  
**Model B (Optional)**: Principal + yield - for promotional periods

### Public Proof Pages

- Shareable URLs for any contract
- Real-time unlock progress
- Yield boost status and estimated returns
- Embeddable widget for project websites

## Security

### Invariants

- Tokens in escrow can only move according to schedule math
- Withdrawal never exceeds `unlocked - withdrawn`
- Cancel settles correctly to both parties
- Attestation signature must be valid and unexpired
- Fee paid must match computed fee

## Risk Disclosures

### Token Lock Risks

- **Irreversibility**: Locks cannot be modified or canceled (unless permitted)
- **Smart Contract Risk**: Funds depend on program security
- **Token Risk**: Locked tokens may lose value

### Yield Boost Risks

- **LST Risk**: Liquid staking tokens carry slashing and de-peg risks
- **Yield Variability**: Actual yield may differ from estimates
- **Market Risk**: SOL price affects yield value

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Links

- Website: [https://solflow.fun](https://solflow.fun)
- X: [https://x.com/solflowdotfun](https://x.com/solflowdotfun)
