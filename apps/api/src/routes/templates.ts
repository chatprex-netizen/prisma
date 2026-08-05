import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/templates - List templates
router.get('/', async (req, res) => {
  try {
    const templates = await prisma.whatsAppTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/templates - Create a template
router.post('/', async (req, res) => {
  try {
    const { name, language, category, components, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        language: language || 'es',
        category: category || 'MARKETING',
        status: status || 'APPROVED',
        components: components || [],
      },
    });

    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/templates/seed - Seed default approved templates for demo
router.post('/seed', async (req, res) => {
  try {
    const defaultTemplates = [
      {
        name: 'hello_world',
        language: 'en_US',
        category: 'UTILITY' as const,
        status: 'APPROVED' as const,
        components: [
          { type: 'HEADER', format: 'TEXT', text: 'Welcome!' },
          { type: 'BODY', text: 'Hello World! Thank you for contacting Propify CRM.' }
        ]
      },
      {
        name: 'bienvenida_inmobiliaria',
        language: 'es',
        category: 'MARKETING' as const,
        status: 'APPROVED' as const,
        components: [
          { type: 'BODY', text: 'Hola {{1}}, gracias por tu interés en nuestro proyecto {{2}}. ¿Te gustaría agendar una visita guiada esta semana?' }
        ]
      },
      {
        name: 'promocion_lanzamiento',
        language: 'es',
        category: 'MARKETING' as const,
        status: 'APPROVED' as const,
        components: [
          { type: 'BODY', text: '¡Gran Oportunidad! Separación con descuento exclusivo en el proyecto {{1}}. Responde a este mensaje para enviarte el brochure.' }
        ]
      }
    ];

    for (const t of defaultTemplates) {
      await prisma.whatsAppTemplate.upsert({
        where: { name: t.name },
        update: {},
        create: t
      });
    }

    const templates = await prisma.whatsAppTemplate.findMany();
    res.json({ success: true, message: 'Plantillas creadas con éxito', data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
