'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Flow lines SVG component
function FlowLines({ className }: { className?: string }) {
  return (
    <svg className={`absolute pointer-events-none ${className}`} viewBox="0 0 1200 800" preserveAspectRatio="none">
      <path
        d="M-100,200 Q300,100 600,200 T1300,180"
        className="flow-line"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{ animation: 'flowDraw 3s ease-out forwards' }}
      />
      <path
        d="M-100,400 Q400,300 700,400 T1300,380"
        className="flow-line"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{ animation: 'flowDraw 3s ease-out 0.3s forwards' }}
      />
      <path
        d="M-100,600 Q350,500 650,600 T1300,580"
        className="flow-line"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{ animation: 'flowDraw 3s ease-out 0.6s forwards' }}
      />
      <style>{`
        @keyframes flowDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

// Flywheel component
function Flywheel() {
  const steps = [
    { num: 1, title: 'Lock/Vest', desc: 'Deposit tokens with schedule' },
    { num: 2, title: 'Proof Page', desc: 'Public verification URL' },
    { num: 3, title: 'Confidence', desc: 'Community trust built' },
    { num: 4, title: 'Liquidity', desc: 'Holders stay engaged' },
    { num: 5, title: 'Launch', desc: 'Sustainable growth' },
  ];

  return (
    <div className="relative py-16">
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--teal)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--lavender)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="flex items-center justify-between max-w-4xl mx-auto relative">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center">
            <div className="flywheel-node text-center">
              <div className="flywheel-number mb-3">{step.num}</div>
              <div className="text-sm font-medium text-[#1A1A1A] mb-1">{step.title}</div>
              <div className="text-[11px] text-[#8A8A8A] max-w-[100px]">{step.desc}</div>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 lg:w-20 h-[1px] bg-gradient-to-r from-[#50908D]/30 via-[#817CCD]/30 to-[#C47809]/30 mx-2 lg:mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Yield Boost callout */}
      <div className="mt-12 max-w-md mx-auto">
        <div className="editorial-card p-4 relative">
          <div className="absolute -top-3 left-4 bg-[var(--parchment)] px-2 text-[10px] uppercase tracking-[0.15em] text-[#C47809] font-medium">
            Yield Boost
          </div>
          <p className="text-sm text-[#4A4A4A] leading-relaxed">
            Pay a % of buy value → matched SOL stake → yield accrues through lock.
          </p>
        </div>
      </div>
    </div>
  );
}

// Proof preview card (sticky sidebar)
function ProofPreview({ activeSection }: { activeSection: number }) {
  const scheduleData = [
    { date: 'Mar 15, 2026', amount: '250,000', status: 'Locked' },
    { date: 'Jun 15, 2026', amount: '250,000', status: 'Pending' },
    { date: 'Sep 15, 2026', amount: '250,000', status: 'Pending' },
    { date: 'Dec 15, 2026', amount: '250,000', status: 'Pending' },
  ];

  return (
    <div className="proof-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-1">Proof Page</div>
          <div className="font-editorial text-lg">$FLOW Team Lock</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8CCBBF] to-[#817CCD]" />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-[#8A8A8A]">Total Locked</span>
          <span className="font-mono font-medium">1,000,000 FLOW</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8A8A8A]">Lock Type</span>
          <span className="font-mono">{activeSection >= 1 ? 'Vesting' : 'Standard'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#8A8A8A]">Schedule</span>
          <span className="font-mono">{activeSection >= 2 ? 'Cliff + Linear' : 'Quarterly'}</span>
        </div>
        {activeSection >= 3 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#8A8A8A]">Yield Accrued</span>
            <span className="font-mono text-[#50908D]">+2.34 SOL</span>
          </div>
        )}
      </div>

      <div className="hairline mb-4" />

      <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-3">Unlock Schedule</div>
      <div className="space-y-2">
        {scheduleData.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="font-mono text-[#4A4A4A]">{item.date}</span>
            <span className="font-mono">{item.amount}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded ${
              item.status === 'Locked' ? 'bg-[#50908D]/10 text-[#50908D]' : 'bg-[#E5E0D8] text-[#8A8A8A]'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[#E5E0D8]">
        <div className="flex items-center gap-2 text-xs text-[#8A8A8A]">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Verified on-chain
        </div>
      </div>
    </div>
  );
}

// Narrative sections
const narrativeSections = [
  {
    title: 'Token Locks vs Vesting',
    content: `A **token lock** is a simple time-based vault: deposit tokens, set an unlock date, and the tokens remain inaccessible until that moment. Vesting adds complexity—tokens release incrementally over a defined schedule, often with an initial cliff period where nothing unlocks.`,
    quote: 'Locks prove commitment. Vesting schedules prove planning.',
  },
  {
    title: 'Cliff + Linear Schedules',
    content: `The cliff period ensures recipients demonstrate value before receiving any tokens. After the cliff expires, linear vesting releases tokens in equal portions—daily, weekly, or monthly. This prevents dump-and-run scenarios while maintaining team motivation.`,
    quote: null,
  },
  {
    title: 'Permissions & Control',
    content: `Lock creators can configure **cancel permissions** (allowing early termination with unvested tokens returning to a specified address) and **recipient transfer** (enabling locked positions to be reassigned). These controls balance flexibility with commitment.`,
    quote: null,
  },
  {
    title: 'Yield Boost Attestation',
    content: `Our signature feature: when enabling Yield Boost, you attest to your token purchase price. A corresponding fee in SOL is matched and staked through liquid staking tokens. The yield accrues to your lock, distributed proportionally upon unlock events.`,
    quote: 'Your conviction earns yield. Your patience compounds it.',
  },
];

// Transparency table data
const transparencyData = [
  { epoch: '482', slot: '208,443,291', action: 'Lock Created', amount: '1,000,000 FLOW', hash: '7xKp...3mNq', published: '2026-01-08 14:23:01' },
  { epoch: '482', slot: '208,443,445', action: 'Boost Enabled', amount: '2.5 SOL', hash: '9aRt...7kLm', published: '2026-01-08 14:24:18' },
  { epoch: '483', slot: '208,512,102', action: 'Yield Claimed', amount: '0.12 SOL', hash: '4bCx...2pQw', published: '2026-01-09 02:15:44' },
];

export default function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const narrativeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = narrativeRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) setActiveSection(index);
          }
        });
      },
      { threshold: 0.5, rootMargin: '-100px 0px' }
    );

    narrativeRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative overflow-hidden">
      <FlowLines className="w-full h-full top-0 left-0 opacity-50" />
      
      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-32 pb-24 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="font-editorial text-5xl lg:text-7xl text-[#1A1A1A] mb-6 animate-fade-in-up">
            Lock. Vest. Prove.
          </h1>
          <p className="text-xl lg:text-2xl text-[#4A4A4A] leading-relaxed mb-10 animate-fade-in-up stagger-1 max-w-2xl">
            Solana-only token locks + vesting made for memecoins, with public proof pages and optional{' '}
            <span className="accent-underline">Yield Boost</span>.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-16 animate-fade-in-up stagger-2">
            <Link href="/create" className="btn-primary">
              Create Lock
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/explore" className="btn-secondary">
              View Proof
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-6 animate-fade-in-up stagger-3">
            {[
              'Multisig treasury',
              'Deterministic schedules',
              'Public proof pages',
              'Price attestations',
              'LST staking',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="trust-badge">{item}</span>
                {i < 4 && <span className="text-[#D4CFC4]">•</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="hairline max-w-6xl mx-auto" />

      {/* Flowwheel Section */}
      <section className="px-6 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">The Mechanism</div>
          <h2 className="font-editorial text-3xl lg:text-4xl text-[#1A1A1A]">The Solflow Flywheel</h2>
        </div>
        <Flywheel />
      </section>

      {/* Divider */}
      <div className="hairline max-w-6xl mx-auto" />

      {/* Narrative + Proof Preview Section */}
      <section className="px-6 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr,380px] gap-16">
          {/* Left: Scrolling narrative */}
          <div className="space-y-16">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-8">How It Works</div>
            
            {narrativeSections.map((section, i) => (
              <div
                key={i}
                ref={(el) => { narrativeRefs.current[i] = el; }}
                className="scroll-mt-32"
              >
                <h3 className="font-editorial text-2xl text-[#1A1A1A] mb-4">{section.title}</h3>
                <p
                  className="text-[#4A4A4A] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#1A1A1A]">$1</strong>'),
                  }}
                />
                {section.quote && (
                  <blockquote className="pull-quote mt-6">{section.quote}</blockquote>
                )}
              </div>
            ))}
          </div>

          {/* Right: Sticky proof preview */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <ProofPreview activeSection={activeSection} />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="hairline max-w-6xl mx-auto" />

      {/* Transparency Section */}
      <section className="px-6 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-4">On-Chain Verification</div>
          <h2 className="font-editorial text-3xl lg:text-4xl text-[#1A1A1A]">Transparency Log</h2>
        </div>

        <div className="max-w-5xl mx-auto editorial-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-[#FAFAF8]">
                  <th className="px-6">Epoch/Slot</th>
                  <th className="px-6">Action</th>
                  <th className="px-6">Amount</th>
                  <th className="px-6">Merkle Hash</th>
                  <th className="px-6">Published</th>
                </tr>
              </thead>
              <tbody>
                {transparencyData.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 text-[#8A8A8A]">{row.epoch}/{row.slot}</td>
                    <td className="px-6">
                      <span className={`inline-flex items-center gap-1.5 ${
                        row.action === 'Lock Created' ? 'text-[#50908D]' :
                        row.action === 'Boost Enabled' ? 'text-[#817CCD]' :
                        'text-[#C47809]'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {row.action}
                      </span>
                    </td>
                    <td className="px-6">{row.amount}</td>
                    <td className="px-6 text-[#8A8A8A]">{row.hash}</td>
                    <td className="px-6 text-[#8A8A8A]">{row.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#E5E0D8] text-[11px] text-[#8A8A8A]">
            All transactions verifiable via Solana Explorer • Merkle proofs stored on-chain
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="hairline max-w-6xl mx-auto" />

      {/* Manifesto Close */}
      <section className="px-6 lg:px-16 py-24 max-w-7xl mx-auto text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-editorial text-2xl lg:text-3xl text-[#1A1A1A] leading-relaxed mb-4">
            Fair launches deserve fair infrastructure.
          </p>
          <p className="text-lg text-[#4A4A4A] mb-12">
            Lock your tokens. Build trust. Let your conviction earn yield.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/create" className="btn-primary">
              Create a Proof Lock
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://docs.solflow.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Read Docs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
