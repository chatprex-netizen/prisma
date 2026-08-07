import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const enumValues = ['WEB', 'PORTAL_INMOBILIARIO', 'REDES_SOCIALES', 'REFERIDO', 'EVENTO', 'CALL_CENTER', 'VISITA_OFICINA', 'OTRO'];

function mapSourceToDb(body: any) {
  if (body.source) {
    if (enumValues.includes(body.source)) {
      body.customSource = null;
    } else {
      body.customSource = body.source;
      body.source = 'OTRO';
    }
  }
}

function mapSourceFromDb(contact: any) {
  if (!contact) return contact;
  return {
    ...contact,
    source: contact.source === 'OTRO' && contact.customSource ? contact.customSource : contact.source
  };
}

// Get all contacts
router.get('/', async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        opportunities: { select: { id: true, stage: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: contacts.map(mapSourceFromDb) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new contact
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    if (!agentId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    mapSourceToDb(req.body);
    const { stage, ...contactData } = req.body;
    const contact = await prisma.contact.create({
      data: contactData
    });

    // Automatically create an opportunity in pipeline if the type is LEAD
    if (contact.type === 'LEAD') {
      let projectId: string | null = null;
      if (contact.interests && contact.interests.length > 0) {
        const proj = await prisma.project.findFirst({
          where: { name: contact.interests[0] }
        });
        if (proj) projectId = proj.id;
      }

      await prisma.opportunity.create({
        data: {
          contactId: contact.id,
          stage: stage || 'PROSPECCION',
          agentId: contact.assignedTo || agentId,
          projectId: projectId,
          notes: contact.notes,
          value: contact.budgetMin
        }
      });
    }

    res.status(201).json({ success: true, data: mapSourceFromDb(contact) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    mapSourceToDb(req.body);
    const { stage, ...contactData } = req.body;
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: contactData
    });

    if (stage) {
      const opp = await prisma.opportunity.findFirst({
        where: { contactId: contact.id }
      });
      if (opp) {
        await prisma.opportunity.update({
          where: { id: opp.id },
          data: { stage }
        });
      } else {
        await prisma.opportunity.create({
          data: {
            contactId: contact.id,
            stage,
            agentId: contact.assignedTo || '',
            value: contact.budgetMin
          }
        });
      }
    }

    res.json({ success: true, data: mapSourceFromDb(contact) });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.contact.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const DEFAULT_SOURCES = [
  { name: 'Redes Sociales', color: '#10b981' },
  { name: 'Portales Inmobiliarios', color: '#059669' },
  { name: 'Web Directa', color: '#047857' },
  { name: 'Referidos', color: '#065f46' },
  { name: 'Eventos / Feria', color: '#34d399' },
  { name: 'Call Center', color: '#3b82f6' },
  { name: 'Visita Oficina', color: '#8b5cf6' },
  { name: 'Otro', color: '#64748b' }
];

// Get Lead Sources Config
router.get('/sources', async (req: Request, res: Response) => {
  try {
    let configs = await prisma.leadSourceConfig.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (configs.length === 0) {
      await prisma.leadSourceConfig.createMany({
        data: DEFAULT_SOURCES
      });
      configs = await prisma.leadSourceConfig.findMany({
        orderBy: { createdAt: 'asc' }
      });
    }

    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Lead Source
router.post('/sources', async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;
    const newSource = await prisma.leadSourceConfig.create({
      data: { name, color }
    });
    res.status(201).json({ success: true, data: newSource });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Lead Source
router.put('/sources/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const updated = await prisma.leadSourceConfig.update({
      where: { id },
      data: { name, color }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Lead Source
router.delete('/sources/:id', async (req: Request, res: Response) => {
  try {
    await prisma.leadSourceConfig.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Source deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
