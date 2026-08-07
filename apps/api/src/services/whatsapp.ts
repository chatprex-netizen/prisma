import { PrismaClient } from '@prisma/client';
import { sendTextMessage } from '../lib/whatsapp/meta-api';
import { normalizePhone } from '../lib/whatsapp/phone-utils';
import { generateAIResponse } from './ai';
import { getWhatsAppConfig } from '../lib/whatsapp/config-loader';

const prisma = new PrismaClient();

// ─── TIPOS ───
interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  video?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; mime_type: string; filename?: string; caption?: string };
  audio?: { id: string; mime_type: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: { name: string };
        wa_id: string;
      }>;
      messages?: WhatsAppMessage[];
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
      }>;
    };
    field: string;
  }>;
}

// ─── ENVIAR MENSAJE ───
export async function sendWhatsAppMessage(to: string, text: string) {
  try {
    const { phoneNumberId, accessToken } = await getWhatsAppConfig();
    const result = await sendTextMessage({
      phoneNumberId,
      accessToken,
      to: normalizePhone(to),
      text,
    });
    return { messages: [{ id: result.messageId }] };
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error.message);
    throw error;
  }
}

// ─── PROCESAR WEBHOOK COMPLETO ───
export async function processWebhook(body: { entry?: WhatsAppWebhookEntry[] }) {
  if (!body.entry) return;

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // Handle status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          await handleStatusUpdate(status);
        }
      }

      // Handle incoming messages
      if (!value.messages || !value.contacts) continue;

      for (let i = 0; i < value.messages.length; i++) {
        const message = value.messages[i];
        const contact = value.contacts[i] || value.contacts[0];

        await handleIncomingMessage({
          from: message.from,
          text: message.text?.body,
          wamid: message.id,
          type: message.type,
          contactName: contact.profile.name,
          image: message.image,
          audio: message.audio,
          video: message.video,
          document: message.document,
          location: message.location,
        });
      }
    }
  }
}

// ─── STATUS UPDATES ───
async function handleStatusUpdate(status: {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}) {
  try {
    // Map Meta statuses to our enum
    const statusMap: Record<string, string> = {
      sent: 'SENT',
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED',
    };

    const mappedStatus = statusMap[status.status];
    if (!mappedStatus) return;

    await prisma.message.updateMany({
      where: { wamid: status.id },
      data: { status: mappedStatus as any },
    });
  } catch (error) {
    console.error('Error updating message status:', error);
  }
}

// ─── PARSEAR CONTENIDO DEL MENSAJE ───
function parseMessageContent(message: Partial<WhatsAppMessage> & { type: string }): {
  contentText: string | null;
  messageType: string;
} {
  switch (message.type) {
    case 'text':
      return { contentText: message.text?.body || null, messageType: 'TEXT' };
    case 'image':
      return { contentText: message.image?.caption || '[Imagen]', messageType: 'IMAGE' };
    case 'video':
      return { contentText: message.video?.caption || '[Video]', messageType: 'VIDEO' };
    case 'audio':
      return { contentText: '[Audio]', messageType: 'AUDIO' };
    case 'document':
      return { contentText: message.document?.filename || '[Documento]', messageType: 'DOCUMENT' };
    case 'location':
      if (message.location) {
        const loc = message.location;
        return {
          contentText: [loc.name, loc.address, `${loc.latitude},${loc.longitude}`].filter(Boolean).join(' - '),
          messageType: 'TEXT',
        };
      }
      return { contentText: '[Ubicación]', messageType: 'TEXT' };
    default:
      return { contentText: `[${message.type}]`, messageType: 'TEXT' };
  }
}

// ─── MANEJAR MENSAJE ENTRANTE ───
export async function handleIncomingMessage(data: {
  from: string;
  text?: string;
  wamid: string;
  type?: string;
  contactName?: string;
  image?: any;
  audio?: any;
  video?: any;
  document?: any;
  location?: any;
}) {
  const { from, wamid, contactName } = data;
  const phoneNormalized = normalizePhone(from);

  // 1. Parse message content
  const { contentText, messageType } = parseMessageContent({
    type: data.type || 'text',
    text: data.text ? { body: data.text } : undefined,
    image: data.image,
    audio: data.audio,
    video: data.video,
    document: data.document,
    location: data.location,
  });

  // 2. Find or create Chat
  let chat = await prisma.chat.findUnique({ where: { phoneNumber: phoneNormalized } });

  if (!chat) {
    // Try to link with existing contact by phone
    const existingContact = await prisma.contact.findFirst({
      where: { phone: phoneNormalized },
    });

    chat = await prisma.chat.create({
      data: {
        phoneNumber: phoneNormalized,
        contactId: existingContact?.id || null,
      },
    });

    // If no contact exists, auto-create one from WhatsApp profile name as a LEAD
    if (!existingContact && contactName) {
      const nameParts = contactName.split(' ');
      const defaultAgent = await prisma.user.findFirst();
      const agentId = defaultAgent?.id;

      const newContact = await prisma.contact.create({
        data: {
          firstName: nameParts[0] || contactName,
          lastName: nameParts.slice(1).join(' ') || '',
          phone: phoneNormalized,
          type: 'LEAD',
          source: 'OTRO',
          customSource: 'WhatsApp',
          assignedTo: agentId,
        },
      });

      // Auto-create pipeline opportunity so they appear in the Kanban board immediately
      if (agentId) {
        await prisma.opportunity.create({
          data: {
            contactId: newContact.id,
            stage: 'PROSPECCION',
            agentId: agentId,
            notes: 'Lead registrado automáticamente tras recibir mensaje inicial de WhatsApp',
          }
        });
      }

      // Link the chat to the new contact
      await prisma.chat.update({
        where: { id: chat.id },
        data: { contactId: newContact.id },
      });
    }
  }

  // 3. Save incoming message
  await prisma.message.create({
    data: {
      chatId: chat.id,
      wamid,
      content: contentText,
      type: messageType as any,
      isFromUser: true,
      isFromBot: false,
    },
  });

  // 4. Update chat
  await prisma.chat.update({
    where: { id: chat.id },
    data: {
      unreadCount: { increment: 1 },
      lastMessageAt: new Date(),
    },
  });

  // 5. AI Auto-reply (if bot is active and message is text)
  if (chat.isBotActive && data.type === 'text' && contentText) {
    const assistant = await prisma.aIAssistant.findFirst({
      where: { isActive: true },
    });

    if (assistant) {
      try {
        const aiResponseText = await generateAIResponse(contentText, assistant, chat.id);

        if (aiResponseText) {
          const metaResponse = await sendWhatsAppMessage(from, aiResponseText);

          await prisma.message.create({
            data: {
              chatId: chat.id,
              wamid: metaResponse.messages[0].id,
              content: aiResponseText,
              isFromUser: false,
              isFromBot: true,
            },
          });
        }
      } catch (error) {
        console.error('Error in AI auto-reply:', error);
      }
    }
  }
}
