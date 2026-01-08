'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

// Mock portfolio data
const mockPortfolio = {
  totalLocked: '2,500,000 tokens',
  totalValueLocked: '$12,450',
  activeLocks: 3,
  yieldEarned: '4.21 SOL',
  locks: [
    {
      id: '7xKp3mNq',
      token: '$FLOW',
      tokenIcon: '🌊',
      amount: '1,000,000',
      type: 'vesting',
      role: 'creator',
      status: 'active',
      unlockDate: 'Dec 15, 2026',
      progress: 25,
      yieldBoost: true,
      yieldAccrued: '2.34 SOL',
      nextUnlock: '250,000 on Mar 15, 2026',
    },
    {
      id: '9aRt7kLm',
      token: '$MOON',
      tokenIcon: '🌙',
      amount: '500,000',
      type: 'lock',
      role: 'recipient',
      status: 'active',
      unlockDate: 'Jun 1, 2026',
      progress: 45,
      yieldBoost: false,
      yieldAccrued: null,
      nextUnlock: 'Full unlock Jun 1, 2026',
    },
    {
      id: '4bCx2pQw',
      token: '$PEPE',
      tokenIcon: '🐸',
      amount: '1,000,000',
      type: 'vesting',
      role: 'creator',
      status: 'active',
      unlockDate: 'Mar 30, 2027',
      progress: 10,
      yieldBoost: true,
      yieldAccrued: '1.87 SOL',
      nextUnlock: '100,000 on Apr 30, 2026',
    },
  ],
};

export default function PortfolioPage() {
  const { connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-editorial text-3xl text-[#1A1A1A] mb-4">Your Portfolio</h1>
          <p className="text-[#4A4A4A] mb-8">
            Connect your wallet to view your token locks, vesting schedules, and accrued yield.
          </p>
          <WalletMultiButton />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-3">Portfolio</div>
        <h1 className="font-editorial text-4xl text-[#1A1A1A] mb-2">Your Locks</h1>
        <p className="text-sm text-[#8A8A8A] font-mono">{publicKey?.toBase58()}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Total Locked</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{mockPortfolio.totalLocked}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Est. Value</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{mockPortfolio.totalValueLocked}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Active Locks</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{mockPortfolio.activeLocks}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Yield Earned</div>
          <div className="font-editorial text-2xl text-[#50908D]">+{mockPortfolio.yieldEarned}</div>
        </div>
      </div>

      {/* Locks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-editorial text-2xl text-[#1A1A1A]">Active Positions</h2>
          <Link href="/create" className="btn-primary text-sm">
            New Lock
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>

        {mockPortfolio.locks.map((lock) => (
          <div key={lock.id} className="editorial-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Token info */}
              <div className="flex items-center gap-4 lg:w-48">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8CCBBF]/20 to-[#817CCD]/20 flex items-center justify-center text-2xl">
                  {lock.tokenIcon}
                </div>
                <div>
                  <div className="font-medium text-[#1A1A1A]">{lock.token}</div>
                  <div className="text-xs text-[#8A8A8A]">
                    <span className="capitalize">{lock.type}</span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">{lock.role}</span>
                  </div>
                </div>
              </div>

              {/* Amount & Progress */}
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-mono">{lock.amount}</span>
                  <span className="text-[#8A8A8A]">{lock.progress}% unlocked</span>
                </div>
                <div className="relative h-2 bg-[#E5E0D8] rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#50908D] to-[#817CCD] rounded-full transition-all"
                    style={{ width: `${lock.progress}%` }}
                  />
                </div>
                <div className="text-xs text-[#8A8A8A] mt-2">{lock.nextUnlock}</div>
              </div>

              {/* Yield info */}
              <div className="lg:w-32 text-right">
                {lock.yieldBoost && lock.yieldAccrued ? (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.1em] text-[#C47809] mb-1">Yield Boost</div>
                    <div className="font-mono text-[#50908D]">+{lock.yieldAccrued}</div>
                  </div>
                ) : (
                  <div className="text-xs text-[#8A8A8A]">No yield boost</div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 lg:w-auto">
                <Link 
                  href={`/locks/${lock.id}`}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  View
                </Link>
                {lock.yieldBoost && lock.yieldAccrued && (
                  <button className="btn-primary text-xs px-4 py-2">
                    Claim
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state (if no locks) */}
      {mockPortfolio.locks.length === 0 && (
        <div className="editorial-card p-12 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-[#4A4A4A] mb-2">No locks yet</p>
          <p className="text-sm text-[#8A8A8A] mb-6">Create your first token lock to get started.</p>
          <Link href="/create" className="btn-primary">
            Create Lock
          </Link>
        </div>
      )}
    </main>
  );
}
