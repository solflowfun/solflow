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
    <nav className="sticky top-0 z-50 border-b border-cream-500/20 bg-cream-300/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div 
              className="flex h-7 w-7 items-center justify-center rounded-lg shadow-soft"
              style={{ background: 'linear-gradient(135deg, #D5522E 0%, #E08B46 50%, #C47809 100%)' }}
            >
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-ember">
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
                      ? 'text-charcoal-800'
                      : 'text-charcoal-500 hover:text-charcoal-700'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-cream-400/80 rounded-full border border-cream-500/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  {/* Active underline with ember gradient */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D5522E 0%, #E08B46 50%, #C47809 100%)' }}
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
            <WalletMultiButton className="!h-8 !px-4 !text-xs !font-medium" />
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-cream-400/50 transition-colors text-charcoal-600"
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
            className="md:hidden border-t border-cream-500/20 bg-cream-200/95 backdrop-blur-xl"
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
                        ? 'bg-cream-400/50 text-charcoal-800'
                        : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-cream-400/30'
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
