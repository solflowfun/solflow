'use client';

// Mock protocol stats
const protocolStats = {
  totalValueLocked: '$2.4M',
  totalLocks: '1,247',
  activeVesting: '342',
  yieldDistributed: '892 SOL',
  uniqueUsers: '3,421',
  tokensLocked: '156',
};

const recentActivity = [
  { time: '2 min ago', action: 'Lock Created', token: '$FLOW', amount: '500,000', user: 'Flo3...x7Kp' },
  { time: '15 min ago', action: 'Yield Claimed', token: '$MOON', amount: '0.45 SOL', user: 'Mn8a...pQ2w' },
  { time: '32 min ago', action: 'Vesting Started', token: '$PEPE', amount: '10,000,000', user: 'Pe4x...mN9k' },
  { time: '1 hr ago', action: 'Lock Unlocked', token: '$DOGE', amount: '2,500,000', user: 'Dg7k...pL3m' },
  { time: '2 hr ago', action: 'Boost Enabled', token: '$SHIB', amount: '1.2 SOL', user: 'Sh1b...kL9x' },
];

const topTokens = [
  { rank: 1, token: '$FLOW', icon: '🌊', locked: '45,000,000', locksCount: 234, yieldEnabled: '78%' },
  { rank: 2, token: '$MOON', icon: '🌙', locked: '32,000,000', locksCount: 189, yieldEnabled: '65%' },
  { rank: 3, token: '$PEPE', icon: '🐸', locked: '28,500,000', locksCount: 156, yieldEnabled: '82%' },
  { rank: 4, token: '$DOGE', icon: '🐕', locked: '21,000,000', locksCount: 142, yieldEnabled: '45%' },
  { rank: 5, token: '$SHIB', icon: '🐶', locked: '18,200,000', locksCount: 98, yieldEnabled: '71%' },
];

export default function StatsPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#8A8A8A] mb-3">Protocol</div>
        <h1 className="font-editorial text-4xl text-[#1A1A1A] mb-4">Statistics</h1>
        <p className="text-[#4A4A4A]">Real-time metrics and activity across the Solflow protocol.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">TVL</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{protocolStats.totalValueLocked}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Total Locks</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{protocolStats.totalLocks}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Active Vesting</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{protocolStats.activeVesting}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Yield Distributed</div>
          <div className="font-editorial text-2xl text-[#50908D]">{protocolStats.yieldDistributed}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Users</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{protocolStats.uniqueUsers}</div>
        </div>
        <div className="editorial-card p-6">
          <div className="text-[10px] uppercase tracking-[0.15em] text-[#8A8A8A] mb-2">Tokens</div>
          <div className="font-editorial text-2xl text-[#1A1A1A]">{protocolStats.tokensLocked}</div>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div>
          <h2 className="font-editorial text-2xl text-[#1A1A1A] mb-6">Recent Activity</h2>
          <div className="editorial-card overflow-hidden">
            <div className="divide-y divide-[#E5E0D8]">
              {recentActivity.map((activity, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#FAFAF8] transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'Lock Created' ? 'bg-[#50908D]' :
                    activity.action === 'Yield Claimed' ? 'bg-[#C47809]' :
                    activity.action === 'Vesting Started' ? 'bg-[#817CCD]' :
                    activity.action === 'Lock Unlocked' ? 'bg-[#8CCBBF]' :
                    'bg-[#E08B46]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-[#1A1A1A]">{activity.action}</span>
                      <span className="text-[#8A8A8A]">•</span>
                      <span className="text-[#4A4A4A]">{activity.token}</span>
                    </div>
                    <div className="text-xs text-[#8A8A8A] mt-0.5">
                      {activity.amount} by {activity.user}
                    </div>
                  </div>
                  <div className="text-xs text-[#8A8A8A]">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Tokens */}
        <div>
          <h2 className="font-editorial text-2xl text-[#1A1A1A] mb-6">Top Tokens</h2>
          <div className="editorial-card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr className="bg-[#FAFAF8]">
                  <th className="px-4">#</th>
                  <th className="px-4">Token</th>
                  <th className="px-4 text-right">Locked</th>
                  <th className="px-4 text-right">Locks</th>
                  <th className="px-4 text-right">Yield</th>
                </tr>
              </thead>
              <tbody>
                {topTokens.map((token) => (
                  <tr key={token.rank} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 text-[#8A8A8A]">{token.rank}</td>
                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span className="font-medium text-[#1A1A1A]">{token.token}</span>
                      </div>
                    </td>
                    <td className="px-4 text-right">{token.locked}</td>
                    <td className="px-4 text-right text-[#8A8A8A]">{token.locksCount}</td>
                    <td className="px-4 text-right text-[#50908D]">{token.yieldEnabled}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Protocol Health */}
      <div className="mt-16">
        <h2 className="font-editorial text-2xl text-[#1A1A1A] mb-6">Protocol Health</h2>
        <div className="editorial-card p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#50908D]" />
                <span className="text-sm font-medium text-[#1A1A1A]">Staking Pool</span>
              </div>
              <div className="text-sm text-[#4A4A4A] mb-2">Total staked in LST pool for yield distribution</div>
              <div className="font-mono text-xl text-[#1A1A1A]">1,245 SOL</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#817CCD]" />
                <span className="text-sm font-medium text-[#1A1A1A]">Average APY</span>
              </div>
              <div className="text-sm text-[#4A4A4A] mb-2">Yield boost returns across all enabled locks</div>
              <div className="font-mono text-xl text-[#50908D]">7.2%</div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#C47809]" />
                <span className="text-sm font-medium text-[#1A1A1A]">Treasury</span>
              </div>
              <div className="text-sm text-[#4A4A4A] mb-2">Protocol fees collected (multisig-controlled)</div>
              <div className="font-mono text-xl text-[#1A1A1A]">342 SOL</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
