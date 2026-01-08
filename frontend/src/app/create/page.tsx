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
  unlockTime: string;
  // Vesting specific
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
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

// Quick duration presets
const durationPresets = [
  { label: '1 Week', days: 7 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
  { label: '2 Years', days: 730 },
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
    unlockTime: '12:00',
    startDate: '',
    startTime: '12:00',
    endDate: '',
    endTime: '12:00',
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

  const setPresetDuration = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split('T')[0];
    updateForm({ unlockDate: dateStr });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Helper to format datetime for display
  const formatDateTime = (date: string, time: string) => {
    if (!date) return 'Not set';
    const d = new Date(`${date}T${time || '12:00'}`);
    return d.toLocaleString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(213, 82, 46, 0.1) 0%, rgba(224, 139, 70, 0.08) 100%)' }}
          >
            <Lock className="h-8 w-8 text-ember-red" />
          </div>
          <h1 className="text-2xl font-display font-bold text-charcoal-800 mb-4">Connect Your Wallet</h1>
          <p className="text-charcoal-400 mb-8">Connect a Solana wallet to create a token lock</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-charcoal-800 mb-4">Create Token Lock</h1>
          <p className="text-charcoal-400">Lock or vest your tokens with on-chain proofs</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => s < step && setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  s === step
                    ? 'text-white shadow-ember-glow'
                    : s < step
                    ? 'bg-ember-orange/20 text-ember-orange'
                    : 'bg-cream-300 text-charcoal-400'
                }`}
                style={s === step ? { background: 'linear-gradient(135deg, #D5522E 0%, #E08B46 60%, #C47809 100%)' } : {}}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </button>
              {s < 6 && (
                <div className={`w-8 h-0.5 ${s < step ? 'bg-ember-orange/50' : 'bg-cream-400'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Template */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Choose a Template</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <button
                        key={template.id}
                        onClick={() => selectTemplate(template.id as LockTemplate)}
                        className={`p-6 rounded-xl border text-left transition-all ${
                          formData.template === template.id
                            ? 'border-ember-orange bg-ember-orange/5'
                            : 'border-cream-400 hover:border-ember-orange/50 bg-cream-50'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mb-4 ${formData.template === template.id ? 'text-ember-orange' : 'text-charcoal-400'}`} />
                        <h3 className="font-semibold text-charcoal-800 mb-1">{template.label}</h3>
                        <p className="text-sm text-charcoal-400">{template.description}</p>
                        <div className="mt-3">
                          <span className={`tag ${template.type === 'lock' ? 'tag-ember' : 'tag-neutral'}`}>
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
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Token & Amount</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Token Mint Address</label>
                    <input
                      type="text"
                      value={formData.tokenMint}
                      onChange={(e) => updateForm({ tokenMint: e.target.value })}
                      placeholder="Enter token mint address"
                      className="input-field w-full font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Amount to Lock</label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => updateForm({ amount: e.target.value })}
                      placeholder="Enter amount"
                      className="input-field w-full text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-2">Recipient Address</label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => updateForm({ recipient: e.target.value })}
                      placeholder="Enter recipient wallet address"
                      className="input-field w-full font-mono text-sm"
                    />
                    <p className="text-xs text-charcoal-400 mt-2">
                      Leave empty to use your connected wallet
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={!formData.tokenMint || !formData.amount}
                    className="btn-ember disabled:opacity-50"
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
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">
                  {formData.type === 'lock' ? 'Unlock Schedule' : 'Vesting Schedule'}
                </h2>
                
                {formData.type === 'lock' ? (
                  <div className="space-y-6">
                    {/* Quick Duration Presets */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-3">Quick Select</label>
                      <div className="flex flex-wrap gap-2">
                        {durationPresets.map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setPresetDuration(preset.days)}
                            className="px-4 py-2 rounded-full text-sm border border-cream-400 hover:border-ember-orange/50 hover:bg-ember-orange/5 text-charcoal-600 transition-all"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Picker */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Unlock Date
                      </label>
                      <input
                        type="date"
                        value={formData.unlockDate}
                        onChange={(e) => updateForm({ unlockDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="input-field w-full"
                      />
                    </div>

                    {/* Time Picker */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-2" />
                        Unlock Time
                      </label>
                      <input
                        type="time"
                        value={formData.unlockTime}
                        onChange={(e) => updateForm({ unlockTime: e.target.value })}
                        className="input-field w-full"
                      />
                    </div>

                    {/* Preview */}
                    {formData.unlockDate && (
                      <div className="p-4 rounded-xl bg-cream-100 border border-cream-300">
                        <div className="text-sm text-charcoal-500 mb-1">Tokens will unlock on:</div>
                        <div className="text-lg font-medium text-charcoal-800">
                          {formatDateTime(formData.unlockDate, formData.unlockTime)}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Irreversible Action</p>
                          <p className="text-sm text-charcoal-500 mt-1">
                            Token locks cannot be modified after creation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Start Date/Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => updateForm({ startDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-2" />
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => updateForm({ startTime: e.target.value })}
                          className="input-field w-full"
                        />
                      </div>
                    </div>

                    {/* End Date/Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-2" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => updateForm({ endDate: e.target.value })}
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                          className="input-field w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2">
                          <Clock className="h-4 w-4 inline mr-2" />
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => updateForm({ endTime: e.target.value })}
                          className="input-field w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Unlock Interval</label>
                      <select
                        value={formData.interval}
                        onChange={(e) => updateForm({ interval: e.target.value })}
                        className="input-field w-full"
                      >
                        {intervals.map((interval) => (
                          <option key={interval.value} value={interval.value}>
                            {interval.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Cliff Amount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.cliffPercent}
                        onChange={(e) => updateForm({ cliffPercent: e.target.value })}
                        className="input-field w-full"
                        placeholder="0"
                      />
                      <p className="text-xs text-charcoal-400 mt-2">
                        Percentage released at first unlock interval
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={nextStep} className="btn-ember">
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
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Permissions</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-3">Who can cancel?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['neither', 'sender', 'recipient', 'both'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => updateForm({ cancelableBy: option })}
                          className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${
                            formData.cancelableBy === option
                              ? 'border-ember-orange bg-ember-orange/10 text-ember-red'
                              : 'border-cream-400 hover:border-ember-orange/50 text-charcoal-600'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-3">Who can transfer recipient?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['neither', 'sender', 'recipient', 'both'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => updateForm({ transferableBy: option })}
                          className={`px-4 py-3 rounded-xl border text-sm capitalize transition-all ${
                            formData.transferableBy === option
                              ? 'border-ember-orange bg-ember-orange/10 text-ember-red'
                              : 'border-cream-400 hover:border-ember-orange/50 text-charcoal-600'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={nextStep} className="btn-ember">
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
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Yield Boost</h2>
                <div className="p-6 rounded-xl border border-amber-200 bg-amber-50 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-100">
                      <Zap className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-700 mb-2">Earn While Locked</h3>
                      <p className="text-sm text-charcoal-500">
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
                      ? 'border-ember-orange bg-ember-orange/10'
                      : 'border-cream-400 hover:border-ember-orange/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-charcoal-700">Enable Yield Boost</span>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      formData.enableYieldBoost ? 'bg-ember-orange' : 'bg-cream-400'
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
                      <label className="block text-sm font-medium text-charcoal-700 mb-2">Buy Transaction Signatures</label>
                      <textarea
                        placeholder="Enter transaction signatures (one per line)"
                        className="input-field w-full h-24 font-mono text-xs resize-none"
                        onChange={(e) => updateForm({ 
                          buyTxSignatures: e.target.value.split('\n').filter(Boolean) 
                        })}
                      />
                      <p className="text-xs text-charcoal-400 mt-2">
                        We'll verify your token purchases to calculate the fee
                      </p>
                    </div>
                    <div className="card p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-charcoal-400">Estimated Fee</span>
                        <span className="font-medium text-charcoal-700">Calculating...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={nextStep} className="btn-ember">
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
                <h2 className="text-xl font-semibold text-charcoal-800 mb-6">Review & Create</h2>
                
                <div className="space-y-4">
                  <div className="card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-400">Type</span>
                      <span className="tag tag-ember capitalize">{formData.type}</span>
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-400">Token</span>
                      <span className="font-mono text-sm text-charcoal-700">{formData.tokenMint.slice(0, 8)}...{formData.tokenMint.slice(-8)}</span>
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-400">Amount</span>
                      <span className="font-semibold text-charcoal-800">{formData.amount}</span>
                    </div>
                  </div>
                  {formData.type === 'lock' ? (
                    <div className="card p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-charcoal-400">Unlock Date</span>
                        <span className="text-charcoal-700">{formatDateTime(formData.unlockDate, formData.unlockTime)}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-charcoal-400">Start</span>
                          <span className="text-charcoal-700">{formatDateTime(formData.startDate, formData.startTime)}</span>
                        </div>
                      </div>
                      <div className="card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-charcoal-400">End</span>
                          <span className="text-charcoal-700">{formatDateTime(formData.endDate, formData.endTime)}</span>
                        </div>
                      </div>
                      <div className="card p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-charcoal-400">Cliff</span>
                          <span className="text-charcoal-700">{formData.cliffPercent}%</span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal-400">Yield Boost</span>
                      <span className={formData.enableYieldBoost ? 'text-emerald-600 font-medium' : 'text-charcoal-400'}>
                        {formData.enableYieldBoost ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-600">Final Warning</p>
                      <p className="text-sm text-charcoal-500 mt-1">
                        This action is irreversible. Please verify all details before creating the lock.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button onClick={prevStep} className="flex items-center gap-2 px-4 py-2 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button className="btn-ember shadow-ember-glow">
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
