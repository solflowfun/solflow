'use client';

import { FC } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Lock, Wallet, Plus } from 'lucide-react';

export default function PortfolioPage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 100%)' }}
          >
            <Wallet className="h-8 w-8 text-ember-red" />
          </div>
          <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-4">Connect Your Wallet</h1>
          <p className="text-charcoal-400">Connect a Solana wallet to view your portfolio</p>
        </div>
      </div>
    );
  }

  // Empty state - no fake data
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-2">Portfolio</h1>
            <p className="text-charcoal-400">
              Manage your locks and vesting contracts
            </p>
          </div>
          <Link href="/create" className="btn-ember">
            <Plus className="h-4 w-4" />
            Create Lock
          </Link>
        </div>

        {/* Empty State */}
        <div className="text-center py-24">
          <div 
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 100%)' }}
          >
            <Lock className="h-10 w-10 text-ember-orange" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal-800 mb-2">No contracts yet</h3>
          <p className="text-charcoal-400 mb-8 max-w-sm mx-auto">
            You haven't created or received any locks yet. Create your first lock to get started.
          </p>
          <Link href="/create" className="btn-ember">
            <Plus className="h-4 w-4" />
            Create Your First Lock
          </Link>
        </div>
      </div>
    </div>
  );
}
