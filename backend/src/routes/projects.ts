import { Router } from 'express';
import { z } from 'zod';
import { prisma, logger } from '../index.js';

export const projectRoutes = Router();

// Get all projects
projectRoutes.get('/', async (req, res) => {
  try {
    const querySchema = z.object({
      verified: z.coerce.boolean().optional(),
      owner: z.string().optional(),
      search: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      sortBy: z.enum(['createdAt', 'totalValueLocked', 'contractCount']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    });

    const query = querySchema.parse(req.query);

    const where = {
      ...(query.verified !== undefined && { verified: query.verified }),
      ...(query.owner && { ownerAddress: query.owner }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' as const } },
          { slug: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: {
            select: { contracts: true },
          },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch projects');
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Get project by slug
projectRoutes.get('/:slug', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            yieldBoost: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Calculate aggregate stats
    const stats = await prisma.contract.aggregate({
      where: { projectId: project.id },
      _sum: {
        totalAmount: true,
        withdrawnAmount: true,
      },
      _count: true,
    });

    res.json({
      ...project,
      stats: {
        contractCount: stats._count,
        totalLocked: stats._sum.totalAmount || BigInt(0),
        totalWithdrawn: stats._sum.withdrawnAmount || BigInt(0),
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to fetch project');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project
projectRoutes.post('/', async (req, res) => {
  try {
    const bodySchema = z.object({
      slug: z.string().min(3).max(32).regex(/^[a-z0-9-]+$/),
      ownerAddress: z.string(),
      name: z.string().min(1).max(64),
      description: z.string().max(500).optional(),
      website: z.string().url().optional(),
      twitter: z.string().max(64).optional(),
      discord: z.string().url().optional(),
      telegram: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
    });

    const body = bodySchema.parse(req.body);

    // Check if slug is taken
    const existing = await prisma.project.findUnique({
      where: { slug: body.slug },
    });

    if (existing) {
      return res.status(409).json({ error: 'Project slug already taken' });
    }

    const project = await prisma.project.create({
      data: body,
    });

    res.status(201).json(project);
  } catch (error) {
    logger.error(error, 'Failed to create project');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
projectRoutes.patch('/:slug', async (req, res) => {
  try {
    const bodySchema = z.object({
      name: z.string().min(1).max(64).optional(),
      description: z.string().max(500).optional(),
      website: z.string().url().optional(),
      twitter: z.string().max(64).optional(),
      discord: z.string().url().optional(),
      telegram: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
    });

    const body = bodySchema.parse(req.body);

    const project = await prisma.project.update({
      where: { slug: req.params.slug },
      data: body,
    });

    res.json(project);
  } catch (error) {
    logger.error(error, 'Failed to update project');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get project contracts
projectRoutes.get('/:slug/contracts', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: req.params.slug },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const querySchema = z.object({
      state: z.string().optional(),
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    });

    const query = querySchema.parse(req.query);

    const where = {
      projectId: project.id,
      ...(query.state && { state: query.state as any }),
    };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
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
    logger.error(error, 'Failed to fetch project contracts');
    res.status(400).json({ error: 'Invalid request' });
  }
});

