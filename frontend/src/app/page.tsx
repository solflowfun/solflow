'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, ArrowRight, Check, 
  Plus, Minus
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
      progress: 0,
      state: 'Tokens secured in escrow',
    },
  },
  {
    id: 'cliff',
    step: 3,
    title: 'Cliff Released',
    description: 'Initial cliff amount becomes claimable',
    preview: {
      status: 'Cliff',
      progress: 10,
      state: '10% cliff unlocked',
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
      progress: 100,
      state: 'Tokens transferred to wallet',
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
      
      const start = rect.top - windowHeight * 0.5;
      const end = rect.bottom - windowHeight * 0.5;
      const current = -start;
      const total = end - start;
      
      const progress = Math.max(0, Math.min(1, current / total));
      setScrollProgress(progress);
      
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
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Large gradient bloom - 8-12% opacity */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px] rounded-full pointer-events-none animate-glow-pulse"
          style={{ 
            background: 'radial-gradient(ellipse at center, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.06) 40%, rgba(196, 120, 9, 0.03) 70%, transparent 100%)',
            filter: 'blur(60px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl relative z-10"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-charcoal-800 mb-6">
            Token locks that
            <br />
            <span className="text-ember">build trust</span>
          </h1>
          
          <p className="text-lg text-charcoal-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Secure vesting schedules with on-chain proofs. 
            Earn yield while locked.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/create" className="btn-ember">
              Create Lock
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/explore" className="btn-ghost">
              Explore
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator - static */}
        <div className="absolute bottom-12 flex flex-col items-center gap-2 text-charcoal-400">
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="relative py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr,400px] gap-16">
            {/* Timeline Rail */}
            <div className="relative">
              {/* Rail background */}
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-cream-400" />
              
              {/* Rail progress fill - ember gradient */}
              <div
                className="absolute left-[19px] top-0 w-[2px] transition-all duration-300"
                style={{ 
                  height: `${scrollProgress * 100}%`,
                  background: 'linear-gradient(180deg, #D5522E 0%, #E08B46 50%, #C47809 100%)'
                }}
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
                            ? 'text-white shadow-ember-glow'
                            : isPast
                            ? 'bg-ember-orange/10 text-ember-orange border border-ember-orange/20'
                            : 'bg-cream-300 text-charcoal-400 border border-cream-400'
                        }`}
                        style={isActive ? { background: 'linear-gradient(135deg, #D5522E 0%, #E08B46 60%, #C47809 100%)' } : {}}
                      >
                        {isPast ? <Check className="h-4 w-4" /> : milestone.step}
                      </div>

                      {/* Content */}
                      <div className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                        <h3 className={`text-lg font-medium mb-2 ${isActive ? 'text-charcoal-800' : 'text-charcoal-600'}`}>
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-charcoal-400 max-w-sm">
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
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs uppercase tracking-widest text-charcoal-400">
                        Preview
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        milestones[activeIndex].preview.claimed
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-cream-300 text-charcoal-500'
                      }`}>
                        {milestones[activeIndex].preview.status}
                      </span>
                    </div>

                    {/* Token display */}
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 100%)' }}
                      >
                        <Lock className="h-5 w-5 text-ember-red" />
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-charcoal-800">
                          1,000,000 TOKEN
                        </div>
                        <div className="text-sm text-charcoal-400">
                          {milestones[activeIndex].preview.state}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-charcoal-400">Progress</span>
                        <span className="text-charcoal-600 font-medium">
                          {milestones[activeIndex].preview.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #D5522E 0%, #E08B46 50%, #C47809 100%)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${milestones[activeIndex].preview.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Unlocked amount */}
                    {milestones[activeIndex].preview.unlocked && (
                      <div className="pt-4 border-t border-cream-400">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-charcoal-400">Unlocked</span>
                          <span className="text-sm font-medium text-ember-orange">
                            {milestones[activeIndex].preview.unlocked} TOKEN
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-display font-semibold text-charcoal-800 mb-4">
              Frequently Asked
            </h2>
            <p className="text-charcoal-400">
              Everything you need to know about token locks
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-cream-100 transition-colors"
                >
                  <span className="text-sm font-medium text-charcoal-700">
                    {faq.q}
                  </span>
                  {openFaq === index ? (
                    <Minus className="h-4 w-4 text-charcoal-400 shrink-0" />
                  ) : (
                    <Plus className="h-4 w-4 text-charcoal-400 shrink-0" />
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
                      <div className="px-6 pb-4 text-sm text-charcoal-500 leading-relaxed">
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

      {/* CTA section */}
      <section className="py-24 bg-cream-300/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-charcoal-800 mb-4">
            Ready to get started?
          </h2>
          
          <p className="text-charcoal-400 max-w-lg mx-auto mb-10">
            Create your first token lock in minutes.
          </p>

          <Link href="/create" className="btn-ember">
            Create Your First Lock
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
