import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all appointments
router.get('/', async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        contact: { select: { firstName: true, lastName: true } },
        project: { select: { name: true } },
        agent: { select: { firstName: true, lastName: true } }
      },
      orderBy: { startAt: 'asc' }
    });
    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new appointment
router.post('/', async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.create({ data: req.body });
    res.status(201).json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update appointment
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
