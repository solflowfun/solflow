'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Lock, Zap, ArrowRight, Shield, Check, Users, 
  TrendingUp, FileCheck, Clock, ChevronRight, ExternalLink
} from 'lucide-react';

// Narrative sections for the scrolling editorial
const narrativeSections = [
  {
    id: 'lock-vs-vest',
    title: 'Lock vs Vesting',
    content: 'A simple lock releases all tokens at once after a set date. Vesting distributes tokens gradually over time—protecting both teams and communities from sudden dumps.',
    quote: '"Gradual release builds confidence."',
    preview: { type: 'lock', progress: 0, status: 'Locked', unlocked: '0' },
  },
  {
    id: 'cliffs-intervals',
    title: 'Cliffs & Intervals',
    content: 'Set a cliff period where nothing unlocks, then define release intervals. Monthly? Weekly? Daily? You decide. Each unlock is verifiable on-chain.',
    preview: { type: 'cliff', progress: 15, status: 'Cliff Active', unlocked: '150,000' },
  },
  {
    id: 'permissions',
    title: 'Permissions',
    content: 'Choose whether contracts can be canceled (with locked tokens returning to sender). Enable recipient transfers for flexibility, or lock it down completely.',
    preview: { type: 'permissions', progress: 45, status: 'Vesting', unlocked: '450,000', cancelable: true, transferable: false },
  },
  {
    id: 'yield-boost',
    title: 'Yield Boost',
    content: 'Pay a small fee based on your token\'s buy price. We match it with SOL and stake for the lock duration. At unlock, you receive the accumulated yield.',
    quote: '"Your locked tokens work for you."',
    preview: { type: 'yield', progress: 70, status: 'Boosted', unlocked: '700,000', yieldEarned: '0.847 SOL' },
  },
];

// Sample transparency data
const transparencyData = [
  { epoch: '612', slot: '265,847,291', action: 'Lock Created', amount: '1,000,000 PEPE', hash: '7Kx9...4mPq', time: '2 hours ago' },
  { epoch: '612', slot: '265,851,002', action: 'Cliff Released', amount: '100,000 PEPE', hash: '3Nf2...8vRw', time: '1 hour ago' },
  { epoch: '612', slot: '265,854,118', action: 'Yield Claimed', amount: '0.023 SOL', hash: '9Lm7...2xKp', time: '45 min ago' },
];

