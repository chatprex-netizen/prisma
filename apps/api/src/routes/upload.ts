import { Router, Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload Document Endpoint
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { title, type, contactId, propertyId } = req.body;
    
    // The public URL to access the file
    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await prisma.document.create({
      data: {
        title: title || req.file.originalname,
        url: fileUrl,
        type: type || 'GENERIC',
        contactId: contactId || null,
        propertyId: propertyId || null,
      }
    });

    if (contactId) {
      const agentId = req.user?.id;
      if (agentId) {
        await prisma.activity.create({
          data: {
            type: 'NOTA',
            description: `Documento subido: ${document.title}`,
            contactId: contactId,
            userId: agentId
          }
        });
      }
    }

    res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get documents by contact or property
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { contactId, propertyId } = req.query;
    
    let whereClause: any = {};
    if (contactId) whereClause.contactId = String(contactId);
    if (propertyId) whereClause.propertyId = String(propertyId);

    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
