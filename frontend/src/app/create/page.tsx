'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Clock, ChevronRight, ChevronLeft, 
  Coins, Users, Calendar, Settings, Zap, Check, AlertTriangle
} from 'lucide-react';

type LockType = 'lock' | 'vesting';
type LockTemplate = 'team' | 'marketing' | 'advisor' | 'lp' | 'custom';

interface FormData {
  type: LockType;
  template: LockTemplate;
  tokenMint: string;
  amount: string;
  recipient: string;
  // Lock specific
  unlockDate: string;
  // Vesting specific
  startDate: string;
  endDate: string;
  interval: string;
  cliffPercent: string;
  // Permissions
  cancelableBy: 'neither' | 'sender' | 'recipient' | 'both';
  transferableBy: 'neither' | 'sender' | 'recipient' | 'both';
  // Yield boost
  enableYieldBoost: boolean;
  buyTxSignatures: string[];
  // Metadata
  title: string;
  memo: string;
}

const templates = [
  { id: 'team', label: 'Team Lock', description: 'Single unlock for team tokens', icon: Users, type: 'lock' as const },
  { id: 'marketing', label: 'Marketing Vesting', description: 'Monthly unlock for marketing', icon: Coins, type: 'vesting' as const },
  { id: 'advisor', label: 'Advisor Vesting', description: 'Quarterly unlock with cliff', icon: Users, type: 'vesting' as const },
  { id: 'lp', label: 'LP Lock', description: 'Liquidity pool token lock', icon: Lock, type: 'lock' as const },
  { id: 'custom', label: 'Custom', description: 'Fully customizable', icon: Settings, type: 'lock' as const },
];

const intervals = [
  { value: '60', label: 'Every Minute (Testing)' },
  { value: '86400', label: 'Daily' },
  { value: '604800', label: 'Weekly' },
  { value: '2592000', label: 'Monthly (30 days)' },
  { value: '7776000', label: 'Quarterly (90 days)' },
  { value: '31536000', label: 'Yearly' },
];

