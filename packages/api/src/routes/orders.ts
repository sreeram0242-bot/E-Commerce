// ============================================================
// ORDER ROUTES — Create, list, update status
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { createOrderSchema, updateOrderStatusSchema } from '@luxecart/shared';
import { authenticate, adminOnly, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { generateOrderNumber } from '@luxecart/shared';

export const orderRouter = Router();

// ── Create Order ────────────────────────────────────────────

orderRouter.post('/', optionalAuth, validate(createOrderSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shippingAddress, paymentMethod, couponCode, notes, items: bodyItems } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Please login to place an order');
    }

    if (!bodyItems || bodyItems.length === 0) {
      throw new AppError(400, 'Cart is empty');
    }

    // Calculate totals securely from database
    let subtotal = 0;
    const orderItems = [];

    for (const item of bodyItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { images: { where: { isPrimary: true }, take: 1 } }
      });
      
      if (!product) continue;

      let price = product.basePrice;
      let variantLabel = null;

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
        if (variant) {
          price = variant.price || product.basePrice;
          variantLabel = `${variant.name}: ${variant.value}`;
        }
      }

      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        productId: product.id,
        variantId: item.variantId,
        name: product.name,
        image: product.images[0]?.url || null,
        variant: variantLabel,
        price,
        quantity: item.quantity,
        total,
      });
    }

    if (orderItems.length === 0) {
      throw new AppError(400, 'Valid products not found in cart');
    }

    // Apply coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minOrderValue || subtotal >= coupon.minOrderValue) {
          if (coupon.type === 'PERCENTAGE') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else {
            discount = coupon.value;
          }
          // Update usage count
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    // Tax & shipping
    const taxRate = 18; // GST
    const tax = ((subtotal - discount) * taxRate) / 100;
    const shippingFee = subtotal >= 1499 ? 0 : 99;
    const total = subtotal - discount + tax + shippingFee;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        shippingAddress: JSON.stringify(shippingAddress),
        status: 'PLACED',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        paymentMethod,
        subtotal,
        discount,
        tax,
        shippingFee,
        total,
        couponCode: couponCode?.toUpperCase(),
        notes,
        items: { create: orderItems },
        statusHistory: {
          create: { status: 'PLACED', note: 'Order placed successfully' },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    // Update product stock & sold count
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          totalSold: { increment: item.quantity },
        },
      });
    }

    // (Cart clearing is handled by the frontend store)

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order placed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ── Get User Orders ─────────────────────────────────────────

orderRouter.get('/my-orders', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

// ── Get Order Detail ────────────────────────────────────────

orderRouter.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new AppError(404, 'Order not found');
    }

    // Customers can only see their own orders
    if (req.user!.role === 'CUSTOMER' && order.userId !== req.user!.userId) {
      throw new AppError(403, 'Access denied');
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// ── List All Orders (Admin) ─────────────────────────────────

orderRouter.get('/admin/all', authenticate, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Update Order Status (Admin) ─────────────────────────────

orderRouter.put('/:id/status', authenticate, adminOnly, validate(updateOrderStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, note, trackingNumber, trackingUrl } = req.body;

    const updateData: any = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();
    if (status === 'PAID' || status === 'DELIVERED') updateData.paymentStatus = 'PAID';

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        statusHistory: {
          create: { status, note: note || `Status updated to ${status}` },
        },
      },
      include: { items: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
    });

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
});
