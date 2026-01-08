'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Lock, Twitter, Github } from 'lucide-react';

export const Footer: FC = () => {
  return (
    <footer className="border-t border-cream-400/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div 
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, #D5522E 0%, #E08B46 60%, #C47809 100%)' }}
              >
                <Lock className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-display text-base font-semibold tracking-tight text-ember">
                SolFlow
              </span>
            </Link>
            <p className="text-sm text-charcoal-400 max-w-xs">
              Solana-native token locking and vesting with public proof pages.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm">
            <Link href="/create" className="link-ember">Create</Link>
            <Link href="/explore" className="link-ember">Explore</Link>
            <Link href="/stats" className="link-ember">Stats</Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a 
              href="https://x.com/solflowdotfun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-charcoal-400 hover:text-ember-red hover:bg-cream-300/50 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a 
              href="https://github.com/solflowfun/solflow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-charcoal-400 hover:text-ember-red hover:bg-cream-300/50 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-cream-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <span>© 2026 SolFlow. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-ember-red transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-ember-red transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
