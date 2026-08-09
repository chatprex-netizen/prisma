import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const DEFAULT_STAGES = [
  { key: 'PROSPECCION', name: 'Prospección', details: 'Leads nuevos por contactar', color: '#00f2fe', isVisible: true, order: 0 },
  { key: 'CALIFICACION', name: 'Calificación', details: 'Filtro y perfilamiento', color: '#38ef7d', isVisible: true, order: 1 },
  { key: 'VISITA', name: 'Visita', details: 'Visitas agendadas y guiadas', color: '#ff007f', isVisible: true, order: 2 },
  { key: 'PROPUESTA', name: 'Propuesta', details: 'Oferta comercial presentada', color: '#7f00ff', isVisible: true, order: 3 },
  { key: 'NEGOCIACION', name: 'Negociación', details: 'Trato y firmas finales', color: '#ff9900', isVisible: true, order: 4 },
  { key: 'CIERRE_GANADO', name: 'Ganado', details: 'Contrato firmado y pagado', color: '#10b981', isVisible: false, order: 5 },
  { key: 'CIERRE_PERDIDO', name: 'Perdido', details: 'Oportunidad descartada', color: '#ef4444', isVisible: false, order: 6 },
];

// Get Pipeline Opportunities
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    let whereClause = {};

    if (userRole === 'AGENTE' || userRole === 'ASISTENTE') {
      whereClause = { agentId: userId };
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        contact: {
          include: {
            chats: { select: { id: true, isBotActive: true } }
          }
        },
        property: { select: { id: true, unitCode: true, title: true } },
        project: { select: { id: true, name: true, developer: { select: { id: true, name: true } } } },
        agent: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        activities: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ success: true, data: opportunities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Pipeline Stages Config
router.get('/stages', async (req: Request, res: Response) => {
  try {
    let configs = await prisma.pipelineStageConfig.findMany({
      orderBy: { order: 'asc' }
    });

    if (configs.length === 0) {
      await prisma.pipelineStageConfig.createMany({
        data: DEFAULT_STAGES
      });
      configs = await prisma.pipelineStageConfig.findMany({
        orderBy: { order: 'asc' }
      });
    }

    res.json({ success: true, data: configs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Stage Config
router.put('/stages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, details, color, isVisible, order } = req.body;
    const updated = await prisma.pipelineStageConfig.update({
      where: { id },
      data: {
        name,
        details,
        color,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
        order: order !== undefined ? Number(order) : undefined
      }
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Stage of an Opportunity
router.patch('/:id/stage', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const agentId = req.user?.id;
    
    if (!agentId) {
      return res.status(401).json({ success: false, error: 'No autenticado' });
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { stage }
    });
    
    await prisma.activity.create({
      data: {
        type: 'CAMBIO_ETAPA',
        description: `Etapa cambiada a ${stage}.`,
        opportunityId: id,
        contactId: updated.contactId,
        userId: agentId
      }
    });
    
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

import OpenAI from 'openai';

const getAIClient = () => {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  if (provider === 'deepseek') {
    return {
      client: new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY, baseURL: 'https://api.deepseek.com/v1' }),
      model: 'deepseek-chat'
    };
  } else if (provider === 'grok') {
    return {
      client: new OpenAI({ apiKey: process.env.GROK_API_KEY || process.env.OPENAI_API_KEY, baseURL: 'https://api.x.ai/v1' }),
      model: 'grok-beta'
    };
  }
  return {
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    model: 'gpt-4o-mini'
  };
};

// Delete Opportunity
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.opportunity.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Generate AI Analysis
router.get('/:id/ai-analysis', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        contact: {
          include: {
            chats: {
              include: { messages: { orderBy: { timestamp: 'desc' }, take: 20 } } // Last 20 messages
            }
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 15
        }
      }
    });

    if (!opportunity) return res.status(404).json({ success: false, error: 'Oportunidad no encontrada' });

    // Prepare context
    let promptContext = `
      Cliente: ${opportunity.contact?.firstName} ${opportunity.contact?.lastName || ''}
      Teléfono: ${opportunity.contact?.phone}
      Presupuesto: ${opportunity.currency} ${opportunity.value}
      Etapa de Venta actual: ${opportunity.stage}
      Intereses: ${opportunity.contact?.interests?.join(', ')}
      Notas del cliente: ${opportunity.contact?.notes}
      
      Actividades Recientes:
      ${opportunity.activities.map(a => `- ${new Date(a.createdAt).toISOString().split('T')[0]}: [${a.type}] ${a.description}`).join('\n')}
    `;

    if (opportunity.contact?.chats && opportunity.contact.chats.length > 0) {
      promptContext += `\nÚltimos mensajes de WhatsApp:\n`;
      opportunity.contact.chats[0].messages.forEach(m => {
        promptContext += `${m.isFromUser ? 'Cliente' : 'Asesor'}: ${m.content}\n`;
      });
    }

    const aiConfig = getAIClient();
    
    // Check if the appropriate key is set
    const hasKey = (process.env.AI_PROVIDER === 'deepseek' && (process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY)) ||
                   (process.env.AI_PROVIDER === 'grok' && (process.env.GROK_API_KEY || process.env.OPENAI_API_KEY)) ||
                   process.env.OPENAI_API_KEY;

    if (!hasKey) {
      // Simulate if no key is present for demo purposes
      return res.json({
        success: true,
        data: {
          score: Math.floor(Math.random() * 40) + 50,
          diagnosis: "Falta configuración de API KEY. Análisis de prueba: El cliente tiene buen perfil pero falta seguimiento detallado.",
          suggestions: ["Configurar API Key", "Llamar al cliente mañana", "Enviar propuesta económica"]
        }
      });
    }

    const response = await aiConfig.client.chat.completions.create({
      model: aiConfig.model,
      messages: [
        {
          role: "system",
          content: "Eres un experto asesor de ventas inmobiliarias. Analiza el siguiente contexto de un cliente en un CRM. Devuelve un análisis en formato JSON estricto con las siguientes claves: 'score' (número del 1 al 100 indicando probabilidad de cierre), 'diagnosis' (string breve con resumen del perfil y sentimiento), y 'suggestions' (array de 2 a 3 strings con las mejores acciones a tomar a continuación). NO DEVUELVAS MARKDOWN, SÓLO JSON."
        },
        {
          role: "user",
          content: promptContext
        }
      ],
      response_format: { type: "json_object" }
    });

    const contentStr = response.choices[0].message.content || '{}';
    // Clean up potential markdown formatting from the response
    const cleanContent = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiResult = JSON.parse(cleanContent);

    res.json({ success: true, data: aiResult });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ success: false, error: 'Error al generar análisis IA' });
  }
});

export default router;
