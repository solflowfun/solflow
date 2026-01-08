import { Router } from 'express';
import { prisma, logger } from '../index.js';
import { ContractState, ContractKind } from '@prisma/client';

export const statsRoutes = Router();

// Get protocol overview stats
statsRoutes.get('/overview', async (_req, res) => {
  try {
    const [
      totalContracts,
      activeContracts,
      lockContracts,
      vestingContracts,
      totalLocked,
      totalProjects,
      verifiedProjects,
    ] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { state: ContractState.ACTIVE } }),
      prisma.contract.count({ where: { kind: ContractKind.LOCK } }),
      prisma.contract.count({ where: { kind: ContractKind.VESTING } }),
      prisma.contract.aggregate({
        _sum: { totalAmount: true },
        where: { state: { in: [ContractState.ACTIVE, ContractState.SCHEDULED] } },
      }),
      prisma.project.count(),
      prisma.project.count({ where: { verified: true } }),
    ]);

    res.json({
      contracts: {
        total: totalContracts,
        active: activeContracts,
        locks: lockContracts,
        vesting: vestingContracts,
      },
      totalValueLocked: totalLocked._sum.totalAmount?.toString() || '0',
      projects: {
        total: totalProjects,
        verified: verifiedProjects,
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch overview stats');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats by time period
statsRoutes.get('/history', async (req, res) => {
  try {
    const period = req.query.period as string || '30d';

    let days: number;
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      case '1y':
        days = 365;
        break;
      default:
        days = 30;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily contract counts
    const contracts = await prisma.contract.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        kind: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by day
    const dailyStats: Record<string, any> = {};

    for (const contract of contracts) {
      const date = contract.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          contracts: 0,
          locks: 0,
          vesting: 0,
          volume: BigInt(0),
        };
      }
      dailyStats[date].contracts++;
      if (contract.kind === ContractKind.LOCK) {
        dailyStats[date].locks++;
      } else {
        dailyStats[date].vesting++;
      }
      dailyStats[date].volume += contract.totalAmount;
    }

    // Convert to array and serialize BigInt
    const history = Object.values(dailyStats).map((day: any) => ({
      ...day,
      volume: day.volume.toString(),
    }));

    res.json({ history, period });
  } catch (error) {
    logger.error(error, 'Failed to fetch history stats');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top tokens by TVL
statsRoutes.get('/top-tokens', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    const tokens = await prisma.contract.groupBy({
      by: ['mintAddress'],
      _sum: { totalAmount: true },
      _count: true,
      where: { state: { in: [ContractState.ACTIVE, ContractState.SCHEDULED] } },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: limit,
    });

    // Get token metadata for each
    const tokenData = await Promise.all(
      tokens.map(async (token) => {
        const contract = await prisma.contract.findFirst({
          where: { mintAddress: token.mintAddress },
          select: {
            tokenSymbol: true,
            tokenName: true,
            tokenDecimals: true,
            tokenLogoUrl: true,
          },
        });

        return {
          mint: token.mintAddress,
          symbol: contract?.tokenSymbol,
          name: contract?.tokenName,
          decimals: contract?.tokenDecimals || 9,
          logoUrl: contract?.tokenLogoUrl,
          totalLocked: token._sum.totalAmount?.toString() || '0',
          contractCount: token._count,
        };
      })
    );

    res.json({ tokens: tokenData });
  } catch (error) {
    logger.error(error, 'Failed to fetch top tokens');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
statsRoutes.get('/recent-activity', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const [recentContracts, recentWithdrawals] = await Promise.all([
      prisma.contract.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          address: true,
          kind: true,
          mintAddress: true,
          tokenSymbol: true,
          totalAmount: true,
          senderAddress: true,
          recipientAddress: true,
          createdAt: true,
        },
      }),
      prisma.withdrawal.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
        include: {
          contract: {
            select: {
              address: true,
              mintAddress: true,
              tokenSymbol: true,
            },
          },
        },
      }),
    ]);

    // Merge and sort by timestamp
    const activity = [
      ...recentContracts.map((c) => ({
        type: 'contract_created' as const,
        timestamp: c.createdAt,
        data: {
          address: c.address,
          kind: c.kind,
          mint: c.mintAddress,
          symbol: c.tokenSymbol,
          amount: c.totalAmount.toString(),
          sender: c.senderAddress,
          recipient: c.recipientAddress,
        },
      })),
      ...recentWithdrawals.map((w) => ({
        type: 'withdrawal' as const,
        timestamp: w.timestamp,
        data: {
          contractAddress: w.contract.address,
          mint: w.contract.mintAddress,
          symbol: w.contract.tokenSymbol,
          amount: w.amount.toString(),
          txSignature: w.txSignature,
        },
      })),
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    res.json({ activity });
  } catch (error) {
    logger.error(error, 'Failed to fetch recent activity');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unlock schedule for upcoming unlocks
statsRoutes.get('/upcoming-unlocks', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 30, 365);
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const contracts = await prisma.contract.findMany({
      where: {
        state: ContractState.ACTIVE,
        endTs: {
          gte: now,
          lte: endDate,
        },
      },
      select: {
        address: true,
        kind: true,
        mintAddress: true,
        tokenSymbol: true,
        totalAmount: true,
        withdrawnAmount: true,
        endTs: true,
        recipientAddress: true,
      },
      orderBy: { endTs: 'asc' },
      take: 100,
    });

    const unlocks = contracts.map((c) => ({
      contractAddress: c.address,
      kind: c.kind,
      mint: c.mintAddress,
      symbol: c.tokenSymbol,
      amountToUnlock: (c.totalAmount - c.withdrawnAmount).toString(),
      unlockDate: c.endTs,
      recipient: c.recipientAddress,
    }));

    res.json({ unlocks, period: `${days}d` });
  } catch (error) {
    logger.error(error, 'Failed to fetch upcoming unlocks');
    res.status(500).json({ error: 'Internal server error' });
  }
});

