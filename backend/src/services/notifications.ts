import nodeCron from 'node-cron';
import { prisma, logger } from '../index.js';
import { config } from '../config.js';
import { NotificationType, NotificationEvent, NotificationStatus, ContractState } from '@prisma/client';

interface NotificationPayload {
  event: NotificationEvent;
  contractAddress?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export class NotificationService {
  private isRunning: boolean = false;

  async initialize() {
    this.isRunning = true;

    // Schedule unlock reminder check every hour
    nodeCron.schedule('0 * * * *', () => {
      this.checkUpcomingUnlocks();
    });

    logger.info('Notification service initialized');
  }

  async stop() {
    this.isRunning = false;
    logger.info('Notification service stopped');
  }

  // Send notification for a specific event
  async notify(payload: NotificationPayload) {
    try {
      // Find relevant subscriptions
      const subscriptions = await this.findSubscriptions(payload);

      for (const sub of subscriptions) {
        await this.sendNotification(sub, payload);
      }
    } catch (error) {
      logger.error(error, 'Failed to send notifications');
    }
  }

  // Notify about contract creation
  async notifyContractCreated(contract: any) {
    const payload: NotificationPayload = {
      event: NotificationEvent.CONTRACT_CREATED,
      contractAddress: contract.address,
      data: {
        kind: contract.kind,
        mint: contract.mintAddress,
        symbol: contract.tokenSymbol,
        amount: contract.totalAmount.toString(),
        sender: contract.senderAddress,
        recipient: contract.recipientAddress,
        endTs: contract.endTs,
      },
      timestamp: new Date(),
    };

    await this.notify(payload);
  }

  // Notify about token withdrawal
  async notifyTokensClaimed(contract: any, withdrawal: any) {
    const payload: NotificationPayload = {
      event: NotificationEvent.TOKENS_CLAIMED,
      contractAddress: contract.address,
      data: {
        amount: withdrawal.amount.toString(),
        totalWithdrawn: contract.withdrawnAmount.toString(),
        remaining: (contract.totalAmount - contract.withdrawnAmount).toString(),
        txSignature: withdrawal.txSignature,
      },
      timestamp: new Date(),
    };

    await this.notify(payload);
  }

  // Notify about contract cancellation
  async notifyContractCanceled(contract: any) {
    const payload: NotificationPayload = {
      event: NotificationEvent.CONTRACT_CANCELED,
      contractAddress: contract.address,
      data: {
        mint: contract.mintAddress,
        symbol: contract.tokenSymbol,
      },
      timestamp: new Date(),
    };

    await this.notify(payload);
  }

  // Notify about recipient transfer
  async notifyRecipientTransferred(contract: any, transfer: any) {
    const payload: NotificationPayload = {
      event: NotificationEvent.RECIPIENT_TRANSFERRED,
      contractAddress: contract.address,
      data: {
        fromAddress: transfer.fromAddress,
        toAddress: transfer.toAddress,
        transferredBy: transfer.transferredBy,
      },
      timestamp: new Date(),
    };

    await this.notify(payload);
  }

  // Notify about yield claimed
  async notifyYieldClaimed(contract: any, yieldBoost: any, amount: bigint) {
    const payload: NotificationPayload = {
      event: NotificationEvent.YIELD_CLAIMED,
      contractAddress: contract.address,
      data: {
        yieldClaimed: amount.toString(),
        totalYieldClaimed: yieldBoost.yieldClaimed.toString(),
      },
      timestamp: new Date(),
    };

    await this.notify(payload);
  }

  // Check for upcoming unlocks and send reminders
  private async checkUpcomingUnlocks() {
    try {
      // Find contracts unlocking in the next 24 hours
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingUnlocks = await prisma.contract.findMany({
        where: {
          state: ContractState.ACTIVE,
          endTs: {
            gte: now,
            lte: tomorrow,
          },
        },
      });

      for (const contract of upcomingUnlocks) {
        const payload: NotificationPayload = {
          event: NotificationEvent.UNLOCK_APPROACHING,
          contractAddress: contract.address,
          data: {
            mint: contract.mintAddress,
            symbol: contract.tokenSymbol,
            amount: contract.totalAmount.toString(),
            unlockTime: contract.endTs,
            recipient: contract.recipientAddress,
          },
          timestamp: new Date(),
        };

        await this.notify(payload);
      }

      // Find contracts with unlocked tokens that haven't been claimed
      const contractsWithUnlocked = await prisma.contract.findMany({
        where: {
          state: ContractState.ACTIVE,
          kind: 'VESTING',
        },
      });

      for (const contract of contractsWithUnlocked) {
        const claimable = this.calculateClaimable(contract);
        if (claimable > BigInt(0)) {
          const payload: NotificationPayload = {
            event: NotificationEvent.UNLOCK_AVAILABLE,
            contractAddress: contract.address,
            data: {
              mint: contract.mintAddress,
              symbol: contract.tokenSymbol,
              claimableAmount: claimable.toString(),
              recipient: contract.recipientAddress,
            },
            timestamp: new Date(),
          };

          await this.notify(payload);
        }
      }
    } catch (error) {
      logger.error(error, 'Failed to check upcoming unlocks');
    }
  }

  private async findSubscriptions(payload: NotificationPayload) {
    const where: any = {
      active: true,
      eventTypes: { has: payload.event },
    };

    // If contract-specific, also match contract subscriptions
    if (payload.contractAddress) {
      where.OR = [
        { contractAddresses: { isEmpty: true } }, // Subscribed to all
        { contractAddresses: { has: payload.contractAddress } },
      ];
    }

    return prisma.notificationSubscription.findMany({ where });
  }

  private async sendNotification(subscription: any, payload: NotificationPayload) {
    try {
      let success = false;

      switch (subscription.type) {
        case NotificationType.EMAIL:
          success = await this.sendEmail(subscription.endpoint, payload);
          break;
        case NotificationType.WEBHOOK:
          success = await this.sendWebhook(subscription.endpoint, payload);
          break;
        case NotificationType.TELEGRAM:
          success = await this.sendTelegram(subscription.endpoint, payload);
          break;
        case NotificationType.DISCORD:
          success = await this.sendDiscord(subscription.endpoint, payload);
          break;
      }

      // Log notification
      await prisma.notificationLog.create({
        data: {
          subscriptionId: subscription.id,
          eventType: payload.event,
          contractAddress: payload.contractAddress,
          payload: payload.data,
          status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        },
      });
    } catch (error) {
      logger.error(error, 'Failed to send notification');

      await prisma.notificationLog.create({
        data: {
          subscriptionId: subscription.id,
          eventType: payload.event,
          contractAddress: payload.contractAddress,
          payload: payload.data,
          status: NotificationStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  private async sendEmail(email: string, payload: NotificationPayload): Promise<boolean> {
    // In production, use nodemailer or similar
    logger.info(`Would send email to ${email}: ${payload.event}`);
    return true;
  }

  private async sendWebhook(url: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: payload.event,
          contractAddress: payload.contractAddress,
          data: payload.data,
          timestamp: payload.timestamp.toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error(error, `Webhook delivery failed: ${url}`);
      return false;
    }
  }

  private async sendTelegram(chatId: string, payload: NotificationPayload): Promise<boolean> {
    // In production, use Telegram Bot API
    logger.info(`Would send Telegram to ${chatId}: ${payload.event}`);
    return true;
  }

  private async sendDiscord(webhookUrl: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const embed = {
        title: this.getEventTitle(payload.event),
        description: this.getEventDescription(payload),
        color: this.getEventColor(payload.event),
        timestamp: payload.timestamp.toISOString(),
        footer: {
          text: 'SolFlow',
        },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] }),
      });

      return response.ok;
    } catch (error) {
      logger.error(error, `Discord webhook failed: ${webhookUrl}`);
      return false;
    }
  }

