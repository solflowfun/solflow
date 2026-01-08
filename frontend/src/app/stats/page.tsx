'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Lock, Users, Coins, 
  ArrowUp, ArrowDown, Activity 
} from 'lucide-react';

// Mock data
const stats = {
  tvl: '$12.5M',
  tvlChange: 12.5,
  totalContracts: 1234,
  activeContracts: 856,
  totalProjects: 156,
  yieldBoostActive: 423,
  totalYieldDistributed: '$45.2K',
};

const recentActivity = [
  { type: 'lock', token: 'PEPE', amount: '1B', time: '2 min ago' },
  { type: 'claim', token: 'BONK', amount: '500M', time: '5 min ago' },
  { type: 'vesting', token: 'WIF', amount: '10M', time: '12 min ago' },
  { type: 'lock', token: 'POPCAT', amount: '25M', time: '18 min ago' },
  { type: 'claim', token: 'PEPE', amount: '100M', time: '25 min ago' },
];

const topTokens = [
  { symbol: 'PEPE', name: 'Pepe Token', tvl: '$3.2M', contracts: 145, change: 8.5 },
  { symbol: 'BONK', name: 'Bonk', tvl: '$2.8M', contracts: 98, change: -2.3 },
  { symbol: 'WIF', name: 'dogwifhat', tvl: '$1.9M', contracts: 67, change: 15.2 },
  { symbol: 'POPCAT', name: 'Popcat', tvl: '$1.2M', contracts: 45, change: 22.1 },
  { symbol: 'MEW', name: 'cat in a dogs world', tvl: '$890K', contracts: 34, change: -5.7 },
];

export default function StatsPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold mb-4">Protocol Analytics</h1>
          <p className="text-surface-400">
            Real-time statistics for SolFlow protocol
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-brand-500/20">
                <Coins className="h-6 w-6 text-brand-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stats.tvlChange > 0 ? 'text-success-400' : 'text-error-400'}`}>
                {stats.tvlChange > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {Math.abs(stats.tvlChange)}%
              </div>
            </div>
            <div className="text-3xl font-display font-bold gradient-text">{stats.tvl}</div>
            <div className="text-sm text-surface-400 mt-1">Total Value Locked</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-accent-500/20">
                <Lock className="h-6 w-6 text-accent-400" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold">{stats.totalContracts.toLocaleString()}</div>
            <div className="text-sm text-surface-400 mt-1">Total Contracts</div>
            <div className="text-xs text-accent-400 mt-2">{stats.activeContracts} active</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-success-500/20">
                <Users className="h-6 w-6 text-success-400" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold">{stats.totalProjects}</div>
            <div className="text-sm text-surface-400 mt-1">Projects</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-warning-500/20">
                <TrendingUp className="h-6 w-6 text-warning-400" />
              </div>
            </div>
            <div className="text-3xl font-display font-bold">{stats.totalYieldDistributed}</div>
            <div className="text-sm text-surface-400 mt-1">Yield Distributed</div>
            <div className="text-xs text-warning-400 mt-2">{stats.yieldBoostActive} active boosts</div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top Tokens */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-6">Top Tokens by TVL</h3>
              <div className="space-y-4">
                {topTokens.map((token, index) => (
                  <motion.div
                    key={token.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface-800/50 hover:bg-surface-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-surface-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="font-medium">{token.tvl}</div>
                        <div className="text-xs text-surface-400">{token.contracts} contracts</div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm min-w-[60px] justify-end ${
                        token.change > 0 ? 'text-success-400' : 'text-error-400'
                      }`}>
                        {token.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        {Math.abs(token.change)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-400" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-surface-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activity.type === 'lock' ? 'bg-brand-500/20' :
                        activity.type === 'claim' ? 'bg-success-500/20' : 'bg-accent-500/20'
                      }`}>
                        <Lock className={`h-4 w-4 ${
                          activity.type === 'lock' ? 'text-brand-400' :
                          activity.type === 'claim' ? 'text-success-400' : 'text-accent-400'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium capitalize">{activity.type}</div>
                        <div className="text-xs text-surface-400">{activity.amount} {activity.token}</div>
                      </div>
                    </div>
                    <span className="text-xs text-surface-500">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">TVL Over Time</h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-surface-700 rounded-xl">
            <span className="text-surface-500">Chart visualization would go here</span>
          </div>
        </div>
      </div>
    </div>
  );
}

