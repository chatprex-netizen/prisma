import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { invalidateWhatsAppConfigCache } from '../lib/whatsapp/config-loader';

const router = Router();
const prisma = new PrismaClient();

const WA_KEYS = ['WA_PHONE_NUMBER_ID', 'WA_WABA_ID', 'WA_ACCESS_TOKEN', 'WA_WEBHOOK_TOKEN', 'WA_PIN'];

// GET /api/settings/whatsapp - Retrieve saved WhatsApp config (masks the token)
router.get('/whatsapp', async (req: Request, res: Response) => {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: WA_KEYS } }
    });

    const result: Record<string, string> = {};
    for (const cfg of configs) {
      // Mask the access token for security
      if (cfg.key === 'WA_ACCESS_TOKEN' && cfg.value) {
        result[cfg.key] = cfg.value.substring(0, 8) + '••••••••••••••••';
      } else {
        result[cfg.key] = cfg.value;
      }
    }

    const isConfigured = configs.some((c: { key: string; value: string }) => c.key === 'WA_ACCESS_TOKEN' && c.value);
    res.json({ success: true, data: result, isConfigured });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/whatsapp - Save WhatsApp credentials to DB
router.post('/whatsapp', async (req: Request, res: Response) => {
  try {
    const { phoneNumberId, wabaId, accessToken, webhookToken, pin } = req.body;

    if (!phoneNumberId || !wabaId || !accessToken || !webhookToken) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumberId, wabaId, accessToken y webhookToken son obligatorios'
      });
    }

    // Upsert all credentials
    const configEntries = [
      { key: 'WA_PHONE_NUMBER_ID', value: phoneNumberId },
      { key: 'WA_WABA_ID', value: wabaId },
      { key: 'WA_ACCESS_TOKEN', value: accessToken },
      { key: 'WA_WEBHOOK_TOKEN', value: webhookToken },
      { key: 'WA_PIN', value: pin || '' },
    ];

    for (const entry of configEntries) {
      await prisma.systemConfig.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: { key: entry.key, value: entry.value }
      });
    }

    // Invalidate in-memory cache so next send uses new credentials
    invalidateWhatsAppConfigCache();

    res.json({ success: true, message: 'Credenciales de WhatsApp guardadas exitosamente.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/settings/whatsapp/test - Test the connection with Meta API
router.post('/whatsapp/test', async (req: Request, res: Response) => {
  try {
    // Get stored credentials
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: ['WA_PHONE_NUMBER_ID', 'WA_ACCESS_TOKEN'] } }
    });

    const configMap: Record<string, string> = {};
    for (const cfg of configs) configMap[cfg.key] = cfg.value;

    const phoneNumberId = configMap['WA_PHONE_NUMBER_ID'] || process.env.META_PHONE_NUMBER_ID;
    const accessToken = configMap['WA_ACCESS_TOKEN'] || process.env.META_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'No hay credenciales configuradas. Guarda primero las credenciales de WhatsApp.'
      });
    }

    // Test call to Meta API — get phone number info
    const testUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating&access_token=${accessToken}`;

    const response = await fetch(testUrl);
    const data = await response.json() as any;

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: data?.error?.message || 'Error al conectar con Meta API',
        details: data?.error
      });
    }

    res.json({
      success: true,
      message: '✅ Conexión exitosa con WhatsApp Business API',
      phoneNumber: data.display_phone_number,
      businessName: data.verified_name,
      qualityRating: data.quality_rating
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
