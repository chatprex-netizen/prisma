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

    const { agentId: bodyAgentId, notes, ...restOfData } = req.body;
    const finalAgentId = bodyAgentId || agentId;

    // Generate fallback unique contract number if missing
    if (!restOfData.number) {
      restOfData.number = `CON-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Generate basic HTML content if missing
    if (!restOfData.content) {
      const typeLabel = restOfData.type === 'COMPRAVENTA' ? 'COMPRAVENTA' : restOfData.type === 'SEPARACION' ? 'SEPARACIÓN' : restOfData.type === 'ALQUILER' ? 'ALQUILER' : 'CONTRATO';
      restOfData.content = `
        <div style="font-family: system-ui, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-lg: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <h2 style="color: #10b981; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">CONTRATO DE ${typeLabel}</h2>
          <p>Por medio del presente documento, se hace constar la transacción inmobiliaria y compromiso formal.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <p><strong>Monto de Operación:</strong> ${restOfData.currency || 'USD'} ${Number(restOfData.amount || 0).toLocaleString('es-PE')}</p>
          <p><strong>Código de Contrato:</strong> ${restOfData.number}</p>
          <p><strong>Fecha de Registro:</strong> ${new Date().toLocaleDateString('es-PE')}</p>
          <p style="font-size: 11px; color: #64748b; margin-top: 30px; text-align: center;">Documento firmado electrónicamente mediante el CRM Propify</p>
        </div>
      `;
    }

    // Merge notes into terms JSON object so we don't lose it
    const finalTerms = {
      ...(restOfData.terms || {}),
      ...(notes ? { notes } : {})
    };

    const contract = await prisma.contract.create({
      data: {
        ...restOfData,
        agentId: finalAgentId,
        terms: Object.keys(finalTerms).length > 0 ? finalTerms : undefined
      }
    });

    // Sincronizar estado de la propiedad asociada en el inventario
    let nextPropertyStatus = 'VENDIDO';
    if (restOfData.type === 'SEPARACION') {
      nextPropertyStatus = 'SEPARADO';
    } else if (restOfData.type === 'RESERVA' || restOfData.type === 'RESERVADO') {
      nextPropertyStatus = 'RESERVADO';
    }

    if (restOfData.propertyId) {
      await prisma.property.update({
        where: { id: restOfData.propertyId },
        data: { status: nextPropertyStatus as any }
      });
    }

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
