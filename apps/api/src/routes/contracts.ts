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

    if (restOfData.opportunityId) {
      await prisma.activity.create({
        data: {
          type: 'CONTRATO_CREADO',
          description: `Contrato ${contract.number} registrado por ${contract.currency} ${contract.amount}`,
          opportunityId: restOfData.opportunityId,
          contactId: restOfData.buyerId || restOfData.contactId,
          userId: finalAgentId
        }
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

import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

// Generate PDF for contract
router.get('/:id/pdf', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        buyer: true,
        property: { include: { project: true } },
        agent: true
      }
    });

    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contrato no encontrado' });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contrato-${contract.number}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#10b981').text(`CONTRATO DE ${contract.type}`, { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(10).fillColor('#64748b').text(`Código: ${contract.number}`, { align: 'right' });
    doc.text(`Fecha: ${new Date(contract.createdAt).toLocaleDateString('es-PE')}`, { align: 'right' });
    doc.moveDown(2);

    // Body
    doc.fontSize(12).fillColor('#1e293b').text('Por medio del presente documento, se hace constar la transacción inmobiliaria y el compromiso formal entre las partes involucradas:');
    doc.moveDown();

    doc.fontSize(14).text('1. EL CLIENTE (COMPRADOR/ARRENDATARIO)');
    doc.fontSize(12).text(`Nombre: ${contract.buyer?.firstName} ${contract.buyer?.lastName || ''}`);
    doc.text(`DNI/Doc: ${contract.buyer?.dni || 'No registrado'}`);
    doc.text(`Correo: ${contract.buyer?.email || 'No registrado'}`);
    doc.text(`Teléfono: ${contract.buyer?.phone || 'No registrado'}`);
    doc.moveDown();

    doc.fontSize(14).text('2. LA PROPIEDAD');
    doc.fontSize(12).text(`Proyecto: ${contract.property?.project?.name || 'Independiente'}`);
    doc.text(`Unidad: ${contract.property?.unitCode} - ${contract.property?.title}`);
    doc.text(`Tipo: ${contract.property?.type}`);
    doc.moveDown();

    doc.fontSize(14).text('3. CONDICIONES ECONÓMICAS');
    doc.fontSize(12).text(`Monto de Operación: ${contract.currency} ${Number(contract.amount).toLocaleString('es-PE')}`);
    if (contract.notes) {
      doc.text(`Condiciones adicionales: ${contract.notes}`);
    }
    doc.moveDown(4);

    // Signatures
    doc.text('_______________________', 50, doc.y, { continued: true });
    doc.text('_______________________', 300, doc.y);
    
    doc.moveDown(0.5);
    doc.text('FIRMA DEL CLIENTE', 50, doc.y, { continued: true });
    doc.text('REPRESENTANTE LEGAL', 300, doc.y);

    doc.end();

  } catch (error: any) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Error al generar PDF' });
    }
  }
});

export default router;
