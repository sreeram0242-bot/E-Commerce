// ============================================================
// WISHLIST ROUTES
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { authenticate } from '../middleware/auth';

export const wishlistRouter = Router();

wishlistRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: req.user!.userId, productId },
    });
    if (existing) {
      return res.json({ success: true, data: existing, message: 'Already in wishlist' });
    }
    const item = await prisma.wishlistItem.create({
      data: { userId: req.user!.userId, productId },
    });
    res.status(201).json({ success: true, data: item, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.delete('/:productId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.userId, productId: req.params.productId },
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
});
