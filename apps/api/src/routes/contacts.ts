import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all contacts
router.get('/', async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: contacts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.create({
      data: req.body
    });
    res.status(201).json({ success: true, data: contact });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.contact.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: contact });
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

export default router;
