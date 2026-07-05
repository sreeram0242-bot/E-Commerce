// ============================================================
// BANNER ROUTES — Hero carousel management
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { createBannerSchema } from '@luxecart/shared';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const bannerRouter = Router();

bannerRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
});

bannerRouter.get('/admin/all', authenticate, adminOnly, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
});

bannerRouter.post('/', authenticate, adminOnly, validate(createBannerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    res.status(201).json({ success: true, data: banner, message: 'Banner created' });
  } catch (error) {
    next(error);
  }
});

bannerRouter.put('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: banner, message: 'Banner updated' });
  } catch (error) {
    next(error);
  }
});

bannerRouter.delete('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    next(error);
  }
});
