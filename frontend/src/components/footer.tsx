'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Zap, Twitter, Github, FileText } from 'lucide-react';

export const Footer: FC = () => {
  return (
    <footer className="border-t border-surface-800/50 bg-surface-950/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold">
                Sol<span className="text-brand-400">Flow</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-surface-400 max-w-md">
              The premier token locking and vesting platform for Solana. Secure your tokens with 
              on-chain proofs and earn yield through our innovative Yield Boost feature.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a 
                href="https://twitter.com/solflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-800/50 hover:bg-surface-700 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://github.com/solflow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface-800/50 hover:bg-surface-700 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="/docs" 
                className="p-2 rounded-lg bg-surface-800/50 hover:bg-surface-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/create" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Create Lock
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Explore Locks
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/docs" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/solflow" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-surface-400 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/audits" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Security Audits
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-surface-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} SolFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">
              Privacy
            </Link>
            <Link href="/risks" className="text-xs text-surface-500 hover:text-surface-300 transition-colors">
              Risk Disclosures
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

