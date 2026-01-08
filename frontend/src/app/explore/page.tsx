'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, Filter, Lock, Clock, ArrowUpRight, 
  TrendingUp, Users, Coins, ChevronDown 
} from 'lucide-react';

// Mock data
const mockContracts = [
  {
    address: '4xYz...aBcD',
    kind: 'lock',
    state: 'active',
    tokenSymbol: 'PEPE',
    tokenName: 'Pepe Token',
    totalAmount: '1,000,000,000',
    unlockDate: '2025-01-01',
    sender: '8kJn...xYzW',
    project: 'Pepe Protocol',
    verified: true,
    yieldBoost: true,
  },
  {
    address: '7kLm...nOpQ',
    kind: 'vesting',
    state: 'active',
    tokenSymbol: 'BONK',
    tokenName: 'Bonk',
    totalAmount: '500,000,000,000',
    unlockDate: '2024-12-31',
    sender: '3mQp...vBnM',
    project: 'Bonk DAO',
    verified: true,
    yieldBoost: false,
  },
  {
    address: '9rSt...uVwX',
    kind: 'lock',
    state: 'active',
    tokenSymbol: 'WIF',
    tokenName: 'dogwifhat',
    totalAmount: '100,000,000',
    unlockDate: '2025-06-01',
    sender: '5nTu...wXyZ',
    project: null,
    verified: false,
    yieldBoost: true,
  },
];

const topProjects = [
  { name: 'Pepe Protocol', tvl: '$2.5M', locks: 12, verified: true },
  { name: 'Bonk DAO', tvl: '$1.8M', locks: 8, verified: true },
  { name: 'Dogwifhat', tvl: '$950K', locks: 5, verified: false },
  { name: 'Popcat', tvl: '$720K', locks: 4, verified: false },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold mb-4">Explore Locks</h1>
          <p className="text-surface-400 max-w-2xl mx-auto">
            Browse and verify token locks across Solana projects
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by contract address, token, or project..."
              className="input-glow w-full pl-12 pr-4 py-4 text-lg"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-surface-400 mb-2 block">Type</label>
                  <div className="space-y-2">
                    {['all', 'lock', 'vesting'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`w-full px-4 py-2 rounded-lg text-left text-sm transition-colors ${
                          filter === type
                            ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                            : 'hover:bg-surface-800'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-surface-400 mb-2 block">Status</label>
                  <div className="space-y-2">
                    {['active', 'scheduled', 'completed'].map((status) => (
                      <button
                        key={status}
                        className="w-full px-4 py-2 rounded-lg text-left text-sm hover:bg-surface-800 transition-colors"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-surface-600" />
                    <span className="text-sm">Yield Boost only</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-surface-600" />
                    <span className="text-sm">Verified projects only</span>
                  </label>
                </div>
              </div>

              {/* Top Projects */}
              <div className="mt-8 pt-6 border-t border-surface-800">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Projects
                </h3>
                <div className="space-y-3">
                  {topProjects.map((project, index) => (
                    <Link
                      key={project.name}
                      href={`/project/${project.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-surface-500">{index + 1}</span>
                        <div>
                          <div className="text-sm font-medium flex items-center gap-1">
                            {project.name}
                            {project.verified && (
                              <span className="w-3 h-3 rounded-full bg-success-500 flex items-center justify-center text-[8px]">✓</span>
                            )}
                          </div>
                          <div className="text-xs text-surface-500">{project.locks} locks</div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-brand-400">{project.tvl}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-surface-400">
                Showing {mockContracts.length} results
              </span>
              <button className="flex items-center gap-2 text-sm text-surface-400 hover:text-white">
                Sort by: Recent
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Contracts Grid */}
            <div className="space-y-4">
              {mockContracts.map((contract, index) => (
                <motion.div
                  key={contract.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/locks/${contract.address}`}
                    className="glass-card-hover p-6 block group"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-xl font-bold shrink-0">
                          {contract.tokenSymbol.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-semibold">
                              {contract.totalAmount} {contract.tokenSymbol}
                            </span>
                            <span className={`tag ${contract.kind === 'lock' ? 'tag-brand' : 'tag-accent'}`}>
                              {contract.kind}
                            </span>
                            {contract.yieldBoost && (
                              <span className="tag tag-warning">Yield Boost</span>
                            )}
                            {contract.verified && (
                              <span className="tag tag-success">Verified</span>
                            )}
                          </div>
                          <div className="text-sm text-surface-400 mt-1">
                            {contract.tokenName}
                          </div>
                          {contract.project && (
                            <div className="text-sm text-brand-400 mt-1">
                              {contract.project}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-surface-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {contract.sender}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Unlocks {contract.unlockDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-surface-500 group-hover:text-brand-400 transition-colors shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-sm">
                Previous
              </button>
              <button className="px-4 py-2 rounded-lg bg-brand-500/20 text-brand-400 text-sm">
                1
              </button>
              <button className="px-4 py-2 rounded-lg hover:bg-surface-800 text-sm">
                2
              </button>
              <button className="px-4 py-2 rounded-lg hover:bg-surface-800 text-sm">
                3
              </button>
              <button className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-sm">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