// Stagger animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export default function HomePage() {
  const [activeNarrative, setActiveNarrative] = useState(0);
  const narrativeRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const flywheelRef = useRef<HTMLDivElement>(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const flywheelInView = useInView(flywheelRef, { once: true, margin: "-100px" });

  // Track scroll for narrative sections
  useEffect(() => {
    const handleScroll = () => {
      if (!narrativeRef.current) return;
      const sections = narrativeRef.current.querySelectorAll('[data-narrative]');
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.3) {
          setActiveNarrative(index);
        }
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Subtle flow lines background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <svg className="absolute w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <motion.path
            d="M-100,200 Q300,150 600,200 T1300,180"
            stroke="#D5522E"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M-100,400 Q400,350 700,420 T1300,380"
            stroke="#E08B46"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.path
            d="M-100,600 Q350,550 650,620 T1300,580"
            stroke="#C47809"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 0.4 }}
          />
        </svg>
      </div>

      {/* Hero Section - Editorial Left-Aligned */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center">
        {/* Breathing gradient bloom */}
        <motion.div 
          className="absolute top-1/3 right-0 w-[800px] h-[600px] pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse at center, rgba(213, 82, 46, 0.08) 0%, rgba(224, 139, 70, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="max-w-2xl"
          >
            <motion.h1 
              variants={staggerItem}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-charcoal-800 leading-[1.1] mb-6"
            >
              Lock. Vest.{' '}
              <span className="text-ember">Prove.</span>
            </motion.h1>
            
            <motion.p 
              variants={staggerItem}
              className="text-xl text-charcoal-500 mb-8 leading-relaxed max-w-xl"
            >
              Solana-native token locks and vesting for memecoins. 
              Public proof pages. Optional Yield Boost.
            </motion.p>
            
            <motion.div variants={staggerItem} className="flex items-center gap-4 mb-12">
              <Link href="/create" className="btn-ember">
                Create Lock
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="btn-ghost">
                View Proof
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Trust Strip */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-charcoal-400"
            >
              {['Multisig Treasury', 'Deterministic Schedules', 'Public Proof Pages', 'Price Attestations'].map((item, i) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-ember-orange" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Hairline divider */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-cream-400 to-transparent" />
      </div>

      {/* Flywheel Infographic Section */}
      <section ref={flywheelRef} className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={flywheelInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-[0.2em] text-charcoal-400 mb-4">The Flywheel</h2>
            <p className="text-2xl sm:text-3xl font-display font-medium text-charcoal-800 max-w-xl mx-auto">
              How transparent locks create lasting value
            </p>
          </motion.div>

          {/* Infographic Flywheel */}
          <div className="relative max-w-4xl mx-auto">
            <svg viewBox="0 0 800 400" className="w-full h-auto">
              {/* Central connecting lines */}
              <motion.path
                d="M100,200 L700,200"
                stroke="#E8D7C2"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={flywheelInView ? { pathLength: 1 } : {}}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Step nodes */}
              {[
                { x: 100, label: 'Lock / Vest', num: '01' },
                { x: 250, label: 'Proof Page', num: '02' },
                { x: 400, label: 'Community Trust', num: '03' },
                { x: 550, label: 'Healthier Launch', num: '04' },
                { x: 700, label: 'Long-term Holders', num: '05' },
              ].map((step, i) => (
                <motion.g 
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  animate={flywheelInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  <circle cx={step.x} cy={200} r="24" fill="#FDFBF7" stroke="#E8D7C2" strokeWidth="1" />
                  <text x={step.x} y={205} textAnchor="middle" className="text-xs font-medium fill-charcoal-800">{step.num}</text>
                  <text x={step.x} y={250} textAnchor="middle" className="text-[11px] fill-charcoal-500">{step.label}</text>
                </motion.g>
              ))}

              {/* Arrows between nodes */}
              {[175, 325, 475, 625].map((x, i) => (
                <motion.polygon
                  key={x}
                  points={`${x},197 ${x+10},200 ${x},203`}
                  fill="#D5522E"
                  initial={{ opacity: 0 }}
                  animate={flywheelInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.8 + i * 0.1 }}
                />
              ))}

              {/* Yield Boost callout bubble */}
              <motion.g
                initial={{ opacity: 0, scale: 0.9 }}
                animate={flywheelInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <rect x="280" y="280" width="240" height="80" rx="8" fill="#FDFBF7" stroke="#E08B46" strokeWidth="1" />
                <text x="300" y="305" className="text-[10px] uppercase tracking-wider fill-ember-orange font-medium">Yield Boost</text>
                <text x="300" y="325" className="text-[11px] fill-charcoal-600">Pay % of buy value → we match &</text>
                <text x="300" y="340" className="text-[11px] fill-charcoal-600">stake SOL → yield accrues to you</text>
              </motion.g>
              
              {/* Dotted line to callout */}
              <motion.path
                d="M100,224 Q190,300 280,320"
                stroke="#E08B46"
                strokeWidth="1"
                strokeDasharray="4 4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={flywheelInView ? { pathLength: 1 } : {}}
                transition={{ duration: 0.8, delay: 1 }}
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Ember gradient divider */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 0%, #D5522E 20%, #E08B46 50%, #C47809 80%, transparent 100%)' }} />
      </div>

      {/* Split Narrative + Pinned Preview */}
      <section className="py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr,400px] gap-16 lg:gap-24">
            {/* Left: Scrolling Editorial Narrative */}
            <div ref={narrativeRef} className="space-y-32">
              {narrativeSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  data-narrative={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  className={`transition-opacity duration-300 ${activeNarrative === index ? 'opacity-100' : 'opacity-40'}`}
                >
                  <h3 className="text-xs uppercase tracking-[0.2em] text-ember-orange mb-4">{section.title}</h3>
                  <p className="text-lg text-charcoal-700 leading-relaxed mb-6">{section.content}</p>
                  {section.quote && (
                    <blockquote className="border-l-2 border-ember-orange pl-4 text-charcoal-500 italic">
                      {section.quote}
                    </blockquote>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right: Pinned Proof Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <motion.div
                  key={activeNarrative}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal-400">Proof Preview</span>
                    <span className="tag-ember text-[10px]">
                      {narrativeSections[activeNarrative].preview.status}
                    </span>
                  </div>

                  {/* Schedule Timeline */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-charcoal-400 mb-2">
                      <span>Schedule</span>
                      <span>{narrativeSections[activeNarrative].preview.progress}%</span>
                    </div>
                    <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #D5522E, #E08B46, #C47809)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${narrativeSections[activeNarrative].preview.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    {/* Timeline ticks */}
                    <div className="flex justify-between mt-1">
                      {[0, 25, 50, 75, 100].map(tick => (
                        <div key={tick} className="w-px h-1.5 bg-cream-400" />
                      ))}
                    </div>
                  </div>

                  {/* Unlock Amount */}
                  <div className="flex items-center justify-between py-3 border-t border-cream-400">
                    <span className="text-sm text-charcoal-500">Available Now</span>
                    <span className="text-sm font-medium text-charcoal-800">
                      {narrativeSections[activeNarrative].preview.unlocked} PEPE
                    </span>
                  </div>

                  {/* Permission Badges */}
                  {narrativeSections[activeNarrative].preview.cancelable !== undefined && (
                    <div className="flex gap-2 py-3 border-t border-cream-400">
                      <span className={`tag text-[10px] ${narrativeSections[activeNarrative].preview.cancelable ? 'tag-ember' : 'tag-neutral'}`}>
                        {narrativeSections[activeNarrative].preview.cancelable ? '✓ Cancelable' : '✗ Non-cancelable'}
                      </span>
                      <span className={`tag text-[10px] ${narrativeSections[activeNarrative].preview.transferable ? 'tag-ember' : 'tag-neutral'}`}>
                        {narrativeSections[activeNarrative].preview.transferable ? '✓ Transferable' : '✗ Fixed recipient'}
                      </span>
                    </div>
                  )}

                  {/* Yield Boost Module */}
                  {narrativeSections[activeNarrative].preview.yieldEarned && (
                    <div className="mt-4 p-4 rounded-lg bg-amber-50/50 border border-amber-200/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-4 w-4 text-ember-orange" />
                        <span className="text-xs font-medium text-charcoal-700">Yield Boost Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-charcoal-400">Fee Paid</span>
                          <p className="font-medium text-charcoal-700">0.05 SOL</p>
                        </div>
                        <div>
                          <span className="text-charcoal-400">Matched Stake</span>
                          <p className="font-medium text-charcoal-700">0.05 SOL</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-charcoal-400">Yield Earned</span>
                          <p className="font-medium text-ember-orange">{narrativeSections[activeNarrative].preview.yieldEarned}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                <p className="mt-4 text-[10px] text-charcoal-400 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  All data verifiable on Solana
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-24 lg:py-32 bg-cream-300/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-sm uppercase tracking-[0.2em] text-charcoal-400 mb-4">On-Chain Transparency</h2>
            <p className="text-xl font-display text-charcoal-800">Every action, permanently recorded</p>
          </motion.div>

          {/* Transparency Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-400 text-left">
                  <th className="pb-3 font-medium text-charcoal-500 text-xs uppercase tracking-wider">Epoch / Slot</th>
                  <th className="pb-3 font-medium text-charcoal-500 text-xs uppercase tracking-wider">Action</th>
                  <th className="pb-3 font-medium text-charcoal-500 text-xs uppercase tracking-wider">Amount</th>
                  <th className="pb-3 font-medium text-charcoal-500 text-xs uppercase tracking-wider">Hash</th>
                  <th className="pb-3 font-medium text-charcoal-500 text-xs uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {transparencyData.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                    className="border-b border-cream-400/50"
                  >
                    <td className="py-4 text-charcoal-600 font-mono text-xs">
                      {row.epoch} / {row.slot}
                    </td>
                    <td className="py-4 text-charcoal-800">{row.action}</td>
                    <td className="py-4 text-charcoal-800 font-medium">{row.amount}</td>
                    <td className="py-4">
                      <a href="#" className="font-mono text-xs text-ember-red hover:underline flex items-center gap-1">
                        {row.hash}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-4 text-charcoal-400">{row.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <p className="mt-6 text-xs text-charcoal-400 flex items-center gap-2">
            <FileCheck className="h-3.5 w-3.5" />
            All transactions verifiable via Solana explorer. Merkle roots published for batch proofs.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-charcoal-800 mb-6">
              Ready to build <span className="text-ember">trust</span>?
            </h2>
            <p className="text-charcoal-500 mb-8 max-w-md mx-auto">
              Create your first lock in under 2 minutes. 
              Share the proof page with your community.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/create" className="btn-ember">
                Create Lock
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="btn-ghost">
                Explore Locks
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
