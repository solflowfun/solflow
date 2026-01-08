'use client';

import { FC } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Lock, Clock, Zap, Shield, Users, ArrowRight, 
  Coins, TrendingUp, CheckCircle, ChevronRight 
} from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Token Locks',
    description: 'Single unlock date for team tokens, marketing wallets, and LP tokens. Irreversible and trustless.',
    color: 'brand',
  },
  {
    icon: Clock,
    title: 'Vesting Schedules',
    description: 'Progressive unlock with customizable intervals, cliff periods, and flexible permissions.',
    color: 'accent',
  },
  {
    icon: Zap,
    title: 'Yield Boost',
    description: 'Earn staking yield on your locked tokens. Pay a small fee and we match it with staked SOL.',
    color: 'warning',
  },
  {
    icon: Shield,
    title: 'Public Proofs',
    description: 'Shareable proof pages that anyone can verify. Build trust with your community.',
    color: 'success',
  },
];

const stats = [
  { value: '$12.5M', label: 'Total Value Locked' },
  { value: '1,234', label: 'Active Contracts' },
  { value: '456', label: 'Projects' },
  { value: '99.9%', label: 'Uptime' },
];

const steps = [
  {
    number: '01',
    title: 'Connect Wallet',
    description: 'Connect your Solana wallet to get started.',
  },
  {
    number: '02',
    title: 'Choose Lock Type',
    description: 'Select between a simple lock or vesting schedule.',
  },
  {
    number: '03',
    title: 'Set Parameters',
    description: 'Configure unlock date, amounts, and permissions.',
  },
  {
    number: '04',
    title: 'Lock & Share',
    description: 'Create your lock and share the proof page.',
  },
];

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/20 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8">
                <Zap className="h-4 w-4 text-brand-400" />
                <span className="text-sm text-brand-300">Introducing Yield Boost</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight">
                <span className="gradient-text">Lock Tokens.</span>
                <br />
                <span className="text-white">Build Trust.</span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-surface-300 max-w-2xl mx-auto">
                The premier token locking platform for Solana memecoins. 
                Secure vesting schedules with on-chain proofs and earn yield through our innovative Yield Boost feature.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/create"
                  className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-glow"
                >
                  Create Lock
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-surface-800/50 hover:bg-surface-700/50 text-white font-semibold transition-all border border-surface-700"
                >
                  Explore Locks
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-surface-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-display font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-surface-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Everything You Need
            </h2>
            <p className="mt-4 text-surface-400 max-w-2xl mx-auto">
              A complete toolkit for token locking and vesting on Solana
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-card-hover p-8"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${feature.color}-500/20 mb-6`}>
                    <Icon className={`h-6 w-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-surface-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-surface-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              How It Works
            </h2>
            <p className="mt-4 text-surface-400">
              Lock your tokens in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-brand-500/50 to-transparent" />
                )}
                <div className="text-5xl font-display font-bold text-brand-500/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-surface-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Yield Boost Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-12 gradient-border">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning-500/10 border border-warning-500/20 mb-6">
                  <Zap className="h-4 w-4 text-warning-400" />
                  <span className="text-sm text-warning-300">Exclusive Feature</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
                  Earn Yield While <span className="text-warning-400">Locked</span>
                </h2>
                <p className="text-surface-300 mb-8">
                  Our unique Yield Boost feature lets you earn staking rewards on your locked tokens. 
                  Pay a small fee based on your token's buy price, and we'll match it with staked SOL. 
                  At unlock, you receive the generated yield.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    'Fee based on your actual buy price',
                    'Protocol matches your fee with staked SOL',
                    'Yield accrues throughout lock period',
                    'Transparent on-chain tracking',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success-400 shrink-0 mt-0.5" />
                      <span className="text-surface-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 text-warning-400 hover:text-warning-300 font-medium"
                >
                  Try Yield Boost
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-warning-500/20 to-accent-500/20 rounded-2xl blur-2xl" />
                <div className="relative glass-card p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-400">Your Fee</span>
                      <span className="text-lg font-semibold">0.5 SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-400">Protocol Matched</span>
                      <span className="text-lg font-semibold text-accent-400">0.5 SOL</span>
                    </div>
                    <div className="h-px bg-surface-700" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-400">Total Staked</span>
                      <span className="text-lg font-semibold">1.0 SOL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-400">Est. APY</span>
                      <span className="text-lg font-semibold text-success-400">~7.5%</span>
                    </div>
                    <div className="h-px bg-surface-700" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-400">Est. Yield (1 year)</span>
                      <span className="text-xl font-bold gradient-text">~0.075 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto mb-10">
              Join hundreds of projects building trust with their communities through transparent token locking.
            </p>
            <Link
              href="/create"
              className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-glow"
            >
              Create Your First Lock
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