  private getEventTitle(event: NotificationEvent): string {
    switch (event) {
      case NotificationEvent.CONTRACT_CREATED:
        return '🔒 New Lock/Vesting Created';
      case NotificationEvent.UNLOCK_APPROACHING:
        return '⏰ Unlock Approaching';
      case NotificationEvent.UNLOCK_AVAILABLE:
        return '🔓 Tokens Available to Claim';
      case NotificationEvent.TOKENS_CLAIMED:
        return '✅ Tokens Claimed';
      case NotificationEvent.CONTRACT_CANCELED:
        return '❌ Contract Canceled';
      case NotificationEvent.RECIPIENT_TRANSFERRED:
        return '🔄 Recipient Changed';
      case NotificationEvent.YIELD_CLAIMED:
        return '💰 Yield Claimed';
      default:
        return 'Notification';
    }
  }

  private getEventDescription(payload: NotificationPayload): string {
    const { event, contractAddress, data } = payload;

    switch (event) {
      case NotificationEvent.CONTRACT_CREATED:
        return `A new ${data.kind?.toLowerCase()} contract was created for ${data.amount} ${data.symbol || 'tokens'}`;
      case NotificationEvent.UNLOCK_APPROACHING:
        return `Your lock will unlock soon! ${data.amount} ${data.symbol || 'tokens'} will be available.`;
      case NotificationEvent.UNLOCK_AVAILABLE:
        return `${data.claimableAmount} ${data.symbol || 'tokens'} are available to claim.`;
      case NotificationEvent.TOKENS_CLAIMED:
        return `${data.amount} ${data.symbol || 'tokens'} have been claimed. Remaining: ${data.remaining}`;
      case NotificationEvent.CONTRACT_CANCELED:
        return `The contract has been canceled.`;
      case NotificationEvent.RECIPIENT_TRANSFERRED:
        return `Recipient changed from ${data.fromAddress?.slice(0, 8)}... to ${data.toAddress?.slice(0, 8)}...`;
      case NotificationEvent.YIELD_CLAIMED:
        return `${data.yieldClaimed} lamports of yield have been claimed.`;
      default:
        return `Contract: ${contractAddress}`;
    }
  }

