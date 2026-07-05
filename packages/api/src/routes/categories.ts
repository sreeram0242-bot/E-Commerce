// ============================================================
// CATEGORY ROUTES — CRUD with nested tree structure
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { createCategorySchema, updateCategorySchema } from '@luxecart/shared';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { generateSlug } from '@luxecart/shared';

export const categoryRouter = Router();

// ── List Categories (Public — tree structure) ───────────────

categoryRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flat, homeOnly } = req.query;

    const where: any = {};
    if (homeOnly === 'true') {
      where.showOnHome = true;
      where.isVisible = true;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true, children: true } },
        children: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { products: true } },
          },
        },
      },
    });

    // Return flat or tree
    if (flat === 'true') {
      res.json({ success: true, data: categories });
    } else {
      // Build tree: only return root-level categories (parentId is null)
      const tree = categories.filter(c => !c.parentId);
      res.json({ success: true, data: tree });
    }
  } catch (error) {
    next(error);
  }
});

// ── Get Category by Slug (Public) ───────────────────────────

categoryRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        children: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

// ── Create Category (Admin) ─────────────────────────────────

categoryRouter.post('/', authenticate, adminOnly, validate(createCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    if (!data.slug) {
      data.slug = generateSlug(data.name);
      const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
      if (existing) {
        data.slug = `${data.slug}-${Date.now().toString(36)}`;
      }
    }

    const category = await prisma.category.create({
      data,
      include: {
        _count: { select: { products: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Update Category (Admin) ─────────────────────────────────

categoryRouter.put('/:id', authenticate, adminOnly, validate(updateCategorySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        _count: { select: { products: true } },
      },
    });

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Delete Category (Admin) ─────────────────────────────────

categoryRouter.delete('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for child categories
    const children = await prisma.category.count({ where: { parentId: req.params.id } });
    if (children > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with child categories. Delete children first.',
      });
    }

    await prisma.category.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Reorder Categories (Admin) ──────────────────────────────

categoryRouter.put('/reorder/batch', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categories } = req.body; // Array of { id, sortOrder }

    await Promise.all(
      categories.map((cat: { id: string; sortOrder: number }) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { sortOrder: cat.sortOrder },
        })
      )
    );

    res.json({
      success: true,
      message: 'Categories reordered successfully',
    });
  } catch (error) {
    next(error);
  }
});
