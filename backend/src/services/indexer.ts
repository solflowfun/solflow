import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { prisma, logger } from '../index.js';
import { config } from '../config.js';
import { ContractKind, ContractState, PermissionMode } from '@prisma/client';

const CHECKPOINT_NAME = 'memelock-indexer';

export class Indexer {
  private connection: Connection;
  private programId: PublicKey;
  private yieldBoostProgramId: PublicKey;
  private isRunning: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = new Connection(config.solanaRpcUrl, 'confirmed');
    this.programId = new PublicKey(config.memelockCoreProgramId);
    this.yieldBoostProgramId = new PublicKey(config.memelockYieldBoostProgramId);
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Indexer already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting indexer...');

    // Initial sync
    await this.sync();

    // Start polling for new transactions
    this.pollingInterval = setInterval(async () => {
      try {
        await this.sync();
      } catch (error) {
        logger.error(error, 'Indexer sync error');
      }
    }, 10000); // Poll every 10 seconds

    // Subscribe to program logs for real-time updates
    this.subscribeToLogs();
  }

  async stop() {
    this.isRunning = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    logger.info('Indexer stopped');
  }

  private async sync() {
    const checkpoint = await this.getCheckpoint();

    // Fetch recent signatures for the program
    const signatures = await this.connection.getSignaturesForAddress(
      this.programId,
      {
        until: checkpoint?.lastSignature || undefined,
        limit: 100,
      },
      'confirmed'
    );

    if (signatures.length === 0) {
      return;
    }

    logger.info(`Processing ${signatures.length} transactions`);

    // Process signatures in reverse order (oldest first)
    for (const sig of signatures.reverse()) {
      try {
        await this.processTransaction(sig.signature);
      } catch (error) {
        logger.error(error, `Failed to process transaction ${sig.signature}`);
      }
    }

    // Update checkpoint
    const latestSig = signatures[0];
    await this.updateCheckpoint(BigInt(latestSig.slot), latestSig.signature);
  }

  private async processTransaction(signature: string) {
    const tx = await this.connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      return;
    }

    // Look for program invocations
    const logs = tx.meta.logMessages || [];

    for (const log of logs) {
      if (log.includes('Instruction: CreateLock')) {
        await this.handleCreateLock(tx, signature);
      } else if (log.includes('Instruction: CreateVesting')) {
        await this.handleCreateVesting(tx, signature);
      } else if (log.includes('Instruction: Withdraw')) {
        await this.handleWithdraw(tx, signature);
      } else if (log.includes('Instruction: Cancel')) {
        await this.handleCancel(tx, signature);
      } else if (log.includes('Instruction: TransferRecipient')) {
        await this.handleTransferRecipient(tx, signature);
      }
    }
  }

  private async handleCreateLock(tx: ParsedTransactionWithMeta, signature: string) {
    try {
      // Parse accounts from transaction
      const accounts = tx.transaction.message.accountKeys;

      // Find the contract account (newly created PDA)
      const postBalances = tx.meta?.postTokenBalances || [];

      // Extract data from transaction
      // This is simplified - in production you'd deserialize the instruction data
      const contractAddress = this.findContractAccount(tx);
      if (!contractAddress) {
        logger.warn('Could not find contract account in transaction');
        return;
      }

      // Check if already indexed
      const existing = await prisma.contract.findUnique({
        where: { address: contractAddress },
      });
      if (existing) {
        return;
      }

      // Fetch account data from chain
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(contractAddress));
      if (!accountInfo) {
        return;
      }

      // Deserialize account data
      const contractData = this.deserializeContract(accountInfo.data);

      await prisma.contract.create({
        data: {
          address: contractAddress,
          kind: ContractKind.LOCK,
          state: ContractState.ACTIVE,
          senderAddress: contractData.sender,
          recipientAddress: contractData.recipient,
          mintAddress: contractData.mint,
          startTs: new Date(contractData.startTs * 1000),
          endTs: new Date(contractData.endTs * 1000),
          totalAmount: BigInt(contractData.totalAmount),
          cancelableBy: this.parsePermissionMode(contractData.cancelableBy),
          transferableBy: this.parsePermissionMode(contractData.transferableBy),
        },
      });

      logger.info(`Indexed new lock contract: ${contractAddress}`);
    } catch (error) {
      logger.error(error, 'Failed to handle CreateLock');
    }
  }

  private async handleCreateVesting(tx: ParsedTransactionWithMeta, signature: string) {
    try {
      const contractAddress = this.findContractAccount(tx);
      if (!contractAddress) {
        return;
      }

      // Check if already indexed
      const existing = await prisma.contract.findUnique({
        where: { address: contractAddress },
      });
      if (existing) {
        return;
      }

      // Fetch and deserialize account data
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(contractAddress));
      if (!accountInfo) {
        return;
      }

      const contractData = this.deserializeContract(accountInfo.data);

      await prisma.contract.create({
        data: {
          address: contractAddress,
          kind: ContractKind.VESTING,
          state: contractData.startTs > Date.now() / 1000 
            ? ContractState.SCHEDULED 
            : ContractState.ACTIVE,
          senderAddress: contractData.sender,
          recipientAddress: contractData.recipient,
          mintAddress: contractData.mint,
          startTs: new Date(contractData.startTs * 1000),
          endTs: new Date(contractData.endTs * 1000),
          unlockIntervalSeconds: contractData.unlockIntervalSeconds,
          cliffAmount: BigInt(contractData.cliffAmount),
          totalAmount: BigInt(contractData.totalAmount),
          cancelableBy: this.parsePermissionMode(contractData.cancelableBy),
          transferableBy: this.parsePermissionMode(contractData.transferableBy),
          pausable: contractData.pausable,
        },
      });

      logger.info(`Indexed new vesting contract: ${contractAddress}`);
    } catch (error) {
      logger.error(error, 'Failed to handle CreateVesting');
    }
  }

  private async handleWithdraw(tx: ParsedTransactionWithMeta, signature: string) {
    try {
      const contractAddress = this.findContractAccount(tx);
      if (!contractAddress) {
        return;
      }

      const contract = await prisma.contract.findUnique({
        where: { address: contractAddress },
      });

      if (!contract) {
        logger.warn(`Contract not found for withdrawal: ${contractAddress}`);
        return;
      }

      // Parse withdrawal amount from token balance changes
      const amount = this.parseWithdrawalAmount(tx, contract.mintAddress);

      // Check if withdrawal already recorded
      const existingWithdrawal = await prisma.withdrawal.findUnique({
        where: { txSignature: signature },
      });
      if (existingWithdrawal) {
        return;
      }

      // Record withdrawal
      await prisma.withdrawal.create({
        data: {
          contractId: contract.id,
          amount: BigInt(amount),
          txSignature: signature,
          timestamp: new Date(tx.blockTime! * 1000),
        },
      });

      // Update contract withdrawn amount
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          withdrawnAmount: { increment: BigInt(amount) },
        },
      });

      logger.info(`Indexed withdrawal for contract: ${contractAddress}, amount: ${amount}`);
    } catch (error) {
      logger.error(error, 'Failed to handle Withdraw');
    }
  }

  private async handleCancel(tx: ParsedTransactionWithMeta, signature: string) {
    try {
      const contractAddress = this.findContractAccount(tx);
      if (!contractAddress) {
        return;
      }

      await prisma.contract.update({
        where: { address: contractAddress },
        data: { state: ContractState.CANCELED },
      });

      logger.info(`Contract canceled: ${contractAddress}`);
    } catch (error) {
      logger.error(error, 'Failed to handle Cancel');
    }
  }

  private async handleTransferRecipient(tx: ParsedTransactionWithMeta, signature: string) {
    try {
      const contractAddress = this.findContractAccount(tx);
      if (!contractAddress) {
        return;
      }

      const contract = await prisma.contract.findUnique({
        where: { address: contractAddress },
      });

      if (!contract) {
        return;
      }

      // Fetch updated contract data
      const accountInfo = await this.connection.getAccountInfo(new PublicKey(contractAddress));
      if (!accountInfo) {
        return;
      }

      const contractData = this.deserializeContract(accountInfo.data);
      const newRecipient = contractData.recipient;
      const oldRecipient = contract.recipientAddress;

      // Record transfer
      await prisma.recipientTransfer.create({
        data: {
          contractId: contract.id,
          fromAddress: oldRecipient,
          toAddress: newRecipient,
          transferredBy: this.findSigner(tx),
          txSignature: signature,
          timestamp: new Date(tx.blockTime! * 1000),
        },
      });

      // Update contract
      await prisma.contract.update({
        where: { id: contract.id },
        data: { recipientAddress: newRecipient },
      });

      logger.info(`Recipient transferred for contract: ${contractAddress}`);
    } catch (error) {
      logger.error(error, 'Failed to handle TransferRecipient');
    }
  }

  private subscribeToLogs() {
    this.connection.onLogs(
      this.programId,
      async (logs, ctx) => {
        try {
          const signature = logs.signature;
          await this.processTransaction(signature);
        } catch (error) {
          logger.error(error, 'Error processing log subscription');
        }
      },
      'confirmed'
    );
  }

  private async getCheckpoint() {
    return prisma.indexerCheckpoint.findUnique({
      where: { name: CHECKPOINT_NAME },
    });
  }

  private async updateCheckpoint(slot: bigint, signature: string) {
    await prisma.indexerCheckpoint.upsert({
      where: { name: CHECKPOINT_NAME },
      create: { name: CHECKPOINT_NAME, lastSlot: slot, lastSignature: signature },
      update: { lastSlot: slot, lastSignature: signature },
    });
  }

  // Helper methods for parsing transaction data
  private findContractAccount(tx: ParsedTransactionWithMeta): string | null {
    // In production, this would properly parse the instruction accounts
    // For now, return a placeholder
    const accounts = tx.transaction.message.accountKeys;
    // Contract PDA is typically the first non-signer account after the sender
    for (const account of accounts) {
      if (!account.signer && !account.writable) {
        continue;
      }
      // Additional logic to identify the contract account
    }
    return accounts[2]?.pubkey.toBase58() || null;
  }

  private findSigner(tx: ParsedTransactionWithMeta): string {
    const accounts = tx.transaction.message.accountKeys;
    const signer = accounts.find(a => a.signer);
    return signer?.pubkey.toBase58() || '';
  }

  private parseWithdrawalAmount(tx: ParsedTransactionWithMeta, mint: string): string {
    const preBalances = tx.meta?.preTokenBalances || [];
    const postBalances = tx.meta?.postTokenBalances || [];

    for (const post of postBalances) {
      if (post.mint !== mint) continue;

      const pre = preBalances.find(p => 
        p.accountIndex === post.accountIndex && p.mint === mint
      );

      const preAmount = BigInt(pre?.uiTokenAmount?.amount || '0');
      const postAmount = BigInt(post.uiTokenAmount?.amount || '0');

      if (postAmount > preAmount) {
        return (postAmount - preAmount).toString();
      }
    }

    return '0';
  }

  private deserializeContract(data: Buffer): any {
    // Simplified deserialization - in production use proper Anchor deserialization
    // Skip 8-byte discriminator
    const offset = 8;

    return {
      version: data[offset],
      kind: data[offset + 1],
      state: data[offset + 2],
      bump: data[offset + 3],
      mint: new PublicKey(data.slice(offset + 4, offset + 36)).toBase58(),
      sender: new PublicKey(data.slice(offset + 36, offset + 68)).toBase58(),
      recipient: new PublicKey(data.slice(offset + 68, offset + 100)).toBase58(),
      escrowTokenAccount: new PublicKey(data.slice(offset + 100, offset + 132)).toBase58(),
      startTs: Number(data.readBigInt64LE(offset + 132)),
      endTs: Number(data.readBigInt64LE(offset + 140)),
      unlockIntervalSeconds: Number(data.readBigUInt64LE(offset + 148)),
      cliffAmount: data.readBigUInt64LE(offset + 156).toString(),
      totalAmount: data.readBigUInt64LE(offset + 164).toString(),
      withdrawnAmount: data.readBigUInt64LE(offset + 172).toString(),
      createdAt: Number(data.readBigInt64LE(offset + 180)),
      lastWithdrawnAt: Number(data.readBigInt64LE(offset + 188)),
      cancelableBy: data[offset + 196],
      transferableBy: data[offset + 197],
      pausable: data[offset + 198] === 1,
    };
  }

  private parsePermissionMode(value: number): PermissionMode {
    switch (value) {
      case 0: return PermissionMode.NEITHER;
      case 1: return PermissionMode.SENDER;
      case 2: return PermissionMode.RECIPIENT;
      case 3: return PermissionMode.BOTH;
      default: return PermissionMode.NEITHER;
    }
  }
}

