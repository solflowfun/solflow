'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Logo mark component
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#50908D" />
          <stop offset="50%" stopColor="#817CCD" />
          <stop offset="100%" stopColor="#C47809" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" stroke="url(#logoGrad)" strokeWidth="2" fill="none" />
      <path
        d="M10 16C10 16 13 12 16 12C19 12 22 16 22 16C22 16 19 20 16 20C13 20 10 16 10 16Z"
        stroke="url(#logoGrad)"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="16" cy="16" r="2" fill="url(#logoGrad)" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/create', label: 'Create' },
    { href: '/explore', label: 'Explore' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/stats', label: 'Stats' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--parchment)]/95 backdrop-blur-sm border-b border-[#E5E0D8]">
      <nav className="max-w-7xl mx-auto px-6 lg:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <LogoMark />
          <div className="h-6 w-[1px] bg-[#C47809]" />
          <span className="font-editorial text-xl tracking-wide gradient-wordmark">
            SOLFLOW
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? 'text-[#1A1A1A] font-medium'
                  : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet Button */}
        <div className="flex items-center gap-4">
          <WalletMultiButton />
        </div>
      </nav>
    </header>
  );
}
