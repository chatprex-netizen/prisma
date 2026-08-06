import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── PROJECTS ───

router.get('/projects', async (req: AuthRequest, res: Response) => {
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

router.post('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.create({ data: req.body });
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/projects/:id', async (req: AuthRequest, res: Response) => {
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

router.delete('/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ─── PROPERTIES ───

router.get('/properties', async (req: AuthRequest, res: Response) => {
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

router.post('/properties', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    if (!agentId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    const { unitCode, title, ...restOfData } = req.body;
    const property = await prisma.property.create({ 
      data: {
        ...restOfData,
        unitCode,
        title: title || unitCode, // Default title to unitCode if not provided
        agentId
      }
    });
    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /developers
router.get('/developers', async (req: Request, res: Response) => {
  try {
    let developers = await prisma.developer.findMany();
    if (developers.length === 0) {
      const defaultDev = await prisma.developer.create({
        data: {
          name: 'Desarrolladora General',
          logo: '',
          notes: 'Creado por defecto para albergar proyectos'
        }
      });
      developers = [defaultDev];
    }
    res.json({ success: true, data: developers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /developers
router.post('/developers', async (req: Request, res: Response) => {
  try {
    const developer = await prisma.developer.create({
      data: req.body
    });
    res.status(201).json({ success: true, data: developer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /developers/:id
router.put('/developers/:id', async (req: Request, res: Response) => {
  try {
    const developer = await prisma.developer.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: developer });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /developers/:id
router.delete('/developers/:id', async (req: Request, res: Response) => {
  try {
    await prisma.developer.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Developer deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
