import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Program IDs
export const MEMELOCK_CORE_PROGRAM_ID = new PublicKey('Mem1ockCorexxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
export const MEMELOCK_YIELD_BOOST_PROGRAM_ID = new PublicKey('Mem1ockYie1dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

// Constants
export const WITHDRAW_MAX = new BN('18446744073709551615'); // u64::MAX

// Permission modes
export enum PermissionMode {
  Neither = 0,
  Sender = 1,
  Recipient = 2,
  Both = 3,
}

// Contract types
export enum ContractKind {
  Lock = 0,
  Vesting = 1,
}

// Contract state
export enum ContractState {
  Scheduled = 0,
  Active = 1,
  Paused = 2,
  Completed = 3,
  Canceled = 4,
}

// Yield boost state
export enum YieldBoostState {
  Pending = 0,
  Active = 1,
  Claimed = 2,
  Closed = 3,
  Canceled = 4,
}

// Types
export interface CreateLockParams {
  amount: BN;
  recipient: PublicKey;
  unlockTs: BN;
  cancelableBy: PermissionMode;
  transferableBy: PermissionMode;
  nonce: number[];
  title?: string;
  memo?: string;
}

export interface CreateVestingParams {
  amount: BN;
  recipient: PublicKey;
  startTs: BN;
  endTs: BN;
  unlockIntervalSeconds: BN;
  cliffAmount: BN;
  cancelableBy: PermissionMode;
  transferableBy: PermissionMode;
  pausable: boolean;
  nonce: number[];
  title?: string;
  memo?: string;
}

export interface ContractAccount {
  version: number;
  kind: ContractKind;
  state: ContractState;
  bump: number;
  mint: PublicKey;
  sender: PublicKey;
  recipient: PublicKey;
  escrowTokenAccount: PublicKey;
  startTs: BN;
  endTs: BN;
  unlockIntervalSeconds: BN;
  cliffAmount: BN;
  totalAmount: BN;
  withdrawnAmount: BN;
  createdAt: BN;
  lastWithdrawnAt: BN;
  cancelableBy: PermissionMode;
  transferableBy: PermissionMode;
  pausable: boolean;
  pausedAt: BN;
  totalPausedDuration: BN;
  yieldBoostEnabled: boolean;
  yieldBoostAccount: PublicKey;
  autoClaimEnabled: boolean;
}

/**
 * SolFlow SDK Client
 */
export class SolFlowClient {
  private connection: Connection;
  private provider: AnchorProvider;
  private coreProgram: Program;
  private yieldBoostProgram: Program | null = null;

  constructor(
    connection: Connection,
    wallet: Keypair | any, // Anchor wallet type
    coreIdl: Idl,
    yieldBoostIdl?: Idl
  ) {
    this.connection = connection;
    this.provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    this.coreProgram = new Program(coreIdl, MEMELOCK_CORE_PROGRAM_ID, this.provider);
    if (yieldBoostIdl) {
      this.yieldBoostProgram = new Program(yieldBoostIdl, MEMELOCK_YIELD_BOOST_PROGRAM_ID, this.provider);
    }
  }

  /**
   * Get contract PDA
   */
  async getContractPda(
    sender: PublicKey,
    mint: PublicKey,
    nonce: number[]
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('contract'),
        sender.toBuffer(),
        mint.toBuffer(),
        Buffer.from(nonce),
      ],
      MEMELOCK_CORE_PROGRAM_ID
    );
  }

  /**
   * Get escrow token account PDA
   */
  async getEscrowPda(contract: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), contract.toBuffer()],
      MEMELOCK_CORE_PROGRAM_ID
    );
  }

  /**
   * Get config PDA
   */
  async getConfigPda(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      MEMELOCK_CORE_PROGRAM_ID
    );
  }

  /**
   * Create a token lock
   */
  async createLock(params: CreateLockParams, mint: PublicKey): Promise<string> {
    const sender = this.provider.wallet.publicKey;
    const [contractPda] = await this.getContractPda(sender, mint, params.nonce);
    const [configPda] = await this.getConfigPda();
    
    const senderAta = await getAssociatedTokenAddress(mint, sender);
    const escrowAta = await getAssociatedTokenAddress(mint, contractPda, true);
    
    // Get config for treasury
    const config = await this.coreProgram.account.config.fetch(configPda);
    
    const tx = await this.coreProgram.methods
      .createLock({
        amount: params.amount,
        recipient: params.recipient,
        unlockTs: params.unlockTs,
        cancelableBy: params.cancelableBy,
        transferableBy: params.transferableBy,
        nonce: params.nonce,
        title: params.title || null,
        memo: params.memo || null,
      })
      .accounts({
        sender,
        mint,
        senderTokenAccount: senderAta,
        contract: contractPda,
        escrowTokenAccount: escrowAta,
        config: configPda,
        treasury: config.treasury,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Create a vesting schedule
   */
  async createVesting(params: CreateVestingParams, mint: PublicKey): Promise<string> {
    const sender = this.provider.wallet.publicKey;
    const [contractPda] = await this.getContractPda(sender, mint, params.nonce);
    const [configPda] = await this.getConfigPda();
    
    const senderAta = await getAssociatedTokenAddress(mint, sender);
    const escrowAta = await getAssociatedTokenAddress(mint, contractPda, true);
    
    const config = await this.coreProgram.account.config.fetch(configPda);
    
    const tx = await this.coreProgram.methods
      .createVesting({
        amount: params.amount,
        recipient: params.recipient,
        startTs: params.startTs,
        endTs: params.endTs,
        unlockIntervalSeconds: params.unlockIntervalSeconds,
        cliffAmount: params.cliffAmount,
        cancelableBy: params.cancelableBy,
        transferableBy: params.transferableBy,
        pausable: params.pausable,
        nonce: params.nonce,
        title: params.title || null,
        memo: params.memo || null,
      })
      .accounts({
        sender,
        mint,
        senderTokenAccount: senderAta,
        contract: contractPda,
        escrowTokenAccount: escrowAta,
        config: configPda,
        treasury: config.treasury,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Withdraw unlocked tokens
   */
  async withdraw(contract: PublicKey, amount: BN): Promise<string> {
    const contractAccount = await this.coreProgram.account.contract.fetch(contract);
    const recipient = this.provider.wallet.publicKey;
    
    const recipientAta = await getAssociatedTokenAddress(contractAccount.mint, recipient);
    
    const tx = await this.coreProgram.methods
      .withdraw(amount)
      .accounts({
        recipient,
        mint: contractAccount.mint,
        contract,
        escrowTokenAccount: contractAccount.escrowTokenAccount,
        recipientTokenAccount: recipientAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Withdraw all unlocked tokens
   */
  async withdrawAll(contract: PublicKey): Promise<string> {
    return this.withdraw(contract, WITHDRAW_MAX);
  }

  /**
   * Cancel a contract
   */
  async cancel(contract: PublicKey): Promise<string> {
    const contractAccount = await this.coreProgram.account.contract.fetch(contract);
    const signer = this.provider.wallet.publicKey;
    
    const senderAta = await getAssociatedTokenAddress(
      contractAccount.mint,
      contractAccount.sender
    );
    const recipientAta = await getAssociatedTokenAddress(
      contractAccount.mint,
      contractAccount.recipient
    );
    
    const tx = await this.coreProgram.methods
      .cancel()
      .accounts({
        signer,
        mint: contractAccount.mint,
        contract,
        escrowTokenAccount: contractAccount.escrowTokenAccount,
        senderTokenAccount: senderAta,
        recipientTokenAccount: recipientAta,
        sender: contractAccount.sender,
        recipient: contractAccount.recipient,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Transfer recipient
   */
  async transferRecipient(contract: PublicKey, newRecipient: PublicKey): Promise<string> {
    const tx = await this.coreProgram.methods
      .transferRecipient()
      .accounts({
        signer: this.provider.wallet.publicKey,
        contract,
        newRecipient,
      })
      .rpc();

    return tx;
  }

  /**
   * Fetch contract account
   */
  async getContract(contract: PublicKey): Promise<ContractAccount> {
    return this.coreProgram.account.contract.fetch(contract) as Promise<ContractAccount>;
  }

  /**
   * Calculate unlocked amount
   */
  calculateUnlocked(contract: ContractAccount, now: number = Date.now() / 1000): BN {
    const startTs = contract.startTs.toNumber();
    const endTs = contract.endTs.toNumber();

    if (now < startTs) {
      return new BN(0);
    }

    if (now >= endTs) {
      return contract.totalAmount;
    }

    if (contract.kind === ContractKind.Lock) {
      return new BN(0);
    }

    // Vesting calculation
    const intervalSeconds = contract.unlockIntervalSeconds.toNumber();
    if (intervalSeconds === 0) {
      return new BN(0);
    }

    const elapsed = now - startTs;
    const totalDuration = endTs - startTs;

    const elapsedIntervals = Math.floor(elapsed / intervalSeconds);
    const totalIntervals = Math.floor(totalDuration / intervalSeconds);

    if (totalIntervals === 0) {
      return new BN(0);
    }

    const baseAmount = contract.totalAmount.sub(contract.cliffAmount);
    const vestedBase = baseAmount.muln(elapsedIntervals).divn(totalIntervals);
    const cliff = elapsedIntervals > 0 ? contract.cliffAmount : new BN(0);

    return vestedBase.add(cliff);
  }

  /**
   * Calculate claimable amount
   */
  calculateClaimable(contract: ContractAccount, now: number = Date.now() / 1000): BN {
    return this.calculateUnlocked(contract, now).sub(contract.withdrawnAmount);
  }
}

export default SolFlowClient;

