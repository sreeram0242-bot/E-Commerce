// ============================================================
// COUPON ROUTES
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { createCouponSchema } from '@luxecart/shared';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const couponRouter = Router();

// Validate coupon (public)
couponRouter.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'Coupon has expired' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, error: 'Coupon usage limit reached' });
    }
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return res.status(400).json({ success: false, error: `Minimum order value: ₹${coupon.minOrderValue}` });
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    res.json({ success: true, data: { coupon, discount } });
  } catch (error) {
    next(error);
  }
});

// Admin CRUD
couponRouter.get('/', authenticate, adminOnly, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
});

couponRouter.post('/', authenticate, adminOnly, validate(createCouponSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json({ success: true, data: coupon, message: 'Coupon created' });
  } catch (error) {
    next(error);
  }
});

couponRouter.put('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

couponRouter.delete('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
});
