'use client';

import { FC, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Lock, Clock, User, ExternalLink, Copy, Check, 
  Calendar, Coins, Zap, Share2, Shield, AlertCircle 
} from 'lucide-react';

// Mock data - in production, fetch from API
const mockContract = {
  address: '4xYz...aBcD',
  kind: 'lock',
  state: 'active',
  sender: '8kJn...xYzW',
  recipient: '3mQp...vBnM',
  mint: 'So11...1111',
  tokenSymbol: 'PEPE',
  tokenName: 'Pepe Token',
  tokenDecimals: 9,
  totalAmount: BigInt('1000000000000'),
  withdrawnAmount: BigInt('0'),
  startTs: new Date('2024-01-01'),
  endTs: new Date('2025-01-01'),
  createdAt: new Date('2024-01-01'),
  cancelableBy: 'sender',
  transferableBy: 'neither',
  yieldBoostEnabled: true,
  yieldBoost: {
    feePaid: BigInt('500000000'),
    principalMatched: BigInt('500000000'),
    estimatedYield: BigInt('37500000'),
    apy: 7.5,
  },
};

export default function LockProofPage() {
  const params = useParams();
  const address = params.address as string;
  const [copied, setCopied] = useState(false);

  const contract = mockContract;
  
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const now = new Date();
  const startTs = new Date(contract.startTs);
  const endTs = new Date(contract.endTs);
  const isActive = now >= startTs && now < endTs;
  const isCompleted = now >= endTs;
  
  const progress = Math.min(
    100,
    Math.max(0, ((now.getTime() - startTs.getTime()) / (endTs.getTime() - startTs.getTime())) * 100)
  );

  const formatAmount = (amount: bigint, decimals: number) => {
    return (Number(amount) / Math.pow(10, decimals)).toLocaleString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-brand-500/20">
                <Lock className="h-6 w-6 text-brand-400" />
              </div>
              <h1 className="text-2xl font-display font-bold">Lock Certificate</h1>
            </div>
            <div className="flex items-center gap-2 text-surface-400">
              <span className="font-mono text-sm">{address}</span>
              <button onClick={copyAddress} className="p-1 hover:text-white transition-colors">
                {copied ? <Check className="h-4 w-4 text-success-400" /> : <Copy className="h-4 w-4" />}
              </button>
              <a 
                href={`https://solscan.io/account/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`tag ${
              isCompleted ? 'tag-success' : isActive ? 'tag-brand' : 'tag-warning'
            }`}>
              {isCompleted ? 'Completed' : isActive ? 'Active' : 'Scheduled'}
            </span>
            <button className="p-2 rounded-xl bg-surface-800 hover:bg-surface-700 transition-colors">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden"
        >
          {/* Token Header */}
          <div className="p-8 border-b border-surface-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-2xl font-bold">
                {contract.tokenSymbol?.charAt(0) || '?'}
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold">
                  {formatAmount(contract.totalAmount, contract.tokenDecimals)} {contract.tokenSymbol}
                </h2>
                <p className="text-surface-400">{contract.tokenName}</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="p-8 border-b border-surface-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-surface-400">Progress</span>
              <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="progress-glow">
              <div 
                className="progress-glow-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="flex items-center gap-2 text-surface-400">
                <Calendar className="h-4 w-4" />
                <span>Start: {formatDate(startTs)}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-400">
                <Clock className="h-4 w-4" />
                <span>End: {formatDate(endTs)}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-surface-400 mb-4">Contract Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 flex items-center gap-2">
                    <User className="h-4 w-4" /> Sender
                  </span>
                  <a 
                    href={`https://solscan.io/account/${contract.sender}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:text-brand-400 transition-colors"
                  >
                    {contract.sender}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 flex items-center gap-2">
                    <User className="h-4 w-4" /> Recipient
                  </span>
                  <a 
                    href={`https://solscan.io/account/${contract.recipient}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:text-brand-400 transition-colors"
                  >
                    {contract.recipient}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400 flex items-center gap-2">
                    <Coins className="h-4 w-4" /> Token Mint
                  </span>
                  <a 
                    href={`https://solscan.io/token/${contract.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:text-brand-400 transition-colors"
                  >
                    {contract.mint}
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-surface-400 mb-4">Permissions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-surface-400">Cancelable By</span>
                  <span className="capitalize">{contract.cancelableBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400">Transferable By</span>
                  <span className="capitalize">{contract.transferableBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-surface-400">Type</span>
                  <span className="tag tag-brand capitalize">{contract.kind}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yield Boost Section */}
          {contract.yieldBoostEnabled && contract.yieldBoost && (
            <div className="p-8 border-t border-surface-800 bg-gradient-to-r from-warning-500/5 to-accent-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-warning-500/20">
                  <Zap className="h-5 w-5 text-warning-400" />
                </div>
                <h3 className="text-lg font-semibold">Yield Boost Active</h3>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="glass-card p-4">
                  <div className="text-sm text-surface-400 mb-1">Fee Paid</div>
                  <div className="text-xl font-semibold">
                    {formatAmount(contract.yieldBoost.feePaid, 9)} SOL
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-sm text-surface-400 mb-1">Total Staked</div>
                  <div className="text-xl font-semibold text-accent-400">
                    {formatAmount(contract.yieldBoost.feePaid + contract.yieldBoost.principalMatched, 9)} SOL
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-sm text-surface-400 mb-1">Est. Yield</div>
                  <div className="text-xl font-semibold text-success-400">
                    ~{formatAmount(contract.yieldBoost.estimatedYield, 9)} SOL
                  </div>
                  <div className="text-xs text-surface-500 mt-1">
                    ~{contract.yieldBoost.apy}% APY
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Badge */}
          <div className="p-6 border-t border-surface-800 bg-surface-900/50">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-success-400" />
              <div>
                <p className="text-sm font-medium">Verified On-Chain</p>
                <p className="text-xs text-surface-400">
                  This lock is secured by the Solana blockchain and can be independently verified.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Embed Code */}
        <div className="mt-8 glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Embed Widget</h3>
          <p className="text-sm text-surface-400 mb-4">
            Share this lock on your website to build trust with your community.
          </p>
          <div className="p-4 bg-surface-900 rounded-xl overflow-x-auto">
            <code className="text-sm text-brand-400 font-mono whitespace-nowrap">
              {`<iframe src="https://solflow.io/embed/${address}" width="400" height="200" frameborder="0"></iframe>`}
            </code>
          </div>
          <button className="mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors">
            Copy embed code
          </button>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/portfolio"
            className="px-6 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 transition-colors font-medium"
          >
            Back to Portfolio
          </Link>
          {isCompleted && (
            <button className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 transition-colors font-medium">
              Claim Tokens
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

