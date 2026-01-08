'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Lock, BarChart3, Wallet, Search } from 'lucide-react';

const navItems = [
  { href: '/create', label: 'Create', icon: Lock },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/explore', label: 'Explore', icon: Search },
  { href: '/stats', label: 'Stats', icon: BarChart3 },
];

export const Navbar: FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-800/30 bg-surface-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-violet-500">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              SolFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-surface-400 hover:text-surface-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-surface-800/80 rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-3">
            <WalletMultiButton className="!bg-white !text-surface-950 hover:!bg-surface-100 !rounded-full !h-8 !px-4 !text-xs !font-medium !border-0" />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-surface-800/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-surface-800/30 bg-surface-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-surface-800/50 text-white'
                        : 'text-surface-400 hover:text-white hover:bg-surface-800/30'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
