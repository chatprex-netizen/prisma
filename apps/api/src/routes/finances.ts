import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        project: { select: { id: true, name: true } },
        property: { select: { id: true, unitCode: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create transaction
router.post('/', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.create({
      data: req.body
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
