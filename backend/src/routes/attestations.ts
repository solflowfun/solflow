import { Router } from 'express';
import { z } from 'zod';
import { Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { prisma, logger } from '../index.js';
import { config } from '../config.js';
import { QuoteAsset } from '@prisma/client';
import crypto from 'crypto';

export const attestationRoutes = Router();

// Connection to Solana
const connection = new Connection(config.solanaRpcUrl, 'confirmed');

interface SwapInfo {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  amountOut: bigint;
  price: number;
}

// Request attestation for buy price
attestationRoutes.post('/request', async (req, res) => {
  try {
    const bodySchema = z.object({
      walletAddress: z.string(),
      mintAddress: z.string(),
      amountToLock: z.string(), // BigInt as string
      txSignatures: z.array(z.string()).min(1).max(10),
    });

    const body = bodySchema.parse(req.body);

    // Parse and validate addresses
    const wallet = new PublicKey(body.walletAddress);
    const mint = new PublicKey(body.mintAddress);
    const amountToLock = BigInt(body.amountToLock);

    // Fetch and parse transactions
    const swaps: SwapInfo[] = [];
    let totalTokensAcquired = BigInt(0);
    let totalSolSpent = BigInt(0);

    for (const sig of body.txSignatures) {
      const tx = await connection.getParsedTransaction(sig, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        return res.status(400).json({ error: `Transaction not found: ${sig}` });
      }

      // Verify transaction is from the wallet
      const signerKeys = tx.transaction.message.accountKeys
        .filter(key => key.signer)
        .map(key => key.pubkey.toBase58());

      if (!signerKeys.includes(wallet.toBase58())) {
        return res.status(400).json({
          error: `Transaction ${sig} was not signed by wallet`,
        });
      }

      // Parse swap info from transaction
      const swapInfo = parseSwapTransaction(tx, mint.toBase58());
      if (swapInfo) {
        swaps.push(swapInfo);
        totalTokensAcquired += swapInfo.amountOut;
        totalSolSpent += swapInfo.amountIn;
      }
    }

    if (swaps.length === 0) {
      return res.status(400).json({
        error: 'No valid swap transactions found for the specified token',
      });
    }

    // Validate that amount to lock doesn't exceed tokens acquired
    if (amountToLock > totalTokensAcquired) {
      return res.status(400).json({
        error: `Amount to lock (${amountToLock}) exceeds tokens acquired (${totalTokensAcquired})`,
      });
    }

    // Calculate prorated buy value for the amount being locked
    const buyValueLamports = (totalSolSpent * amountToLock) / totalTokensAcquired;

    // Calculate average price
    const avgPrice = Number(totalSolSpent) / Number(totalTokensAcquired);

    // Create attestation
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + config.attestationExpirySeconds;

    // Hash the tx signatures for reference
    const txsHash = crypto
      .createHash('sha256')
      .update(body.txSignatures.sort().join(','))
      .digest();

    // Create attestation message
    const attestationData = {
      wallet: wallet.toBase58(),
      mint: mint.toBase58(),
      amountLocked: amountToLock.toString(),
      buyValueLamports: buyValueLamports.toString(),
      quoteAsset: 'SOL',
      txsHash: txsHash.toString('hex'),
      issuedAt: now,
      expiresAt,
    };

    // Sign attestation with oracle key
    const message = JSON.stringify(attestationData);
    const messageBytes = new TextEncoder().encode(message);

    let signature: string;
    if (config.oraclePrivateKey) {
      const secretKey = bs58.decode(config.oraclePrivateKey);
      const keypair = nacl.sign.keyPair.fromSecretKey(secretKey);
      const sig = nacl.sign.detached(messageBytes, keypair.secretKey);
      signature = bs58.encode(sig);
    } else {
      // For development, create a placeholder signature
      signature = 'dev-signature-placeholder';
    }

    // Store attestation in database
    const attestation = await prisma.attestation.create({
      data: {
        walletAddress: wallet.toBase58(),
        mintAddress: mint.toBase58(),
        amountLocked: amountToLock,
        buyValueLamports: buyValueLamports,
        quoteAsset: QuoteAsset.SOL,
        txSignatures: body.txSignatures,
        txsHash: txsHash.toString('hex'),
        issuedAt: new Date(now * 1000),
        expiresAt: new Date(expiresAt * 1000),
        signature,
      },
    });

    res.json({
      attestation: {
        id: attestation.id,
        ...attestationData,
        signature,
      },
      swapDetails: {
        totalTokensAcquired: totalTokensAcquired.toString(),
        totalSolSpent: totalSolSpent.toString(),
        averagePrice: avgPrice,
        swapsProcessed: swaps.length,
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to create attestation');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attestation by ID
attestationRoutes.get('/:id', async (req, res) => {
  try {
    const attestation = await prisma.attestation.findUnique({
      where: { id: req.params.id },
    });

    if (!attestation) {
      return res.status(404).json({ error: 'Attestation not found' });
    }

    res.json(attestation);
  } catch (error) {
    logger.error(error, 'Failed to fetch attestation');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify attestation
attestationRoutes.post('/verify', async (req, res) => {
  try {
    const bodySchema = z.object({
      attestationData: z.string(), // JSON string
      signature: z.string(),
    });

    const body = bodySchema.parse(req.body);

    const message = new TextEncoder().encode(body.attestationData);

    // In production, verify against oracle public key
    // For now, just check the signature is not empty
    const isValid = body.signature && body.signature.length > 0;

    // Check expiry
    const data = JSON.parse(body.attestationData);
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now > data.expiresAt;

    res.json({
      valid: isValid && !isExpired,
      isExpired,
      signatureValid: isValid,
    });
  } catch (error) {
    logger.error(error, 'Failed to verify attestation');
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Parse swap transaction to extract swap info
function parseSwapTransaction(tx: any, targetMint: string): SwapInfo | null {
  try {
    // Look for token balance changes
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    // Find the target token account
    let tokenReceived = BigInt(0);
    let solSpent = BigInt(0);

    for (const post of postBalances) {
      if (post.mint === targetMint) {
        const pre = preBalances.find(
          (p: any) => p.accountIndex === post.accountIndex
        );
        const preAmount = BigInt(pre?.uiTokenAmount?.amount || '0');
        const postAmount = BigInt(post.uiTokenAmount?.amount || '0');

        if (postAmount > preAmount) {
          tokenReceived += postAmount - preAmount;
        }
      }
    }

    // Calculate SOL spent from lamport changes
    const preLamports = tx.meta?.preBalances?.[0] || 0;
    const postLamports = tx.meta?.postBalances?.[0] || 0;
    const fee = tx.meta?.fee || 0;

    // SOL spent is the decrease in balance minus the fee
    if (preLamports > postLamports) {
      solSpent = BigInt(preLamports - postLamports - fee);
    }

    if (tokenReceived === BigInt(0) || solSpent === BigInt(0)) {
      return null;
    }

    return {
      tokenIn: 'So11111111111111111111111111111111111111112', // WSOL
      tokenOut: targetMint,
      amountIn: solSpent,
      amountOut: tokenReceived,
      price: Number(solSpent) / Number(tokenReceived),
    };
  } catch (error) {
    logger.error(error, 'Failed to parse swap transaction');
    return null;
  }
}

