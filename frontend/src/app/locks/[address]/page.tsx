'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock lock data
const mockLockData = {
  id: '7xKp3mNq',
  token: {
    name: '$FLOW',
    icon: '🌊',
    mint: 'FLow7xKp3mNq9aRt7kLm4bCx2pQw8mKl9rTxYzAb',
  },
  amount: '1,000,000',
  creator: 'Flo3wKp9mNq8aRt7kLm4bCx2pQw8mKl9rTxYzAbCd',
  recipient: 'Flo3wKp9mNq8aRt7kLm4bCx2pQw8mKl9rTxYzAbCd',
  type: 'vesting',
  status: 'active',
  createdAt: 'Jan 8, 2026 14:23:01',
  startDate: 'Jan 8, 2026',
  endDate: 'Dec 15, 2026',
  cliffDuration: '90 days',
  vestingDuration: '365 days',
  cancelAuthority: 'creator',
  transferable: true,
  yieldBoost: {
    enabled: true,
    buyPrice: '0.000045 SOL',
    feePaid: '0.45 SOL',
    matchedStake: '0.45 SOL',
    yieldAccrued: '2.34 SOL',
    apy: '7.2%',
  },
  schedule: [
    { date: 'Apr 8, 2026', amount: '250,000', status: 'pending', pctUnlocked: 25 },
    { date: 'Jun 8, 2026', amount: '250,000', status: 'pending', pctUnlocked: 50 },
    { date: 'Sep 8, 2026', amount: '250,000', status: 'pending', pctUnlocked: 75 },
    { date: 'Dec 8, 2026', amount: '250,000', status: 'pending', pctUnlocked: 100 },
  ],
  onChainData: {
    programId: 'MeMeL0ckPr0gram111111111111111111111111111',
    lockAccount: '7xKp3mNq9aRt7kLm4bCx2pQw8mKl9rTxYzAbCdEf',
    tokenVault: '9aRt7kLm4bCx2pQw8mKl9rTxYzAbCdEfGhIjKlMn',
    merkleRoot: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
  },
  activity: [
    { epoch: '482', slot: '208,443,291', action: 'Lock Created', amount: '1,000,000 FLOW', hash: '7xKp...3mNq', time: '2026-01-08 14:23:01' },
    { epoch: '482', slot: '208,443,445', action: 'Boost Enabled', amount: '0.45 SOL', hash: '9aRt...7kLm', time: '2026-01-08 14:24:18' },
  ],
};

