'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { Search, Lock } from 'lucide-react';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-4">Explore Locks</h1>
          <p className="text-charcoal-400 max-w-2xl mx-auto">
            Browse and verify token locks across Solana projects
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by contract address, token, or project..."
              className="input-field w-full pl-12 pr-4 py-4 text-lg"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div 
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 100%)' }}
          >
            <Lock className="h-10 w-10 text-ember-orange" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal-800 mb-2">No locks found</h3>
          <p className="text-charcoal-400 mb-8 max-w-sm mx-auto">
            Be the first to create a token lock on SolFlow.
          </p>
          <Link href="/create" className="btn-ember">
            Create Lock
          </Link>
        </div>
      </div>
    </div>
  );
}
