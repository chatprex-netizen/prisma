import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendWhatsAppMessage } from '../services/whatsapp';

const router = Router();
const prisma = new PrismaClient();

// ─── GET ALL CHATS ───
router.get('/', async (req: Request, res: Response) => {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, phone: true }
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
    res.json({ success: true, data: chats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET MESSAGES FOR A CHAT ───
router.get('/:chatId/messages', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { chatId: req.params.chatId },
      orderBy: { timestamp: 'asc' },
    });

    // Mark chat as read
    await prisma.chat.update({
      where: { id: req.params.chatId },
      data: { unreadCount: 0 },
    });

    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── SEND MESSAGE FROM CRM ───
router.post('/:chatId/send', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const chat = await prisma.chat.findUnique({
      where: { id: req.params.chatId },
    });

    if (!chat) {
      res.status(404).json({ success: false, error: 'Chat not found' });
      return;
    }

    // Send via Meta WhatsApp API
    const metaResponse = await sendWhatsAppMessage(chat.phoneNumber, text);

    // Save outgoing message in DB
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        wamid: metaResponse.messages[0].id,
        content: text,
        isFromUser: false,
        isFromBot: false,
        status: 'SENT',
      },
    });

    // Update chat last message
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        lastMessageAt: new Date(),
        // When agent sends, pause the bot
        isBotActive: false,
      },
    });

    res.json({ success: true, data: message });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── TOGGLE BOT FOR A CHAT ───
router.patch('/:chatId/bot', async (req: Request, res: Response) => {
  try {
    const { isBotActive } = req.body;
    const chat = await prisma.chat.update({
      where: { id: req.params.chatId },
      data: { isBotActive },
    });
    res.json({ success: true, data: chat });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