  private getEventColor(event: NotificationEvent): number {
    switch (event) {
      case NotificationEvent.CONTRACT_CREATED:
        return 0x00ff00; // Green
      case NotificationEvent.UNLOCK_APPROACHING:
        return 0xffff00; // Yellow
      case NotificationEvent.UNLOCK_AVAILABLE:
        return 0x00ffff; // Cyan
      case NotificationEvent.TOKENS_CLAIMED:
        return 0x00ff00; // Green
      case NotificationEvent.CONTRACT_CANCELED:
        return 0xff0000; // Red
      case NotificationEvent.RECIPIENT_TRANSFERRED:
        return 0xffa500; // Orange
      case NotificationEvent.YIELD_CLAIMED:
        return 0x9900ff; // Purple
      default:
        return 0x808080; // Gray
    }
  }

  private calculateClaimable(contract: any): bigint {
    const now = Date.now();
    const startTs = new Date(contract.startTs).getTime();
    const endTs = new Date(contract.endTs).getTime();

    if (now < startTs) return BigInt(0);
    if (now >= endTs) return contract.totalAmount - contract.withdrawnAmount;

    if (contract.kind === 'LOCK') return BigInt(0);

    const intervalMs = contract.unlockIntervalSeconds * 1000;
    if (intervalMs === 0) return BigInt(0);

    const elapsed = now - startTs;
    const totalDuration = endTs - startTs;
    const elapsedIntervals = Math.floor(elapsed / intervalMs);
    const totalIntervals = Math.floor(totalDuration / intervalMs);

    if (totalIntervals === 0) return BigInt(0);

    const baseAmount = contract.totalAmount - contract.cliffAmount;
    const vestedBase = (baseAmount * BigInt(elapsedIntervals)) / BigInt(totalIntervals);
    const cliff = elapsedIntervals > 0 ? contract.cliffAmount : BigInt(0);

    return vestedBase + cliff - contract.withdrawnAmount;
  }
}

