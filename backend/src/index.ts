import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import pino from 'pino';

import { config } from './config.js';
import { contractRoutes } from './routes/contracts.js';
import { projectRoutes } from './routes/projects.js';
import { attestationRoutes } from './routes/attestations.js';
import { yieldBoostRoutes } from './routes/yield-boost.js';
import { statsRoutes } from './routes/stats.js';
import { webhookRoutes } from './routes/webhooks.js';
import { Indexer } from './services/indexer.js';
import { AutoClaimWorker } from './services/auto-claim.js';
import { NotificationService } from './services/notifications.js';

// Initialize logger
export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/contracts', contractRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/attestations', attestationRoutes);
app.use('/api/yield-boost', yieldBoostRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start services
async function main() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Connected to database');

    // Start indexer
    const indexer = new Indexer();
    await indexer.start();
    logger.info('Indexer started');

    // Start auto-claim worker if enabled
    if (config.autoClaimEnabled) {
      const autoClaimWorker = new AutoClaimWorker();
      autoClaimWorker.start();
      logger.info('Auto-claim worker started');
    }

    // Initialize notification service
    const notificationService = new NotificationService();
    await notificationService.initialize();
    logger.info('Notification service initialized');

    // Start HTTP server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });

  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main();

