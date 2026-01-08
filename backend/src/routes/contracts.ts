import { Router } from 'express';
import { z } from 'zod';
import { prisma, logger } from '../index.js';
import { ContractState } from '@prisma/client';

export const contractRoutes = Router();

// Get all contracts with filtering
contractRoutes.get('/', async (req, res) => {
  try {
    const querySchema = z.object({
      sender: z.string().optional(),
      recipient: z.string().optional(),
      mint: z.string().optional(),
      state: z.nativeEnum(ContractState).optional(),
      projectId: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    });

    const query = querySchema.parse(req.query);

    const where = {
      ...(query.sender && { senderAddress: query.sender }),
      ...(query.recipient && { recipientAddress: query.recipient }),
      ...(query.mint && { mintAddress: query.mint }),
      ...(query.state && { state: query.state }),
      ...(query.projectId && { projectId: query.projectId }),
    };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          project: true,
          yieldBoost: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({
      contracts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch contracts');
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Get contract by address
contractRoutes.get('/:address', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { address: req.params.address },
      include: {
        project: true,
        yieldBoost: true,
        withdrawals: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
        transfers: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Calculate current unlocked amount
    const unlocked = calculateUnlocked(contract);

    res.json({
      ...contract,
      computed: {
        unlocked,
        claimable: BigInt(unlocked) - contract.withdrawnAmount,
        percentComplete: calculatePercentComplete(contract),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch contract');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contracts by wallet (sender or recipient)
contractRoutes.get('/wallet/:address', async (req, res) => {
  try {
    const querySchema = z.object({
      role: z.enum(['sender', 'recipient', 'any']).default('any'),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    });

    const query = querySchema.parse(req.query);
    const walletAddress = req.params.address;

    const where = query.role === 'sender'
      ? { senderAddress: walletAddress }
      : query.role === 'recipient'
        ? { recipientAddress: walletAddress }
        : { OR: [{ senderAddress: walletAddress }, { recipientAddress: walletAddress }] };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          project: true,
          yieldBoost: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({
      contracts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch wallet contracts');
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Get withdrawals for a contract
contractRoutes.get('/:address/withdrawals', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { address: req.params.address },
    });

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { contractId: contract.id },
      orderBy: { timestamp: 'desc' },
    });

    res.json({ withdrawals });
  } catch (error) {
    logger.error(error, 'Failed to fetch withdrawals');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function calculateUnlocked(contract: any): bigint {
  const now = Date.now();
  const startTs = new Date(contract.startTs).getTime();
  const endTs = new Date(contract.endTs).getTime();

  // Not started yet
  if (now < startTs) {
    return BigInt(0);
  }

  // Fully unlocked
  if (now >= endTs) {
    return contract.totalAmount;
  }

  // Lock (single unlock)
  if (contract.kind === 'LOCK') {
    return BigInt(0);
  }

  // Vesting calculation
  const intervalMs = contract.unlockIntervalSeconds * 1000;
  if (intervalMs === 0) {
    return BigInt(0);
  }

  const elapsed = now - startTs;
  const totalDuration = endTs - startTs;

  const elapsedIntervals = Math.floor(elapsed / intervalMs);
  const totalIntervals = Math.floor(totalDuration / intervalMs);

  if (totalIntervals === 0) {
    return BigInt(0);
  }

  // Base amount without cliff
  const baseAmount = contract.totalAmount - contract.cliffAmount;

  // Linear vesting of base amount
  const vestedBase = (baseAmount * BigInt(elapsedIntervals)) / BigInt(totalIntervals);

  // Cliff is unlocked at first interval
  const cliff = elapsedIntervals > 0 ? contract.cliffAmount : BigInt(0);

  return vestedBase + cliff;
}

function calculatePercentComplete(contract: any): number {
  const unlocked = calculateUnlocked(contract);
  if (contract.totalAmount === BigInt(0)) {
    return 0;
  }
  return Number((unlocked * BigInt(10000)) / contract.totalAmount) / 100;
}

