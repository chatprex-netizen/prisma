import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const DEFAULT_STAGES = [
  { key: 'PROSPECCION', name: 'Prospección', details: 'Leads nuevos por contactar', color: '#00f2fe', isVisible: true, order: 0 },
  { key: 'CALIFICACION', name: 'Calificación', details: 'Filtro y perfilamiento', color: '#38ef7d', isVisible: true, order: 1 },
  { key: 'VISITA', name: 'Visita', details: 'Visitas agendadas y guiadas', color: '#ff007f', isVisible: true, order: 2 },
  { key: 'PROPUESTA', name: 'Propuesta', details: 'Oferta comercial presentada', color: '#7f00ff', isVisible: true, order: 3 },
  { key: 'NEGOCIACION', name: 'Negociación', details: 'Trato y firmas finales', color: '#ff9900', isVisible: true, order: 4 },
  { key: 'CIERRE_GANADO', name: 'Ganado', details: 'Contrato firmado y pagado', color: '#10b981', isVisible: false, order: 5 },
  { key: 'CIERRE_PERDIDO', name: 'Perdido', details: 'Oportunidad descartada', color: '#ef4444', isVisible: false, order: 6 },
];

// Get Pipeline Opportunities
router.get('/', async (req: Request, res: Response) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, currency: true, budgetMin: true } },
        property: { select: { id: true, unitCode: true, title: true } },
        project: { select: { id: true, name: true } },
        agent: { select: { id: true, firstName: true, lastName: true, avatar: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: opportunities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Pipeline Stages Config
router.get('/stages', async (req: Request, res: Response) => {
  try {
    let configs = await prisma.pipelineStageConfig.findMany({
      orderBy: { order: 'asc' }
    });

    if (configs.length === 0) {
      await prisma.pipelineStageConfig.createMany({
        data: DEFAULT_STAGES
      });
      configs = await prisma.pipelineStageConfig.findMany({
        orderBy: { order: 'asc' }
      });
    }

    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Stage Config
router.put('/stages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, details, color, isVisible, order } = req.body;
    const updated = await prisma.pipelineStageConfig.update({
      where: { id },
      data: {
        name,
        details,
        color,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
        order: order !== undefined ? Number(order) : undefined
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Stage of an Opportunity
router.patch('/:id/stage', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const updated = await prisma.opportunity.update({
      where: { id },
      data: { stage }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Opportunity
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.opportunity.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
