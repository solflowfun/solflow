# SolFlow - MemeLock

> Token locking, vesting, and yield boost platform for Solana memecoins

![SolFlow Banner](https://placeholder.com/banner.png)

## Overview

SolFlow (MemeLock) is a comprehensive token locking and vesting protocol built on Solana. It provides:

- **Token Locks**: Single-unlock locks for team tokens, LP tokens, and marketing wallets
- **Vesting Schedules**: Progressive unlock with customizable intervals, cliffs, and permissions
- **Yield Boost**: Unique feature that matches your fee with staked SOL to earn yield while locked
- **Public Proof Pages**: Shareable verification pages to build trust with your community

## Architecture

```
solflow/
├── programs/                 # Anchor smart contracts
│   ├── memelock-core/       # Core lock/vesting logic
│   └── memelock-yield-boost/# Yield boost feature
├── backend/                  # Node.js API & services
│   ├── src/
│   │   ├── routes/          # REST API endpoints
│   │   └── services/        # Indexer, auto-claim, notifications
│   └── prisma/              # Database schema
├── frontend/                 # Next.js web application
│   └── src/
│       ├── app/             # App router pages
│       └── components/      # React components
└── packages/                 # Shared SDK & types
```

## Programs

### memelock_core

Core token locking and vesting functionality:

- `create_lock` - Create a single-unlock token lock
- `create_vesting` - Create a progressive vesting schedule
- `withdraw` - Claim unlocked tokens
- `cancel` - Cancel contract (if permitted)
- `transfer_recipient` - Change recipient address
- `pause/unpause` - Pause vesting contracts

### memelock_yield_boost

Yield boost feature powered by liquid staking:

- `enable_yield_boost` - Enable boost with buy-price attestation
- `fund_boost` - Treasury funds matched stake
- `claim_yield` - Claim accrued yield at maturity
- `close_boost` - Return principal to treasury (Model A)

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

## Getting Started

### Prerequisites

- Node.js 18+
- Rust & Anchor CLI
- Solana CLI
- PostgreSQL
- Redis

### Installation

```bash
# Clone repository
git clone https://github.com/solflow/solflow.git
cd solflow

# Install dependencies
npm install

# Set up environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Generate Prisma client
cd backend && npm run db:generate

# Build Anchor programs
cd programs && anchor build
```

### Development

```bash
# Start all services
npm run dev

# Or individually:
cd backend && npm run dev    # API on :3001
cd frontend && npm run dev   # Web on :3000
cd programs && anchor test   # Run tests
```

### Deployment

```bash
# Build for production
npm run build

# Deploy programs to devnet
cd programs && anchor deploy --provider.cluster devnet

# Deploy backend
cd backend && npm run start

# Deploy frontend
cd frontend && npm run build && npm run start
```

## API Reference

### Contracts

```
GET /api/contracts                    # List contracts
GET /api/contracts/:address           # Get contract details
GET /api/contracts/wallet/:address    # Get contracts by wallet
GET /api/contracts/:address/withdrawals # Get withdrawal history
```

### Projects

```
GET /api/projects                     # List projects
GET /api/projects/:slug               # Get project details
POST /api/projects                    # Create project
```

### Attestations

```
POST /api/attestations/request        # Request buy-price attestation
GET /api/attestations/:id             # Get attestation
POST /api/attestations/verify         # Verify attestation signature
```

### Yield Boost

```
GET /api/yield-boost                  # List yield boosts
GET /api/yield-boost/:address         # Get boost details
POST /api/yield-boost/estimate-fee    # Estimate fee for boost
```

### Stats

```
GET /api/stats/overview               # Protocol overview
GET /api/stats/history                # TVL history
GET /api/stats/top-tokens             # Top tokens by TVL
GET /api/stats/recent-activity        # Recent transactions
```

## Security

### Invariants

- Tokens in escrow can only move according to schedule math
- Withdrawal never exceeds `unlocked - withdrawn`
- Cancel settles correctly to both parties
- Attestation signature must be valid and unexpired
- Fee paid must match computed fee

### Audits

- [ ] Internal audit checklist
- [ ] External audit (pending)

## Configuration

### Protocol Config (On-chain)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `protocol_fee_bps` | 0 | Protocol fee in basis points |
| `creation_fee_lamports` | 0 | Flat creation fee |
| `yield_boost_fee_bps` | 200 | 2% fee on buy value |
| `min_lock_duration` | 3600 | Minimum 1 hour |
| `max_lock_duration` | 315360000 | Maximum 10 years |

### Yield Boost Config

| Parameter | Default | Description |
|-----------|---------|-------------|
| `min_fee_lamports` | 1000000 | Minimum 0.001 SOL |
| `max_fee_lamports` | 10000000000 | Maximum 10 SOL |
| `max_boost_per_contract` | 10 SOL | Per-contract cap |
| `max_daily_allocation` | 100 SOL | Daily allocation limit |
| `min_lock_duration` | 604800 | Minimum 7 days for boost |

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

MIT License - see [LICENSE](LICENSE)

## Links

- Website: https://solflow.io
- Documentation: https://docs.solflow.io
- Twitter: https://twitter.com/solflow
- Discord: https://discord.gg/solflow

