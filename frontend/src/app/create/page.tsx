'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

type LockType = 'lock' | 'vesting';
type VestingSchedule = 'linear' | 'cliff' | 'custom';

interface FormData {
  lockType: LockType;
  tokenMint: string;
  amount: string;
  recipient: string;
  unlockDate: string;
  vestingSchedule: VestingSchedule;
  cliffDuration: string;
  vestingDuration: string;
  enableYieldBoost: boolean;
  buyPrice: string;
  cancelAuthority: 'creator' | 'recipient' | 'both' | 'none';
  transferable: boolean;
}

export default function CreatePage() {
  const { connected } = useWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    lockType: 'lock',
    tokenMint: '',
    amount: '',
    recipient: '',
    unlockDate: '',
    vestingSchedule: 'linear',
    cliffDuration: '90',
    vestingDuration: '365',
    enableYieldBoost: false,
    buyPrice: '',
    cancelAuthority: 'none',
    transferable: false,
  });

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps = [
    { num: 1, title: 'Type', desc: 'Lock or Vesting' },
    { num: 2, title: 'Token', desc: 'Select asset' },
    { num: 3, title: 'Schedule', desc: 'Set timeline' },
    { num: 4, title: 'Options', desc: 'Configure' },
    { num: 5, title: 'Review', desc: 'Confirm' },
  ];

  if (!connected) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-editorial text-3xl text-[#1A1A1A] mb-4">Connect Wallet</h1>
          <p className="text-[#4A4A4A] mb-8">
            Connect your Solana wallet to create a token lock or vesting schedule.
          </p>
          <WalletMultiButton />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-3">Create</div>
        <h1 className="font-editorial text-4xl text-[#1A1A1A] mb-4">New Lock</h1>
        <p className="text-[#4A4A4A]">Configure your token lock or vesting schedule.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between max-w-2xl">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s.num 
                    ? 'border-[#50908D] text-[#50908D] bg-[#50908D]/5' 
                    : 'border-[#E5E0D8] text-[#8A8A8A]'
                }`}>
                  {s.num}
                </div>
                <div className="text-[11px] mt-2 text-[#8A8A8A]">{s.title}</div>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 lg:w-24 h-[1px] mx-2 ${
                  step > s.num ? 'bg-[#50908D]/30' : 'bg-[#E5E0D8]'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="editorial-card p-8">
        {/* Step 1: Lock Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">Select Lock Type</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => updateFormData('lockType', 'lock')}
                className={`p-6 text-left border transition-all ${
                  formData.lockType === 'lock'
                    ? 'border-[#50908D] bg-[#50908D]/5'
                    : 'border-[#E5E0D8] hover:border-[#D4CFC4]'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.lockType === 'lock' ? 'border-[#50908D] bg-[#50908D]' : 'border-[#D4CFC4]'
                  }`}>
                    {formData.lockType === 'lock' && (
                      <div className="w-full h-full rounded-full border-2 border-white" />
                    )}
                  </div>
                  <span className="font-medium text-[#1A1A1A]">Token Lock</span>
                </div>
                <p className="text-sm text-[#8A8A8A]">
                  Simple time-locked vault. All tokens unlock on a single date.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateFormData('lockType', 'vesting')}
                className={`p-6 text-left border transition-all ${
                  formData.lockType === 'vesting'
                    ? 'border-[#50908D] bg-[#50908D]/5'
                    : 'border-[#E5E0D8] hover:border-[#D4CFC4]'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    formData.lockType === 'vesting' ? 'border-[#50908D] bg-[#50908D]' : 'border-[#D4CFC4]'
                  }`}>
                    {formData.lockType === 'vesting' && (
                      <div className="w-full h-full rounded-full border-2 border-white" />
                    )}
                  </div>
                  <span className="font-medium text-[#1A1A1A]">Vesting Schedule</span>
                </div>
                <p className="text-sm text-[#8A8A8A]">
                  Gradual release over time with optional cliff period.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Token Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">Select Token</h2>
            
            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">Token Mint Address</label>
              <input
                type="text"
                value={formData.tokenMint}
                onChange={(e) => updateFormData('tokenMint', e.target.value)}
                placeholder="Enter SPL token mint address"
                className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => updateFormData('amount', e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">Recipient Wallet</label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => updateFormData('recipient', e.target.value)}
                placeholder="Wallet address that will receive unlocked tokens"
                className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">
              {formData.lockType === 'lock' ? 'Unlock Date' : 'Vesting Schedule'}
            </h2>
            
            {formData.lockType === 'lock' ? (
              <div>
                <label className="block text-sm text-[#4A4A4A] mb-2">Unlock Date</label>
                <input
                  type="datetime-local"
                  value={formData.unlockDate}
                  onChange={(e) => updateFormData('unlockDate', e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-[#4A4A4A] mb-3">Schedule Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['linear', 'cliff', 'custom'] as VestingSchedule[]).map((schedule) => (
                      <button
                        key={schedule}
                        type="button"
                        onClick={() => updateFormData('vestingSchedule', schedule)}
                        className={`px-4 py-3 text-sm border transition-all capitalize ${
                          formData.vestingSchedule === schedule
                            ? 'border-[#50908D] bg-[#50908D]/5 text-[#50908D]'
                            : 'border-[#E5E0D8] text-[#4A4A4A] hover:border-[#D4CFC4]'
                        }`}
                      >
                        {schedule === 'cliff' ? 'Cliff + Linear' : schedule}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.vestingSchedule !== 'linear' && (
                  <div>
                    <label className="block text-sm text-[#4A4A4A] mb-2">Cliff Duration (days)</label>
                    <input
                      type="number"
                      value={formData.cliffDuration}
                      onChange={(e) => updateFormData('cliffDuration', e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-[#4A4A4A] mb-2">Total Vesting Duration (days)</label>
                  <input
                    type="number"
                    value={formData.vestingDuration}
                    onChange={(e) => updateFormData('vestingDuration', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Options */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">Configure Options</h2>
            
            {/* Yield Boost */}
            <div className="p-6 border border-[#E5E0D8] bg-[#FAFAF8]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium text-[#1A1A1A] mb-1">Enable Yield Boost</div>
                  <p className="text-sm text-[#8A8A8A]">Earn yield on matched SOL stake through your lock period</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormData('enableYieldBoost', !formData.enableYieldBoost)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.enableYieldBoost ? 'bg-[#50908D]' : 'bg-[#D4CFC4]'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    formData.enableYieldBoost ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {formData.enableYieldBoost && (
                <div className="pt-4 border-t border-[#E5E0D8]">
                  <label className="block text-sm text-[#4A4A4A] mb-2">Your Buy Price (SOL per token)</label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => updateFormData('buyPrice', e.target.value)}
                    placeholder="0.000001"
                    step="0.000001"
                    className="w-full px-4 py-3 border border-[#E5E0D8] bg-white text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#50908D] font-mono text-sm"
                  />
                  <p className="text-xs text-[#8A8A8A] mt-2">
                    A fee based on this price will be collected and matched with SOL staking.
                  </p>
                </div>
              )}
            </div>

            {/* Cancel Authority */}
            <div>
              <label className="block text-sm text-[#4A4A4A] mb-3">Cancel Authority</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(['none', 'creator', 'recipient', 'both'] as const).map((auth) => (
                  <button
                    key={auth}
                    type="button"
                    onClick={() => updateFormData('cancelAuthority', auth)}
                    className={`px-4 py-3 text-sm border transition-all capitalize ${
                      formData.cancelAuthority === auth
                        ? 'border-[#50908D] bg-[#50908D]/5 text-[#50908D]'
                        : 'border-[#E5E0D8] text-[#4A4A4A] hover:border-[#D4CFC4]'
                    }`}
                  >
                    {auth}
                  </button>
                ))}
              </div>
            </div>

            {/* Transferable */}
            <div className="flex items-center justify-between p-4 border border-[#E5E0D8]">
              <div>
                <div className="font-medium text-[#1A1A1A] mb-1">Transferable Recipient</div>
                <p className="text-sm text-[#8A8A8A]">Allow the locked position to be transferred to another wallet</p>
              </div>
              <button
                type="button"
                onClick={() => updateFormData('transferable', !formData.transferable)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  formData.transferable ? 'bg-[#50908D]' : 'bg-[#D4CFC4]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  formData.transferable ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-xl text-[#1A1A1A] mb-6">Review & Confirm</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                <span className="text-[#8A8A8A]">Type</span>
                <span className="font-medium capitalize">{formData.lockType}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                <span className="text-[#8A8A8A]">Token</span>
                <span className="font-mono text-sm">{formData.tokenMint.slice(0, 8)}...{formData.tokenMint.slice(-8) || '—'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                <span className="text-[#8A8A8A]">Amount</span>
                <span className="font-mono">{formData.amount || '—'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                <span className="text-[#8A8A8A]">Recipient</span>
                <span className="font-mono text-sm">{formData.recipient.slice(0, 8)}...{formData.recipient.slice(-8) || '—'}</span>
              </div>
              {formData.lockType === 'lock' ? (
                <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                  <span className="text-[#8A8A8A]">Unlock Date</span>
                  <span>{formData.unlockDate || '—'}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                    <span className="text-[#8A8A8A]">Schedule</span>
                    <span className="capitalize">{formData.vestingSchedule}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                    <span className="text-[#8A8A8A]">Duration</span>
                    <span>{formData.vestingDuration} days</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                <span className="text-[#8A8A8A]">Yield Boost</span>
                <span className={formData.enableYieldBoost ? 'text-[#50908D]' : ''}>{formData.enableYieldBoost ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#E5E0D8]">
                <span className="text-[#8A8A8A]">Cancel Authority</span>
                <span className="capitalize">{formData.cancelAuthority}</span>
              </div>
            </div>

            <div className="bg-[#FAFAF8] p-4 border border-[#E5E0D8] text-sm text-[#8A8A8A]">
              <p>By creating this lock, you agree to the terms and conditions. The lock will be created on-chain and will generate a public proof page.</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[#E5E0D8]">
          <button
            type="button"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(Math.min(5, step + 1))}
              className="btn-primary"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => alert('Creating lock... (demo)')}
              className="btn-primary"
            >
              Create Lock
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
