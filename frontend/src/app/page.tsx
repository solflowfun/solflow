'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Zap, ArrowRight, Check, 
  ChevronDown, Shield, Plus, Minus
} from 'lucide-react';

// Timeline milestones
const milestones = [
  {
    id: 'create',
    step: 1,
    title: 'Create Lock',
    description: 'Define your token amount, recipient, and unlock schedule',
    preview: {
      status: 'Creating',
      tokens: '1,000,000 PEPE',
      progress: 0,
      state: 'Configuring parameters...',
    },
  },
  {
    id: 'confirmed',
    step: 2,
    title: 'Lock Confirmed',
    description: 'Tokens transferred to secure escrow on Solana',
    preview: {
      status: 'Locked',
      tokens: '1,000,000 PEPE',
      progress: 0,
      state: 'Tokens secured in escrow',
    },
  },
  {
    id: 'cliff',
    step: 3,
    title: 'Cliff Released',
    description: 'Initial cliff amount becomes claimable',
    yieldBoost: true,
    preview: {
      status: 'Cliff',
      tokens: '1,000,000 PEPE',
      progress: 10,
      state: '100,000 tokens unlocked (10% cliff)',
      unlocked: '100,000',
    },
  },
  {
    id: 'vesting',
    step: 4,
    title: 'Vest Unlocks',
    description: 'Progressive unlocks according to schedule',
    preview: {
      status: 'Vesting',
      tokens: '1,000,000 PEPE',
      progress: 55,
      state: 'Monthly unlocks in progress',
      unlocked: '550,000',
    },
  },
  {
    id: 'end',
    step: 5,
    title: 'Schedule Complete',
    description: 'All tokens fully vested and available',
    preview: {
      status: 'Complete',
      tokens: '1,000,000 PEPE',
      progress: 100,
      state: 'All tokens unlocked',
      unlocked: '1,000,000',
    },
  },
  {
    id: 'claim',
    step: 6,
    title: 'Claim Tokens',
    description: 'Withdraw unlocked tokens to your wallet',
    preview: {
      status: 'Claimed',
      tokens: '1,000,000 PEPE',
      progress: 100,
      state: 'Tokens transferred to recipient',
      unlocked: '1,000,000',
      claimed: true,
    },
  },
];

