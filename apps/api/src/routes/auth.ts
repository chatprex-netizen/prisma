import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// REGISTRO
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: error?.message || 'Error en el servidor al registrar usuario' });
  }
});

// LOGIN
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error?.message || 'Error en el servidor al iniciar sesión' });
  }
});

// GET ME
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// OBTENER TODOS LOS USUARIOS (con opción ?all=true)
router.get('/users', authenticate, async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    const whereClause = all === 'true' ? {} : { isActive: true };
    const selectClause = all === 'true'
      ? {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        }
      : {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: selectClause,
      orderBy: { firstName: 'asc' }
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREAR USUARIO (Administrativo)
router.post('/users', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'GERENTE_COMERCIAL') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { email, password, firstName, lastName, phone, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// EDITAR USUARIO (Administrativo)
router.put('/users/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'GERENTE_COMERCIAL') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { id } = req.params;
    const { email, firstName, lastName, phone, role, isActive, password } = req.body;

    const updateData: any = {
      email,
      firstName,
      lastName,
      phone,
      role,
      isActive
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ELIMINAR USUARIO (Administrativo)
router.delete('/users/:id', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'GERENTE_COMERCIAL') {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { id } = req.params;

    if (id === req.user?.id) {
      return res.status(400).json({ success: false, message: 'No puedes eliminar tu propio usuario' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
