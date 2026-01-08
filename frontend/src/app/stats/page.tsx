'use client';

import { FC } from 'react';
import Link from 'next/link';
import { BarChart3, Lock } from 'lucide-react';

export default function StatsPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-4">Protocol Analytics</h1>
          <p className="text-charcoal-400">
            Real-time statistics for SolFlow protocol
          </p>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div 
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 100%)' }}
          >
            <BarChart3 className="h-10 w-10 text-ember-orange" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal-800 mb-2">No data yet</h3>
          <p className="text-charcoal-400 mb-8 max-w-sm mx-auto">
            Statistics will appear once locks are created on the protocol.
          </p>
          <Link href="/create" className="btn-ember">
            Create First Lock
          </Link>
        </div>
      </div>
    </div>
  );
}