export default function CreatePage() {
  const { connected, publicKey } = useWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    type: 'lock',
    template: 'team',
    tokenMint: '',
    amount: '',
    recipient: '',
    unlockDate: '',
    startDate: '',
    endDate: '',
    interval: '2592000',
    cliffPercent: '0',
    cancelableBy: 'sender',
    transferableBy: 'neither',
    enableYieldBoost: false,
    buyTxSignatures: [],
    title: '',
    memo: '',
  });

  const updateForm = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const selectTemplate = (template: LockTemplate) => {
    const templateConfig = templates.find(t => t.id === template);
    updateForm({ 
      template, 
      type: templateConfig?.type || 'lock' 
    });
    setStep(2);
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Lock className="h-16 w-16 text-brand-500 mx-auto mb-6" />
          <h1 className="text-2xl font-display font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-surface-400 mb-8">Connect a Solana wallet to create a token lock</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold mb-4">Create Token Lock</h1>
          <p className="text-surface-400">Lock or vest your tokens with on-chain proofs</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s === step
                    ? 'bg-brand-500 text-white'
                    : s < step
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'bg-surface-800 text-surface-500'
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </button>
              {s < 6 && (
                <div className={`w-8 h-0.5 ${s < step ? 'bg-brand-500/50' : 'bg-surface-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Template */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6">Choose a Template</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => selectTemplate(template.id as LockTemplate)}
                        className={`p-6 rounded-xl border text-left transition-all ${
                          formData.template === template.id
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mb-4 ${formData.template === template.id ? 'text-brand-400' : 'text-surface-400'}`} />
                        <h3 className="font-semibold mb-1">{template.label}</h3>
                        <p className="text-sm text-surface-400">{template.description}</p>
                        <div className="mt-3">
                          <span className={`tag ${template.type === 'lock' ? 'tag-brand' : 'tag-accent'}`}>
                            {template.type === 'lock' ? 'Single Unlock' : 'Vesting'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Token & Amount */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6">Token & Amount</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Token Mint Address</label>
                    <input
                      type="text"
                      value={formData.tokenMint}
                      onChange={(e) => updateForm({ tokenMint: e.target.value })}
                      placeholder="Enter token mint address"
                      className="input-glow w-full font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount to Lock</label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => updateForm({ amount: e.target.value })}
                      placeholder="0.00"
                      className="input-glow w-full text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => updateForm({ recipient: e.target.value })}
                      placeholder={publicKey?.toBase58() || 'Recipient wallet address'}
                      className="input-glow w-full font-mono text-sm"
                    />
                    <p className="text-xs text-surface-500 mt-2">
                      Leave empty to use your connected wallet
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-white">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.tokenMint || !formData.amount}
                    className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium disabled:opacity-50"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Schedule */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6">
                  {formData.type === 'lock' ? 'Unlock Date' : 'Vesting Schedule'}
                </h2>
                
                {formData.type === 'lock' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">Unlock Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.unlockDate}
                      onChange={(e) => updateForm({ unlockDate: e.target.value })}
                      className="input-glow w-full"
                    />
                    <div className="mt-4 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-warning-400">Irreversible Action</p>
                          <p className="text-sm text-surface-400 mt-1">
                            Token locks cannot be modified after creation. Tokens will be locked until the unlock date.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <input
                          type="datetime-local"
                          value={formData.startDate}
                          onChange={(e) => updateForm({ startDate: e.target.value })}
                          className="input-glow w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <input
                          type="datetime-local"
                          value={formData.endDate}
                          onChange={(e) => updateForm({ endDate: e.target.value })}
                          className="input-glow w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Unlock Interval</label>
                      <select
                        value={formData.interval}
                        onChange={(e) => updateForm({ interval: e.target.value })}
                        className="input-glow w-full"
                      >
                        {intervals.map((interval) => (
                          <option key={interval.value} value={interval.value}>
                            {interval.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cliff Amount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.cliffPercent}
                        onChange={(e) => updateForm({ cliffPercent: e.target.value })}
                        className="input-glow w-full"
                        placeholder="0"
                      />
                      <p className="text-xs text-surface-500 mt-2">
                        Percentage released at first unlock interval
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-white">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={nextStep} className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Permissions */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6">Permissions</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Who can cancel?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['neither', 'sender', 'recipient', 'both'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => updateForm({ cancelableBy: option })}
                          className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${
                            formData.cancelableBy === option
                              ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                              : 'border-surface-700 hover:border-surface-600'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-3">Who can transfer recipient?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['neither', 'sender', 'recipient', 'both'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => updateForm({ transferableBy: option })}
                          className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${
                            formData.transferableBy === option
                              ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                              : 'border-surface-700 hover:border-surface-600'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-white">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={nextStep} className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Yield Boost */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6">Yield Boost</h2>
                <div className="p-6 rounded-xl border border-warning-500/30 bg-warning-500/5 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-warning-500/20">
                      <Zap className="h-6 w-6 text-warning-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-warning-400 mb-2">Earn While Locked</h3>
                      <p className="text-sm text-surface-400">
                        Enable Yield Boost to earn staking rewards on your locked tokens. 
                        Pay a small fee based on your buy price, and we'll match it with staked SOL.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => updateForm({ enableYieldBoost: !formData.enableYieldBoost })}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    formData.enableYieldBoost
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-700 hover:border-surface-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Enable Yield Boost</span>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      formData.enableYieldBoost ? 'bg-brand-500' : 'bg-surface-700'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                        formData.enableYieldBoost ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`} />
                    </div>
                  </div>
                </button>

                {formData.enableYieldBoost && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Buy Transaction Signatures</label>
                      <textarea
                        placeholder="Enter transaction signatures (one per line)"
                        className="input-glow w-full h-24 font-mono text-xs"
                        onChange={(e) => updateForm({ 
                          buyTxSignatures: e.target.value.split('\n').filter(Boolean) 
                        })}
                      />
                      <p className="text-xs text-surface-500 mt-2">
                        We'll verify your token purchases to calculate the fee
                      </p>
                    </div>
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-400">Estimated Fee</span>
                        <span className="font-medium">Calculating...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-white">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={nextStep} className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium">
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Review & Create */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold mb-6">Review & Create</h2>
                
                <div className="space-y-4">
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Type</span>
                      <span className="tag tag-brand capitalize">{formData.type}</span>
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Token</span>
                      <span className="font-mono text-sm">{formData.tokenMint.slice(0, 8)}...{formData.tokenMint.slice(-8)}</span>
                    </div>
                  </div>
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Amount</span>
                      <span className="font-semibold">{formData.amount}</span>
                    </div>
                  </div>
                  {formData.type === 'lock' ? (
                    <div className="glass-card p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-surface-400">Unlock Date</span>
                        <span>{new Date(formData.unlockDate).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="glass-card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Vesting Period</span>
                          <span>{new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="glass-card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-surface-400">Cliff</span>
                          <span>{formData.cliffPercent}%</span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Yield Boost</span>
                      <span className={formData.enableYieldBoost ? 'text-success-400' : 'text-surface-500'}>
                        {formData.enableYieldBoost ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-error-500/10 border border-error-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-error-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-error-400">Final Warning</p>
                      <p className="text-sm text-surface-400 mt-1">
                        This action is irreversible. Please verify all details before creating the lock.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-surface-400 hover:text-white">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold shadow-glow">
                    <Lock className="h-4 w-4" />
                    Create Lock
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

