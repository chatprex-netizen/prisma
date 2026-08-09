import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get activities for a specific contact or opportunity
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { contactId, opportunityId } = req.query;
    
    let whereClause: any = {};
    if (contactId) whereClause.contactId = String(contactId);
    if (opportunityId) whereClause.opportunityId = String(opportunityId);

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual activity creation (if needed by frontend directly)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'No autorizado' });
    }

    const activity = await prisma.activity.create({
      data: {
        ...req.body,
        userId
      }
    });
    res.status(201).json({ success: true, data: activity });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
