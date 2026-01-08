'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Lock, Twitter, Github } from 'lucide-react';

export const Footer: FC = () => {
  return (
    <footer className="border-t border-surface-800/30 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-violet-500">
                <Lock className="h-3 w-3 text-white" />
              </div>
              <span className="font-display text-sm font-semibold tracking-tight">
                SolFlow
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-6 text-xs text-surface-500">
              <Link href="/create" className="hover:text-surface-300 transition-colors">
                Create
              </Link>
              <Link href="/explore" className="hover:text-surface-300 transition-colors">
                Explore
              </Link>
              <Link href="/stats" className="hover:text-surface-300 transition-colors">
                Stats
              </Link>
            </div>
          </div>

          {/* Social + Copyright */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <a 
                href="https://x.com/solflowdotfun" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-800/30 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://github.com/solflowfun/solflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-surface-500 hover:text-surface-300 hover:bg-surface-800/30 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
            <span className="text-xs text-surface-600">
              © 2026 SolFlow
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
