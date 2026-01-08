import { Router } from 'express';
import { z } from 'zod';
import { prisma, logger } from '../index.js';
import { YieldBoostState } from '@prisma/client';

export const yieldBoostRoutes = Router();

// Get all yield boosts
yieldBoostRoutes.get('/', async (req, res) => {
  try {
    const querySchema = z.object({
      user: z.string().optional(),
      state: z.nativeEnum(YieldBoostState).optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    });

    const query = querySchema.parse(req.query);

    const where = {
      ...(query.user && { userAddress: query.user }),
      ...(query.state && { state: query.state }),
    };

    const [boosts, total] = await Promise.all([
      prisma.yieldBoost.findMany({
        where,
        include: {
          contract: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.yieldBoost.count({ where }),
    ]);

    res.json({
      boosts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch yield boosts');
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Get yield boost by address
yieldBoostRoutes.get('/:address', async (req, res) => {
  try {
    const boost = await prisma.yieldBoost.findUnique({
      where: { address: req.params.address },
      include: {
        contract: true,
      },
    });

    if (!boost) {
      return res.status(404).json({ error: 'Yield boost not found' });
    }

    // Calculate current yield estimate
    const yieldEstimate = calculateYieldEstimate(boost);

    res.json({
      ...boost,
      computed: {
        estimatedYield: yieldEstimate,
        estimatedApy: calculateApy(boost),
        daysRemaining: calculateDaysRemaining(boost),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch yield boost');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get yield boost for a contract
yieldBoostRoutes.get('/contract/:contractAddress', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { address: req.params.contractAddress },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const boost = await prisma.yieldBoost.findUnique({
      where: { contractId: contract.id },
    });

    if (!boost) {
      return res.status(404).json({ error: 'No yield boost for this contract' });
    }

    res.json(boost);
  } catch (error) {
    logger.error(error, 'Failed to fetch yield boost for contract');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get yield boost stats
yieldBoostRoutes.get('/stats/overview', async (_req, res) => {
  try {
    const [totalBoosts, activeBoosts, totalMatched, totalYieldDistributed] = await Promise.all([
      prisma.yieldBoost.count(),
      prisma.yieldBoost.count({ where: { state: YieldBoostState.ACTIVE } }),
      prisma.yieldBoost.aggregate({
        _sum: { principalMatched: true },
      }),
      prisma.yieldBoost.aggregate({
        _sum: { yieldClaimed: true },
      }),
    ]);

    res.json({
      totalBoosts,
      activeBoosts,
      totalPrincipalMatched: totalMatched._sum.principalMatched || BigInt(0),
      totalYieldDistributed: totalYieldDistributed._sum.yieldClaimed || BigInt(0),
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch yield boost stats');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Estimate fee for yield boost
yieldBoostRoutes.post('/estimate-fee', async (req, res) => {
  try {
    const bodySchema = z.object({
      buyValueLamports: z.string(),
    });

    const body = bodySchema.parse(req.body);
    const buyValue = BigInt(body.buyValueLamports);

    // Default fee: 2% (200 bps)
    const feeBps = 200;
    const fee = (buyValue * BigInt(feeBps)) / BigInt(10000);

    // Apply min/max bounds
    const minFee = BigInt(1_000_000); // 0.001 SOL
    const maxFee = BigInt(10_000_000_000); // 10 SOL

    const finalFee = fee < minFee ? minFee : fee > maxFee ? maxFee : fee;

    res.json({
      estimatedFee: finalFee.toString(),
      feeBps,
      principalMatched: finalFee.toString(),
      estimatedYieldRange: {
        low: ((finalFee * BigInt(5)) / BigInt(100)).toString(), // 5% APY
        high: ((finalFee * BigInt(10)) / BigInt(100)).toString(), // 10% APY
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to estimate fee');
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Helper functions
function calculateYieldEstimate(boost: any): string {
  if (boost.state !== YieldBoostState.ACTIVE) {
    return boost.yieldAccrued.toString();
  }

  // Estimate based on LST appreciation (assume ~7% APY)
  const now = Date.now();
  const fundedAt = new Date(boost.fundedAt).getTime();
  const elapsed = now - fundedAt;
  const elapsedYears = elapsed / (365 * 24 * 60 * 60 * 1000);

  const estimatedYield = Number(boost.lstAmountDeposited) * 0.07 * elapsedYears;

  return Math.floor(estimatedYield).toString();
}

function calculateApy(boost: any): number {
  // Return current estimated APY for LSTs (varies by market)
  return 7.5; // 7.5% APY estimate
}

function calculateDaysRemaining(boost: any): number {
  const now = Date.now();
  const endTs = new Date(boost.lockEndTs).getTime();
  const remaining = endTs - now;

  return Math.max(0, Math.floor(remaining / (24 * 60 * 60 * 1000)));
}

