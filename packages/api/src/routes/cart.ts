// ============================================================
// CART ROUTES — Add, update, remove, list
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { authenticate } from '../middleware/auth';

export const cartRouter = Router();

// ── Get Cart ────────────────────────────────────────────────

cartRouter.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user!.userId },
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true } },
          },
        },
        variant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.basePrice;
      return sum + price * item.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        items,
        subtotal,
        itemCount: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Add to Cart ─────────────────────────────────────────────

cartRouter.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user!.userId;

    // Check if already in cart
    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId, variantId: variantId || null },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      });
    } else {
      item = await prisma.cartItem.create({
        data: { userId, productId, variantId, quantity },
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      });
    }

    res.status(201).json({ success: true, data: item, message: 'Added to cart' });
  } catch (error) {
    next(error);
  }
});

// ── Update Cart Item Quantity ───────────────────────────────

cartRouter.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Item removed from cart' });
    }

    const item = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
      include: {
        product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        variant: true,
      },
    });

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// ── Remove from Cart ────────────────────────────────────────

cartRouter.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
});

// ── Clear Cart ──────────────────────────────────────────────

cartRouter.delete('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
});
