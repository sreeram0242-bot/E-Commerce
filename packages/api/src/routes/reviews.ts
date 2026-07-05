// ============================================================
// REVIEW ROUTES
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { createReviewSchema } from '@luxecart/shared';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const reviewRouter = Router();

reviewRouter.get('/product/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: req.params.productId, status: 'APPROVED' },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

reviewRouter.post('/', authenticate, validate(createReviewSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.create({
      data: { ...req.body, userId: req.user!.userId },
    });
    // Update product rating
    const stats = await prisma.review.aggregate({
      where: { productId: req.body.productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: req.body.productId },
      data: { avgRating: stats._avg.rating || 0, reviewCount: stats._count },
    });
    res.status(201).json({ success: true, data: review, message: 'Review submitted for approval' });
  } catch (error) {
    next(error);
  }
});

// Admin: list all reviews
reviewRouter.get('/admin/all', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        product: { select: { name: true, slug: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

// Admin: update review status
reviewRouter.put('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, adminReply } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status, adminReply },
    });
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});
