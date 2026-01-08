import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  apiSecret: process.env.API_SECRET || 'dev-secret',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/solflow',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // Solana
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  solanaWsUrl: process.env.SOLANA_WS_URL || 'wss://api.devnet.solana.com',

  // Program IDs
  memelockCoreProgramId: process.env.MEMELOCK_CORE_PROGRAM_ID || 'Mem1ockCorexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  memelockYieldBoostProgramId: process.env.MEMELOCK_YIELD_BOOST_PROGRAM_ID || 'Mem1ockYie1dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',

  // Oracle
  oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY || '',
  attestationExpirySeconds: parseInt(process.env.ATTESTATION_EXPIRY_SECONDS || '3600', 10),

  // Auto-claim
  autoClaimEnabled: process.env.AUTO_CLAIM_ENABLED === 'true',
  autoClaimIntervalMs: parseInt(process.env.AUTO_CLAIM_INTERVAL_MS || '60000', 10),
  autoClaimRelayerPrivateKey: process.env.AUTO_CLAIM_RELAYER_PRIVATE_KEY || '',

  // Notifications
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@solflow.io',
  },

  // LST mints
  jitoSolMint: process.env.JITO_SOL_MINT || 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  msolMint: process.env.MSOL_MINT || 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
};

