'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#E5E0D8] bg-[var(--parchment)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
        {/* Top section */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#50908D" />
                    <stop offset="50%" stopColor="#817CCD" />
                    <stop offset="100%" stopColor="#C47809" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" stroke="url(#footerLogoGrad)" strokeWidth="2" fill="none" />
                <path
                  d="M10 16C10 16 13 12 16 12C19 12 22 16 22 16C22 16 19 20 16 20C13 20 10 16 10 16Z"
                  stroke="url(#footerLogoGrad)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="16" cy="16" r="2" fill="url(#footerLogoGrad)" />
              </svg>
              <div className="h-5 w-[1px] bg-[#C47809]" />
              <span className="font-editorial text-lg gradient-wordmark">SOLFLOW</span>
            </div>
            <p className="text-sm text-[#8A8A8A] max-w-xs leading-relaxed">
              Token locking and vesting infrastructure for Solana. Build trust with public proof pages.
            </p>
          </div>

          {/* Links */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">Product</div>
            <ul className="space-y-2">
              <li>
                <Link href="/create" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">
                  Create Lock
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/stats" className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors">
                  Stats
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">Resources</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://docs.solflow.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/solflowfun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/solflowdotfun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors"
                >
                  X (Twitter)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="hairline mb-6" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8A8A8A]">
          <p>© 2026 Solflow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://solflow.fun" target="_blank" rel="noopener noreferrer" className="hover:text-[#1A1A1A] transition-colors">
              solflow.fun
            </a>
            <span className="text-[#D4CFC4]">•</span>
            <span>Built on Solana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
