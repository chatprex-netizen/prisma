/**
 * WhatsApp Config Loader
 * Loads credentials from DB (SystemConfig) first, then falls back to .env vars.
 * This makes the configuration persist across restarts without redeploying.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let _cachedConfig: Record<string, string> | null = null;
let _cacheLoadedAt = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds cache

export async function getWhatsAppConfig(): Promise<{
  phoneNumberId: string;
  accessToken: string;
  webhookToken: string;
}> {
  const now = Date.now();

  // Use cache if still fresh
  if (_cachedConfig && now - _cacheLoadedAt < CACHE_TTL_MS) {
    return {
      phoneNumberId: _cachedConfig['WA_PHONE_NUMBER_ID'] || process.env.META_PHONE_NUMBER_ID || '',
      accessToken: _cachedConfig['WA_ACCESS_TOKEN'] || process.env.META_ACCESS_TOKEN || '',
      webhookToken: _cachedConfig['WA_WEBHOOK_TOKEN'] || process.env.META_WEBHOOK_VERIFY_TOKEN || '',
    };
  }

  try {
    const configs = await prisma.systemConfig.findMany({
      where: { key: { in: ['WA_PHONE_NUMBER_ID', 'WA_ACCESS_TOKEN', 'WA_WEBHOOK_TOKEN'] } }
    });

    const configMap: Record<string, string> = {};
    for (const cfg of configs) configMap[cfg.key] = cfg.value;

    _cachedConfig = configMap;
    _cacheLoadedAt = now;

    return {
      phoneNumberId: configMap['WA_PHONE_NUMBER_ID'] || process.env.META_PHONE_NUMBER_ID || '',
      accessToken: configMap['WA_ACCESS_TOKEN'] || process.env.META_ACCESS_TOKEN || '',
      webhookToken: configMap['WA_WEBHOOK_TOKEN'] || process.env.META_WEBHOOK_VERIFY_TOKEN || '',
    };
  } catch {
    // If DB not available, fall back to env vars
    return {
      phoneNumberId: process.env.META_PHONE_NUMBER_ID || '',
      accessToken: process.env.META_ACCESS_TOKEN || '',
      webhookToken: process.env.META_WEBHOOK_VERIFY_TOKEN || '',
    };
  }
}

/** Invalidate the cache so next call re-reads from DB (call after saving new credentials) */
export function invalidateWhatsAppConfigCache() {
  _cachedConfig = null;
  _cacheLoadedAt = 0;
}
