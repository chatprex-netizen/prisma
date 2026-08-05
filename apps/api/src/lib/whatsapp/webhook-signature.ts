import crypto from 'crypto';

/**
 * Verify the HMAC-SHA256 signature Meta attaches to webhook POSTs.
 * Without verification, anyone who knows the webhook URL can POST
 * fabricated messages.
 */
export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    console.error(
      '[webhook] META_APP_SECRET is not set — rejecting request. ' +
        'Configure the env var to enable signature verification.',
    );
    return false;
  }

  if (!signatureHeader) return false;
  if (!signatureHeader.startsWith('sha256=')) return false;

  const expected =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
