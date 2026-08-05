/**
 * Meta WhatsApp Cloud API — Core functions for sending messages.
 * Adapted from wacrm for use with Prisma + Express.
 */

const META_API_VERSION = 'v21.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaSendResult {
  messageId: string;
}

/**
 * Send a text message via Meta WhatsApp Cloud API.
 */
export async function sendTextMessage(opts: {
  phoneNumberId: string;
  accessToken: string;
  to: string; // recipient phone (digits only)
  text: string;
}): Promise<MetaSendResult> {
  const { phoneNumberId, accessToken, to, text } = opts;
  const url = `${META_API_BASE}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      (data as any)?.error?.message || `Meta API error: ${response.status}`
    );
  }

  const data = await response.json();
  return { messageId: data.messages?.[0]?.id || '' };
}

/**
 * Send a template message via Meta WhatsApp Cloud API.
 */
export async function sendTemplateMessage(opts: {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  templateName: string;
  language: string;
  components?: any[];
}): Promise<MetaSendResult> {
  const { phoneNumberId, accessToken, to, templateName, language, components } = opts;
  const url = `${META_API_BASE}/${phoneNumberId}/messages`;

  const body: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
    },
  };

  if (components && components.length > 0) {
    body.template.components = components;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      (data as any)?.error?.message || `Meta API error: ${response.status}`
    );
  }

  const data = await response.json();
  return { messageId: data.messages?.[0]?.id || '' };
}

/**
 * Mark a message as read (blue ticks).
 */
export async function markMessageAsRead(opts: {
  phoneNumberId: string;
  accessToken: string;
  messageId: string;
}): Promise<void> {
  const { phoneNumberId, accessToken, messageId } = opts;
  const url = `${META_API_BASE}/${phoneNumberId}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

/**
 * Get media URL from Meta (for downloading received media).
 */
export async function getMediaUrl(opts: {
  mediaId: string;
  accessToken: string;
}): Promise<string> {
  const { mediaId, accessToken } = opts;
  const url = `${META_API_BASE}/${mediaId}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to get media URL: ${response.status}`);
  }

  const data = await response.json();
  return data.url;
}

/**
 * Download media binary from Meta's CDN.
 */
export async function downloadMedia(opts: {
  mediaUrl: string;
  accessToken: string;
}): Promise<Buffer> {
  const { mediaUrl, accessToken } = opts;

  const response = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
