import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import bs58 from 'bs58';
import { prisma, logger } from '../index.js';
import { config } from '../config.js';
import { ContractState, ExecutionStatus } from '@prisma/client';

export class AutoClaimWorker {
  private connection: Connection;
  private relayerKeypair: Keypair | null = null;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = new Connection(config.solanaRpcUrl, 'confirmed');

    if (config.autoClaimRelayerPrivateKey) {
      try {
        const secretKey = bs58.decode(config.autoClaimRelayerPrivateKey);
        this.relayerKeypair = Keypair.fromSecretKey(secretKey);
        logger.info(`Auto-claim relayer: ${this.relayerKeypair.publicKey.toBase58()}`);
      } catch (error) {
        logger.error(error, 'Failed to load relayer keypair');
      }
    }
  }

  start() {
    if (this.isRunning) {
      logger.warn('Auto-claim worker already running');
      return;
    }

    if (!this.relayerKeypair) {
      logger.warn('Auto-claim disabled: no relayer key configured');
      return;
    }

    this.isRunning = true;
    logger.info('Starting auto-claim worker...');

    // Run immediately, then on interval
    this.processAutoClaims();

    this.intervalId = setInterval(() => {
      this.processAutoClaims();
    }, config.autoClaimIntervalMs);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Auto-claim worker stopped');
  }

  private async processAutoClaims() {
    try {
      // Find contracts with auto-claim enabled that have claimable tokens
      const autoClaimConfigs = await prisma.autoClaimConfig.findMany({
        where: { active: true },
      });

      logger.info(`Processing ${autoClaimConfigs.length} auto-claim configs`);

      for (const autoConfig of autoClaimConfigs) {
        try {
          await this.processContract(autoConfig);
        } catch (error) {
          logger.error(error, `Failed to process auto-claim for ${autoConfig.contractAddress}`);
        }
      }
    } catch (error) {
      logger.error(error, 'Auto-claim processing error');
    }
  }

  private async processContract(autoConfig: any) {
    // Get contract details
    const contract = await prisma.contract.findUnique({
      where: { address: autoConfig.contractAddress },
    });

    if (!contract || contract.state !== ContractState.ACTIVE) {
      return;
    }

    // Calculate claimable amount
    const claimable = this.calculateClaimable(contract);

    if (claimable <= autoConfig.minClaimAmount) {
      return;
    }

    // Check if there are enough prepaid fees
    const feeRequired = await this.estimateFee();
    if (autoConfig.prepaidFees - autoConfig.feesUsed < feeRequired) {
      logger.warn(`Insufficient prepaid fees for ${contract.address}`);
      return;
    }

    // Execute withdrawal
    const result = await this.executeWithdrawal(contract, claimable);

    // Record execution
    await prisma.autoClaimExecution.create({
      data: {
        contractAddress: contract.address,
        amount: BigInt(claimable),
        feeCharged: BigInt(feeRequired),
        txSignature: result.signature || 'failed',
        status: result.success ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED,
        errorMessage: result.error,
      },
    });

    if (result.success) {
      // Update config
      await prisma.autoClaimConfig.update({
        where: { id: autoConfig.id },
        data: {
          feesUsed: { increment: BigInt(feeRequired) },
          claimsExecuted: { increment: 1 },
          lastClaimAt: new Date(),
        },
      });

      logger.info(`Auto-claim executed for ${contract.address}: ${claimable} tokens`);
    }
  }

  private calculateClaimable(contract: any): bigint {
    const now = Date.now();
    const startTs = new Date(contract.startTs).getTime();
    const endTs = new Date(contract.endTs).getTime();

    if (now < startTs) {
      return BigInt(0);
    }

    if (now >= endTs) {
      return contract.totalAmount - contract.withdrawnAmount;
    }

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

    const baseAmount = contract.totalAmount - contract.cliffAmount;
    const vestedBase = (baseAmount * BigInt(elapsedIntervals)) / BigInt(totalIntervals);
    const cliff = elapsedIntervals > 0 ? contract.cliffAmount : BigInt(0);

    const unlocked = vestedBase + cliff;
    return unlocked - contract.withdrawnAmount;
  }

  private async estimateFee(): Promise<bigint> {
    // Estimate transaction fee + protocol fee
    const baseFee = BigInt(5000); // ~5000 lamports for tx fee
    const protocolFee = BigInt(config.autoClaimIntervalMs); // Per-withdraw fee from config
    return baseFee + protocolFee;
  }

  private async executeWithdrawal(
    contract: any,
    amount: bigint
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    if (!this.relayerKeypair) {
      return { success: false, error: 'No relayer keypair' };
    }

    try {
      const programId = new PublicKey(config.memelockCoreProgramId);
      const contractPubkey = new PublicKey(contract.address);
      const mint = new PublicKey(contract.mintAddress);
      const recipient = new PublicKey(contract.recipientAddress);

      // Get or create recipient's ATA
      const recipientAta = await getAssociatedTokenAddress(mint, recipient);

      // Check if ATA exists
      const ataInfo = await this.connection.getAccountInfo(recipientAta);

      const instructions = [];

      if (!ataInfo) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            this.relayerKeypair.publicKey,
            recipientAta,
            recipient,
            mint
          )
        );
      }

      // Build withdraw instruction
      // This is a simplified version - in production, use proper Anchor instruction building
      const withdrawIx = {
        programId,
        keys: [
          { pubkey: recipient, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: contractPubkey, isSigner: false, isWritable: true },
          { pubkey: new PublicKey(contract.escrowTokenAccount), isSigner: false, isWritable: true },
          { pubkey: recipientAta, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([/* withdraw instruction discriminator + amount */]),
      };

      instructions.push(withdrawIx);

      const transaction = new Transaction().add(...instructions);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.relayerKeypair.publicKey;

      // Sign and send
      transaction.sign(this.relayerKeypair);

      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: false }
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      return { success: true, signature };
    } catch (error: any) {
      logger.error(error, 'Withdrawal execution failed');
      return { success: false, error: error.message };
    }
  }
}

