import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all clients
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const clients = await prisma.contact.findMany({
      where: { type: 'CLIENTE' },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Error fetching clients' });
  }
});

// Get client by ID
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const client = await prisma.contact.findUnique({
      where: { id, type: 'CLIENTE' },
      include: {
        buyerContracts: true,
        sellerContracts: true,
        incomes: true,
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Error fetching client' });
  }
});

// Update client
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const client = await prisma.contact.update({
      where: { id },
      data: updateData,
    });
    res.json(client);
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Error updating client' });
  }
});

export default router;