export default function LockProofPage() {
  const params = useParams();
  const lock = mockLockData; // In production, fetch by params.address

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link href="/explore" className="text-sm text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Explore
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8CCBBF]/20 to-[#817CCD]/20 flex items-center justify-center text-3xl">
            {lock.token.icon}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-editorial text-3xl text-[#1A1A1A]">{lock.token.name} Lock</h1>
              <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 ${
                lock.status === 'active' 
                  ? 'bg-[#50908D]/10 text-[#50908D]' 
                  : 'bg-[#E5E0D8] text-[#8A8A8A]'
              }`}>
                {lock.status}
              </span>
            </div>
            <p className="text-sm text-[#8A8A8A] font-mono">{lock.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <a
            href={`https://solscan.io/account/${lock.onChainData.lockAccount}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Explorer
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="editorial-card p-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">Lock Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Token</span>
                  <span className="font-mono text-sm">{lock.token.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Amount</span>
                  <span className="font-mono">{lock.amount}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Type</span>
                  <span className="capitalize">{lock.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Created</span>
                  <span>{lock.createdAt}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Start Date</span>
                  <span>{lock.startDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">End Date</span>
                  <span>{lock.endDate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Cliff</span>
                  <span>{lock.cliffDuration}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Cancel Authority</span>
                  <span className="capitalize">{lock.cancelAuthority}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unlock Schedule */}
          <div className="editorial-card p-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">Unlock Schedule</h2>
            
            {/* Progress bar */}
            <div className="mb-6">
              <div className="relative h-3 bg-[#E5E0D8] rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#50908D] to-[#817CCD] rounded-full"
                  style={{ width: '25%' }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#8A8A8A]">
                <span>0%</span>
                <span>25% complete</span>
                <span>100%</span>
              </div>
            </div>

            {/* Schedule table */}
            <div className="space-y-3">
              {lock.schedule.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#FAFAF8] border border-[#E5E0D8]">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      item.status === 'unlocked' 
                        ? 'bg-[#50908D] text-white' 
                        : 'border-2 border-[#E5E0D8] text-[#8A8A8A]'
                    }`}>
                      {item.status === 'unlocked' ? '✓' : i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-[#1A1A1A]">{item.date}</div>
                      <div className="text-xs text-[#8A8A8A]">{item.pctUnlocked}% of total</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[#1A1A1A]">{item.amount}</div>
                    <div className={`text-[10px] uppercase tracking-[0.1em] ${
                      item.status === 'unlocked' ? 'text-[#50908D]' : 'text-[#8A8A8A]'
                    }`}>
                      {item.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On-Chain Activity */}
          <div className="editorial-card overflow-hidden">
            <div className="p-6 border-b border-[#E5E0D8]">
              <h2 className="font-editorial text-xl text-[#1A1A1A]">On-Chain Activity</h2>
            </div>
            <table className="data-table">
              <thead>
                <tr className="bg-[#FAFAF8]">
                  <th className="px-6">Epoch/Slot</th>
                  <th className="px-6">Action</th>
                  <th className="px-6">Amount</th>
                  <th className="px-6">Hash</th>
                  <th className="px-6">Time</th>
                </tr>
              </thead>
              <tbody>
                {lock.activity.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 text-[#8A8A8A]">{row.epoch}/{row.slot}</td>
                    <td className="px-6">
                      <span className={`inline-flex items-center gap-1.5 ${
                        row.action === 'Lock Created' ? 'text-[#50908D]' :
                        row.action === 'Boost Enabled' ? 'text-[#817CCD]' :
                        'text-[#C47809]'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {row.action}
                      </span>
                    </td>
                    <td className="px-6">{row.amount}</td>
                    <td className="px-6 text-[#8A8A8A]">{row.hash}</td>
                    <td className="px-6 text-[#8A8A8A]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#E5E0D8] text-[11px] text-[#8A8A8A]">
              Verifiable via Solana Explorer • Merkle root: {lock.onChainData.merkleRoot.slice(0, 20)}...
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Yield Boost Card */}
          {lock.yieldBoost.enabled && (
            <div className="editorial-card p-6 border-l-2 border-l-[#C47809]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#C47809]">⚡</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#C47809] font-medium">Yield Boost Active</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A8A]">Buy Price Attested</span>
                  <span className="font-mono">{lock.yieldBoost.buyPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A8A]">Fee Paid</span>
                  <span className="font-mono">{lock.yieldBoost.feePaid}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A8A]">Matched Stake</span>
                  <span className="font-mono">{lock.yieldBoost.matchedStake}</span>
                </div>
                <div className="hairline my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A8A]">Current APY</span>
                  <span className="text-[#50908D] font-medium">{lock.yieldBoost.apy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A8A]">Yield Accrued</span>
                  <span className="text-[#50908D] font-mono font-medium">+{lock.yieldBoost.yieldAccrued}</span>
                </div>
              </div>

              <button className="btn-primary w-full mt-6 justify-center">
                Claim Yield
              </button>
            </div>
          )}

          {/* Addresses */}
          <div className="editorial-card p-6">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-4">Addresses</h3>
            
            <div className="space-y-4">
              <div>
                <div className="text-xs text-[#8A8A8A] mb-1">Creator</div>
                <div className="font-mono text-xs text-[#1A1A1A] break-all">{lock.creator}</div>
              </div>
              <div>
                <div className="text-xs text-[#8A8A8A] mb-1">Recipient</div>
                <div className="font-mono text-xs text-[#1A1A1A] break-all">{lock.recipient}</div>
              </div>
              <div>
                <div className="text-xs text-[#8A8A8A] mb-1">Token Mint</div>
                <div className="font-mono text-xs text-[#1A1A1A] break-all">{lock.token.mint}</div>
              </div>
              <div>
                <div className="text-xs text-[#8A8A8A] mb-1">Lock Account</div>
                <div className="font-mono text-xs text-[#1A1A1A] break-all">{lock.onChainData.lockAccount}</div>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="editorial-card p-6 bg-[#FAFAF8]">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-[#50908D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-[#1A1A1A]">Verified On-Chain</span>
            </div>
            <p className="text-xs text-[#8A8A8A] leading-relaxed">
              This lock is secured by an immutable smart contract on Solana. All data is verifiable through the blockchain explorer.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
