// ============================================================
// DASHBOARD ROUTES — Admin analytics and stats
// ============================================================

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@luxecart/database';
import { authenticate, adminOnly } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', authenticate, adminOnly, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalCustomers,
      todayOrders,
      todayRevenue,
      lowStockProducts,
      newCustomersToday,
      topProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
      prisma.order.count({ where: { status: { in: ['PLACED', 'CONFIRMED'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: todayStart }, paymentStatus: 'PAID' },
      }),
      prisma.product.count({
        where: {
          status: 'PUBLISHED',
          stock: { lte: 5 }, // using default low stock threshold
        },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: todayStart } } }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { totalSold: 'desc' },
        take: 5,
        select: { id: true, name: true, totalSold: true, basePrice: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingOrders,
        totalCustomers,
        todayOrders,
        todayRevenue: todayRevenue._sum.total || 0,
        lowStockProducts,
        newCustomersToday,
        topProducts: topProducts.map(p => ({
          id: p.id,
          name: p.name,
          totalSold: p.totalSold,
          revenue: p.totalSold * p.basePrice,
        })),
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
});
