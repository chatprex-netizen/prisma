import { Router, Request, Response } from 'express';
import { verifyMetaWebhookSignature } from '../lib/whatsapp/webhook-signature';
import { processWebhook } from '../services/whatsapp';
import { getWhatsAppConfig } from '../lib/whatsapp/config-loader';

const router = Router();

// ─── META WEBHOOK VERIFICATION (GET) ───
router.get('/whatsapp', async (req: Request, res: Response) => {
  const { webhookToken } = await getWhatsAppConfig();
  const verifyToken = webhookToken || process.env.META_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// ─── INCOMING MESSAGES FROM WHATSAPP (POST) ───
router.post('/whatsapp', async (req: Request, res: Response) => {
  // Verify HMAC signature from Meta (if META_APP_SECRET is configured)
  if (process.env.META_APP_SECRET) {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    if (!verifyMetaWebhookSignature(rawBody, signature || null)) {
      console.warn('[webhook] Rejected request with invalid signature');
      res.sendStatus(401);
      return;
    }
  }

  // Always respond 200 quickly to Meta (they retry on slow acks)
  res.sendStatus(200);

  // Process webhook asynchronously
  try {
    await processWebhook(req.body);
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
});

export default router;
