import { Router } from 'express';
import { z } from 'zod';
import { prisma, logger } from '../index.js';
import { NotificationType, NotificationEvent } from '@prisma/client';

export const webhookRoutes = Router();

// Subscribe to notifications
webhookRoutes.post('/subscribe', async (req, res) => {
  try {
    const bodySchema = z.object({
      walletAddress: z.string(),
      type: z.nativeEnum(NotificationType),
      endpoint: z.string(), // Email or webhook URL
      contractAddresses: z.array(z.string()).optional(),
      eventTypes: z.array(z.nativeEnum(NotificationEvent)).optional(),
    });

    const body = bodySchema.parse(req.body);

    // Validate endpoint based on type
    if (body.type === NotificationType.EMAIL) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.endpoint)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
    } else if (body.type === NotificationType.WEBHOOK) {
      try {
        new URL(body.endpoint);
      } catch {
        return res.status(400).json({ error: 'Invalid webhook URL' });
      }
    }

    // Create or update subscription
    const subscription = await prisma.notificationSubscription.upsert({
      where: {
        walletAddress_type_endpoint: {
          walletAddress: body.walletAddress,
          type: body.type,
          endpoint: body.endpoint,
        },
      },
      create: {
        walletAddress: body.walletAddress,
        type: body.type,
        endpoint: body.endpoint,
        contractAddresses: body.contractAddresses || [],
        eventTypes: body.eventTypes || Object.values(NotificationEvent),
        active: true,
      },
      update: {
        contractAddresses: body.contractAddresses || [],
        eventTypes: body.eventTypes || Object.values(NotificationEvent),
        active: true,
      },
    });

    res.json({
      subscription: {
        id: subscription.id,
        type: subscription.type,
        endpoint: subscription.endpoint,
        eventTypes: subscription.eventTypes,
        active: subscription.active,
      },
    });
  } catch (error) {
    logger.error(error, 'Failed to create subscription');
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsubscribe from notifications
webhookRoutes.delete('/unsubscribe', async (req, res) => {
  try {
    const bodySchema = z.object({
      walletAddress: z.string(),
      type: z.nativeEnum(NotificationType),
      endpoint: z.string(),
    });

    const body = bodySchema.parse(req.body);

    await prisma.notificationSubscription.update({
      where: {
        walletAddress_type_endpoint: {
          walletAddress: body.walletAddress,
          type: body.type,
          endpoint: body.endpoint,
        },
      },
      data: { active: false },
    });

    res.json({ success: true });
  } catch (error) {
    logger.error(error, 'Failed to unsubscribe');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscriptions for a wallet
webhookRoutes.get('/subscriptions/:walletAddress', async (req, res) => {
  try {
    const subscriptions = await prisma.notificationSubscription.findMany({
      where: {
        walletAddress: req.params.walletAddress,
        active: true,
      },
      select: {
        id: true,
        type: true,
        endpoint: true,
        eventTypes: true,
        contractAddresses: true,
        createdAt: true,
      },
    });

    res.json({ subscriptions });
  } catch (error) {
    logger.error(error, 'Failed to fetch subscriptions');
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test webhook endpoint
webhookRoutes.post('/test', async (req, res) => {
  try {
    const bodySchema = z.object({
      webhookUrl: z.string().url(),
    });

    const body = bodySchema.parse(req.body);

    // Send test payload to webhook
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test notification from SolFlow',
      },
    };

    const response = await fetch(body.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    res.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (error) {
    logger.error(error, 'Failed to test webhook');
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Update subscription preferences
webhookRoutes.patch('/subscriptions/:id', async (req, res) => {
  try {
    const bodySchema = z.object({
      eventTypes: z.array(z.nativeEnum(NotificationEvent)).optional(),
      contractAddresses: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    });

    const body = bodySchema.parse(req.body);

    const subscription = await prisma.notificationSubscription.update({
      where: { id: req.params.id },
      data: body,
    });

    res.json({ subscription });
  } catch (error) {
    logger.error(error, 'Failed to update subscription');
    res.status(500).json({ error: 'Internal server error' });
  }
});