const faqs = [
  {
    q: 'Are locks truly irreversible?',
    a: 'Yes. Once created, token locks cannot be modified. The tokens are held in a program-derived escrow account that only releases according to the predefined schedule.',
  },
  {
    q: 'How does Yield Boost work?',
    a: 'You pay a small fee (2% of your token\'s buy price). We match that fee with SOL and stake it. At unlock, you receive the staking yield generated during the lock period.',
  },
  {
    q: 'What tokens are supported?',
    a: 'All SPL tokens and Token-2022 tokens on Solana, including LP tokens from Raydium, Orca, and Meteora.',
  },
  {
    q: 'Can I cancel a vesting contract?',
    a: 'Only if cancellation was enabled at creation. If canceled, unlocked tokens go to the recipient and locked tokens return to the sender.',
  },
];

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const timeline = timelineRef.current;
      const rect = timeline.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far through the timeline section we've scrolled
      const start = rect.top - windowHeight * 0.5;
      const end = rect.bottom - windowHeight * 0.5;
      const current = -start;
      const total = end - start;
      
      const progress = Math.max(0, Math.min(1, current / total));
      setScrollProgress(progress);
      
      // Determine active milestone based on scroll
      const newIndex = Math.min(
        Math.floor(progress * milestones.length),
        milestones.length - 1
      );
      setActiveIndex(Math.max(0, newIndex));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-white mb-6">
            Token locks that
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-violet-400">
              build trust
            </span>
          </h1>
          
          <p className="text-lg text-surface-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Secure vesting schedules with on-chain proofs. 
            Earn yield while locked.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-surface-950 font-medium text-sm hover:bg-surface-100 transition-colors"
            >
              Create Lock
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-surface-700 text-surface-300 font-medium text-sm hover:border-surface-500 hover:text-white transition-colors"
            >
              Explore
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-12 flex flex-col items-center gap-2 text-surface-500"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="relative py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr,400px] gap-16">
            {/* Timeline Rail */}
            <div className="relative">
              {/* Rail background */}
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-surface-800" />
              
              {/* Rail progress fill */}
              <div
                className="absolute left-[19px] top-0 w-[2px] bg-gradient-to-b from-teal-500 to-violet-500 transition-all duration-300"
                style={{ height: `${scrollProgress * 100}%` }}
              />

              {/* Milestones */}
              <div className="space-y-20">
                {milestones.map((milestone, index) => {
                  const isActive = index === activeIndex;
                  const isPast = index < activeIndex;

                  return (
                    <div
                      key={milestone.id}
                      ref={(el) => { milestoneRefs.current[index] = el; }}
                      className="relative pl-16"
                    >
                      {/* Step indicator */}
                      <div
                        className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-br from-teal-500 to-violet-500 text-white shadow-lg shadow-teal-500/20'
                            : isPast
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'bg-surface-800 text-surface-500 border border-surface-700'
                        }`}
                      >
                        {isPast ? <Check className="h-4 w-4" /> : milestone.step}
                      </div>

                      {/* Content */}
                      <div className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-medium ${isActive ? 'text-white' : 'text-surface-300'}`}>
                            {milestone.title}
                          </h3>
                          {milestone.yieldBoost && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                              <Zap className="h-3 w-3" />
                              Yield Boost
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-surface-500 max-w-sm">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pinned Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface-900/50 backdrop-blur-sm border border-surface-800 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs uppercase tracking-widest text-surface-500">
                        Proof Preview
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        milestones[activeIndex].preview.claimed
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-surface-800 text-surface-400'
                      }`}>
                        {milestones[activeIndex].preview.status}
                      </span>
                    </div>

                    {/* Token display */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 border border-surface-700 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-white">
                          {milestones[activeIndex].preview.tokens}
                        </div>
                        <div className="text-sm text-surface-500">
                          {milestones[activeIndex].preview.state}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-surface-500">Progress</span>
                        <span className="text-surface-400">
                          {milestones[activeIndex].preview.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-500 to-violet-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${milestones[activeIndex].preview.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Unlocked amount */}
                    {milestones[activeIndex].preview.unlocked && (
                      <div className="pt-4 border-t border-surface-800">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-surface-500">Unlocked</span>
                          <span className="text-sm font-medium text-teal-400">
                            {milestones[activeIndex].preview.unlocked} PEPE
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Yield boost indicator */}
                    {milestones[activeIndex].yieldBoost && (
                      <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-2 text-amber-400 text-sm">
                          <Zap className="h-4 w-4" />
                          <span>Yield accruing: ~0.023 SOL</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Verification badge */}
                <div className="mt-4 flex items-center gap-2 text-surface-500 text-xs">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Verified on Solana blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 border-y border-surface-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '$12.5M', label: 'Total Locked' },
              { value: '1,234', label: 'Active Contracts' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-display font-semibold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-surface-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-display font-semibold text-white mb-4">
              Frequently Asked
            </h2>
            <p className="text-surface-500">
              Everything you need to know about token locks
            </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-surface-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-surface-900/50 transition-colors"
                >
                  <span className="text-sm font-medium text-surface-200">
                    {faq.q}
                  </span>
                  {openFaq === index ? (
                    <Minus className="h-4 w-4 text-surface-500 shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 text-surface-500 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 text-sm text-surface-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency section */}
      <section className="py-24 border-t border-surface-800/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-800/50 text-surface-400 text-xs mb-8">
            <Shield className="h-3.5 w-3.5" />
            <span>Built for transparency</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-4">
            Every lock is publicly verifiable
          </h2>
          
          <p className="text-surface-400 max-w-lg mx-auto mb-10">
            All contracts are on-chain with shareable proof pages. 
            No hidden terms, no trust required.
          </p>

          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-violet-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Create Your First Lock
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
