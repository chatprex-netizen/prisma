import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// =======================
// ACCOUNTS (Plan de Cuentas)
// =======================
router.get('/accounts', authenticate, async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      include: { children: true },
      orderBy: { code: 'asc' },
    });
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accounts', authenticate, async (req: Request, res: Response) => {
  try {
    const account = await prisma.account.create({ data: req.body });
    res.status(201).json(account);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// =======================
// INCOMES (Cuentas por Cobrar)
// =======================
router.get('/incomes', authenticate, async (req: Request, res: Response) => {
  try {
    const incomes = await prisma.income.findMany({
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
        property: { select: { id: true, unitCode: true } },
      },
      orderBy: { date: 'desc' }
    });
    res.json(incomes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/incomes', authenticate, async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      number: req.body.number || `INC-${Date.now()}`,
      createdBy: (req as any).user?.id || 'system'
    };
    const income = await prisma.income.create({ data });
    res.status(201).json(income);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// =======================
// EXPENSES (Cuentas por Pagar)
// =======================
router.get('/expenses', authenticate, async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        project: { select: { id: true, name: true } },
        property: { select: { id: true, unitCode: true } },
      },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/expenses', authenticate, async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      number: req.body.number || `EXP-${Date.now()}`,
      createdBy: (req as any).user?.id || 'system'
    };
    const expense = await prisma.expense.create({ data });
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// =======================
// JOURNAL ENTRIES (Asientos)
// =======================
router.get('/journal-entries', authenticate, async (req: Request, res: Response) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: { include: { account: true } }
      },
      orderBy: { date: 'desc' }
    });
    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/journal-entries', authenticate, async (req: Request, res: Response) => {
  try {
    const { lines, ...entryData } = req.body;
    const entry = await prisma.journalEntry.create({
      data: {
        ...entryData,
        lines: {
          create: lines
        }
      },
      include: { lines: true }
    });
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE income
router.delete('/incomes/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.income.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Income deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE expense
router.delete('/expenses/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE account
router.delete('/accounts/:id', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.account.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
