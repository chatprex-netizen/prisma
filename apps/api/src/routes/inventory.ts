import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ─── PROJECTS ───

router.get('/projects', async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: { developer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/projects', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/projects/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/projects/:id', async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── PROPERTIES ───

router.get('/properties', async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/properties', async (req: Request, res: Response) => {
  try {
    const property = await prisma.property.create({ data: req.body });
    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
