import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { authenticate, adminOnly } from '../middleware/auth';

export const customerRouter = Router();

// ── List Customers (Admin) ───────────────
customerRouter.get('/', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, status } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search as string } },
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
      ];
    }
    
    if (role) where.role = role;
    if (status === 'BLOCKED') where.isBlocked = true;
    if (status === 'ACTIVE') where.isBlocked = false;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        lastActiveAt: true,
        _count: { select: { orders: true } }
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// ── Update Customer Status (Admin) ───────────────
customerRouter.put('/:id/status', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isBlocked } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBlocked },
      select: { id: true, email: true, isBlocked: true }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
