// ============================================================
// SETTINGS ROUTES — Store configuration
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { authenticate, adminOnly } from '../middleware/auth';

export const settingsRouter = Router();

// Get all settings (public — needed by storefront)
settingsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.storeSettings.findMany();
    const config: Record<string, any> = {};
    settings.forEach(s => {
      try { config[s.key] = JSON.parse(s.value); } catch { config[s.key] = s.value; }
    });
    res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

// Get homepage sections (public)
settingsRouter.get('/homepage-sections', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
});

// Update setting (admin)
settingsRouter.put('/:key', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value } = req.body;
    const setting = await prisma.storeSettings.upsert({
      where: { key: req.params.key },
      update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
      create: { key: req.params.key, value: typeof value === 'string' ? value : JSON.stringify(value) },
    });
    res.json({ success: true, data: setting, message: 'Setting updated' });
  } catch (error) {
    next(error);
  }
});

// Bulk update settings (admin)
settingsRouter.put('/', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body; // Object of key:value pairs
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        prisma.storeSettings.upsert({
          where: { key },
          update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
          create: { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
        })
      )
    );
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
});

// Update homepage sections order (admin)
settingsRouter.put('/homepage-sections/reorder', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sections } = req.body;
    await Promise.all(
      sections.map((s: { id: string; sortOrder: number; isVisible: boolean }) =>
        prisma.homepageSection.update({
          where: { id: s.id },
          data: { sortOrder: s.sortOrder, isVisible: s.isVisible },
        })
      )
    );
    res.json({ success: true, message: 'Sections reordered' });
  } catch (error) {
    next(error);
  }
});
