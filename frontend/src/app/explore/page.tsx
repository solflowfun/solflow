'use client';

import { useState } from 'react';
import Link from 'next/link';

// Mock data for demo
const mockLocks = [
  {
    id: '7xKp3mNq',
    token: '$FLOW',
    tokenIcon: '🌊',
    amount: '1,000,000',
    creator: 'Flo3...x7Kp',
    recipient: 'Flo3...x7Kp',
    type: 'vesting',
    status: 'active',
    unlockDate: 'Dec 15, 2026',
    progress: 25,
    yieldBoost: true,
    yieldAccrued: '2.34 SOL',
  },
  {
    id: '9aRt7kLm',
    token: '$MOON',
    tokenIcon: '🌙',
    amount: '500,000',
    creator: 'Mn8a...pQ2w',
    recipient: 'Mn8a...pQ2w',
    type: 'lock',
    status: 'active',
    unlockDate: 'Jun 1, 2026',
    progress: 45,
    yieldBoost: false,
    yieldAccrued: null,
  },
  {
    id: '4bCx2pQw',
    token: '$PEPE',
    tokenIcon: '🐸',
    amount: '10,000,000',
    creator: 'Pe4x...mN9k',
    recipient: 'Te4m...wLl7',
    type: 'vesting',
    status: 'active',
    unlockDate: 'Mar 30, 2027',
    progress: 10,
    yieldBoost: true,
    yieldAccrued: '0.87 SOL',
  },
  {
    id: '2mKl9rTx',
    token: '$DOGE',
    tokenIcon: '🐕',
    amount: '2,500,000',
    creator: 'Dg7k...pL3m',
    recipient: 'Dg7k...pL3m',
    type: 'lock',
    status: 'unlocked',
    unlockDate: 'Jan 1, 2026',
    progress: 100,
    yieldBoost: false,
    yieldAccrued: null,
  },
];

type FilterType = 'all' | 'lock' | 'vesting';
type FilterStatus = 'all' | 'active' | 'unlocked';

export default function ExplorePage() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocks = mockLocks.filter(lock => {
    if (filterType !== 'all' && lock.type !== filterType) return false;
    if (filterStatus !== 'all' && lock.status !== filterStatus) return false;
    if (searchQuery && !lock.token.toLowerCase().includes(searchQuery.toLowerCase()) && !lock.id.includes(searchQuery)) return false;
    return true;
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-3">Explore</div>
        <h1 className="font-editorial text-4xl text-[#1A1A1A] mb-4">Token Locks</h1>
        <p className="text-[#4A4A4A]">Browse public proof pages for token locks and vesting schedules.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by token or ID..."
            className="w-full pl-11 pr-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#50908D] text-sm"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {(['all', 'lock', 'vesting'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm border transition-all capitalize ${
                filterType === type
                  ? 'border-[#50908D] bg-[#50908D]/5 text-[#50908D]'
                  : 'border-[#E5E0D8] text-[#4A4A4A] hover:border-[#D4CFC4]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {(['all', 'active', 'unlocked'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm border transition-all capitalize ${
                filterStatus === status
                  ? 'border-[#817CCD] bg-[#817CCD]/5 text-[#817CCD]'
                  : 'border-[#E5E0D8] text-[#4A4A4A] hover:border-[#D4CFC4]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-[#8A8A8A] mb-6">
        {filteredLocks.length} lock{filteredLocks.length !== 1 ? 's' : ''} found
      </div>

      {/* Locks grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredLocks.map((lock) => (
          <Link
            key={lock.id}
            href={`/locks/${lock.id}`}
            className="editorial-card p-6 hover:shadow-md transition-shadow group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8CCBBF]/20 to-[#817CCD]/20 flex items-center justify-center text-xl">
                  {lock.tokenIcon}
                </div>
                <div>
                  <div className="font-medium text-[#1A1A1A] group-hover:text-[#50908D] transition-colors">
                    {lock.token}
                  </div>
                  <div className="text-xs text-[#8A8A8A] font-mono">{lock.id}</div>
                </div>
              </div>
              <div className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 ${
                lock.status === 'active' 
                  ? 'bg-[#50908D]/10 text-[#50908D]' 
                  : 'bg-[#E5E0D8] text-[#8A8A8A]'
              }`}>
                {lock.status}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8A8A]">Amount</span>
                <span className="font-mono">{lock.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8A8A]">Type</span>
                <span className="capitalize">{lock.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8A8A]">Unlock</span>
                <span>{lock.unlockDate}</span>
              </div>
              {lock.yieldBoost && lock.yieldAccrued && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8A8A8A]">Yield Accrued</span>
                  <span className="text-[#50908D] font-mono">+{lock.yieldAccrued}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="relative h-1 bg-[#E5E0D8] rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#50908D] to-[#817CCD] rounded-full transition-all"
                style={{ width: `${lock.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[#8A8A8A]">
              <span>{lock.progress}% unlocked</span>
              {lock.yieldBoost && (
                <span className="text-[#C47809]">⚡ Yield Boost</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {filteredLocks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-[#4A4A4A] mb-2">No locks found</p>
          <p className="text-sm text-[#8A8A8A]">Try adjusting your filters or search query.</p>
        </div>
      )}
    </main>
  );
}
