import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all contracts
router.get('/', async (req: Request, res: Response) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        buyer: { select: { firstName: true, lastName: true } },
        property: { select: { title: true, unitCode: true } },
        agent: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: contracts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new contract
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    if (!agentId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    const { agentId: bodyAgentId, ...restOfData } = req.body;
    const finalAgentId = bodyAgentId || agentId;

    const contract = await prisma.contract.create({
      data: {
        ...restOfData,
        agentId: finalAgentId
      }
    });
    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update contract
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: contract });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete contract
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.contract.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
