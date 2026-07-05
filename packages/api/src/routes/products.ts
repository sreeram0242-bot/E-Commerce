// ============================================================
// PRODUCT ROUTES — CRUD + listing with filters
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { createProductSchema, updateProductSchema } from '@luxecart/shared';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { generateSlug, PAGINATION } from '@luxecart/shared';

export const productRouter = Router();

// ── List Products (Public) ──────────────────────────────────

productRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      status,
      isFeatured,
      isNewArrival,
      isBestSeller,
      isOnSale,
      brandName,
      sortBy = 'newest',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(PAGINATION.maxLimit, Math.max(1, parseInt(limit as string) || PAGINATION.defaultLimit));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = {};

    // Default: only show published products for public listing
    if (!req.headers.authorization) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status;
    }

    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug as string } });
      if (category) where.categoryId = category.id;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { tags: { contains: search as string } },
        { brandName: { contains: search as string } },
      ];
    }
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice as string);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice as string);
    }
    if (isFeatured === 'true') where.isFeatured = true;
    if (isNewArrival === 'true') where.isNewArrival = true;
    if (isBestSeller === 'true') where.isBestSeller = true;
    if (isOnSale === 'true') where.isOnSale = true;
    if (brandName) where.brandName = brandName;

    // Sort
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_asc': orderBy = { basePrice: 'asc' }; break;
      case 'price_desc': orderBy = { basePrice: 'desc' }; break;
      case 'newest': orderBy = { createdAt: 'desc' }; break;
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'popularity': orderBy = { totalSold: 'desc' }; break;
      case 'rating': orderBy = { avgRating: 'desc' }; break;
      case 'name_asc': orderBy = { name: 'asc' }; break;
      case 'name_desc': orderBy = { name: 'desc' }; break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          variants: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: products,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Get Product by Slug (Public) ────────────────────────────

productRouter.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
            images: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true, wishlistItems: true } },
      },
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'PUBLISHED',
      },
      take: 8,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    res.json({
      success: true,
      data: { ...product, relatedProducts },
    });
  } catch (error) {
    next(error);
  }
});

// ── Create Product (Admin) ──────────────────────────────────

productRouter.post('/', authenticate, adminOnly, validate(createProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.name);
      // Ensure unique slug
      const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
      if (existing) {
        data.slug = `${data.slug}-${Date.now().toString(36)}`;
      }
    }

    const product = await prisma.product.create({
      data,
      include: {
        images: true,
        category: { select: { id: true, name: true, slug: true } },
        variants: true,
      },
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Update Product (Admin) ──────────────────────────────────

productRouter.put('/:id', authenticate, adminOnly, validate(updateProductSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        variants: { orderBy: { sortOrder: 'asc' } },
      },
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Delete Product (Admin) ──────────────────────────────────

productRouter.delete('/:id', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Add Product Images (Admin) ──────────────────────────────

productRouter.post('/:id/images', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { images } = req.body; // Array of { url, alt, sortOrder, isPrimary }

    const created = await prisma.productImage.createMany({
      data: images.map((img: any) => ({
        productId: req.params.id,
        ...img,
      })),
    });

    res.status(201).json({
      success: true,
      data: created,
      message: 'Images added successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Add Product Variants (Admin) ────────────────────────────

productRouter.post('/:id/variants', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variants } = req.body; // Array of { name, value, sku, price, stock, image, sortOrder }

    const created = await prisma.productVariant.createMany({
      data: variants.map((v: any) => ({
        productId: req.params.id,
        ...v,
      })),
    });

    res.status(201).json({
      success: true,
      data: created,
      message: 'Variants added successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Replace All Variants (Admin) ─────────────────────────────

productRouter.put('/:id/variants', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variants } = req.body; // Full replacement

    // Delete all existing variants
    await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });

    // Create new ones
    if (variants && variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((v: any, i: number) => ({
          productId: req.params.id,
          name: v.name,
          value: v.value,
          sku: v.sku || null,
          price: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0,
          sortOrder: i,
        })),
      });
    }

    const updated = await prisma.productVariant.findMany({
      where: { productId: req.params.id },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Variants updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

