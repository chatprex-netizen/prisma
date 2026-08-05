import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendTemplateMessage } from '../lib/whatsapp/meta-api';

const router = Router();
const prisma = new PrismaClient();

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '';

// GET /api/campaigns - List campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        template: true,
        recipients: {
          include: {
            contact: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: campaigns });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/campaigns/:id - Get campaign details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        recipients: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns - Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { name, templateId, contactIds, scheduledAt } = req.body;

    if (!name || !templateId || !contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({
        success: false,
        error: 'name, templateId and contactIds array are required',
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        templateId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'DRAFT',
        recipients: {
          create: contactIds.map((cId: string) => ({
            contactId: cId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        template: true,
        recipients: true,
      },
    });

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/campaigns/:id/send - Dispatch the campaign
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        recipients: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    // Update campaign status to RUNNING
    await prisma.campaign.update({
      where: { id },
      data: { status: 'RUNNING' },
    });

    // Process recipients
    let sentCount = 0;
    let failCount = 0;

    for (const recipient of campaign.recipients) {
      try {
        const phone = recipient.contact.phone.replace(/\D/g, '');
        
        // If Meta API credentials are properly set up
        if (ACCESS_TOKEN && PHONE_NUMBER_ID) {
          await sendTemplateMessage({
            phoneNumberId: PHONE_NUMBER_ID,
            accessToken: ACCESS_TOKEN,
            to: phone,
            templateName: campaign.template.name,
            language: campaign.template.language,
          });
        }

        // Update recipient status to SENT
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
        sentCount++;
      } catch (err: any) {
        failCount++;
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorReason: err.message,
          },
        });
      }
    }

    const finalStatus = failCount === campaign.recipients.length ? 'FAILED' : 'COMPLETED';

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
      },
      include: {
        template: true,
        recipients: true,
      },
    });

    res.json({
      success: true,
      message: `Campania ejecutada: ${sentCount} enviados, ${failCount} fallidos.`,
      data: updatedCampaign,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
