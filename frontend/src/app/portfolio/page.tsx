'use client';

import { FC } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { 
  Lock, Wallet, Clock, ArrowUpRight, 
  Plus, Filter, Search 
} from 'lucide-react';

// Mock data
const mockContracts = [
  {
    address: '4xYz...aBcD',
    kind: 'lock',
    state: 'active',
    tokenSymbol: 'PEPE',
    totalAmount: '1,000,000',
    unlockDate: '2025-01-01',
    progress: 45,
    role: 'sender',
    yieldBoost: true,
  },
  {
    address: '7kLm...nOpQ',
    kind: 'vesting',
    state: 'active',
    tokenSymbol: 'BONK',
    totalAmount: '50,000,000',
    unlockDate: '2024-12-31',
    progress: 75,
    role: 'recipient',
    yieldBoost: false,
  },
  {
    address: '9rSt...uVwX',
    kind: 'lock',
    state: 'completed',
    tokenSymbol: 'WIF',
    totalAmount: '10,000',
    unlockDate: '2024-01-15',
    progress: 100,
    role: 'recipient',
    yieldBoost: true,
  },
];

export default function PortfolioPage() {
  const { connected, publicKey } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-brand-500 mx-auto mb-6" />
          <h1 className="text-2xl font-display font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-surface-400">Connect a Solana wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  const createdContracts = mockContracts.filter(c => c.role === 'sender');
  const receivedContracts = mockContracts.filter(c => c.role === 'recipient');

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Portfolio</h1>
            <p className="text-surface-400">
              Manage your locks and vesting contracts
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Lock
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
          >
            <div className="stat-value gradient-text">3</div>
            <div className="stat-label">Total Contracts</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card"
          >
            <div className="stat-value text-accent-400">2</div>
            <div className="stat-label">Active</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="stat-value text-warning-400">2</div>
            <div className="stat-label">With Yield Boost</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-surface-800 mb-8">
          <button className="px-4 py-3 border-b-2 border-brand-500 text-white font-medium">
            Created ({createdContracts.length})
          </button>
          <button className="px-4 py-3 border-b-2 border-transparent text-surface-400 hover:text-white font-medium">
            Received ({receivedContracts.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search by token or address..."
              className="input-glow w-full pl-12"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-3 bg-surface-800 hover:bg-surface-700 rounded-xl transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Contracts List */}
        <div className="space-y-4">
          {mockContracts.map((contract, index) => (
            <motion.div
              key={contract.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/locks/${contract.address}`}
                className="glass-card-hover p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-lg font-bold">
                    {contract.tokenSymbol.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{contract.totalAmount} {contract.tokenSymbol}</span>
                      <span className={`tag ${contract.kind === 'lock' ? 'tag-brand' : 'tag-accent'}`}>
                        {contract.kind}
                      </span>
                      {contract.yieldBoost && (
                        <span className="tag tag-warning">Yield Boost</span>
                      )}
                    </div>
                    <div className="text-sm text-surface-400 mt-1">
                      <span className="font-mono">{contract.address}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{contract.role}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-surface-400">Unlock Date</div>
                    <div className="font-medium">{contract.unlockDate}</div>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-surface-400">Progress</span>
                      <span>{contract.progress}%</span>
                    </div>
                    <div className="progress-glow">
                      <div 
                        className="progress-glow-fill" 
                        style={{ width: `${contract.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className={`tag ${
                    contract.state === 'completed' ? 'tag-success' : 
                    contract.state === 'active' ? 'tag-brand' : 'tag-warning'
                  }`}>
                    {contract.state}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-surface-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {mockContracts.length === 0 && (
          <div className="text-center py-16">
            <Lock className="h-16 w-16 text-surface-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">No contracts found</h3>
            <p className="text-surface-400 mb-6">
              You haven't created or received any locks yet.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Your First Lock
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

