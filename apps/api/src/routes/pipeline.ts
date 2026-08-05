import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get Pipeline Opportunities
router.get('/', async (req: Request, res: Response) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, phone: true } },
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

// Update Stage
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

export default router;
