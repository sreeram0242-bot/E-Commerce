// ============================================================
// ZOD VALIDATORS — Request validation schemas
// ============================================================

import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
});

// ── Product ─────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  brandName: z.string().max(100).optional(),
  basePrice: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  sku: z.string().max(50).optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  weight: z.number().positive().optional(),
  weightUnit: z.string().default('g'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'OUT_OF_STOCK']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  taxRate: z.number().min(0).max(100).optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  tags: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ── Category ────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  displayName: z.string().max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
  showOnHome: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// ── Order ───────────────────────────────────────────────────

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(1),
    country: z.string().default('India'),
  }),
  paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'NETBANKING']),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']),
  note: z.string().max(500).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

// ── Coupon ───────────────────────────────────────────────────

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).transform(v => v.toUpperCase()),
  description: z.string().max(200).optional(),
  type: z.enum(['PERCENTAGE', 'FLAT']).default('PERCENTAGE'),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

// ── Banner ──────────────────────────────────────────────────

export const createBannerSchema = z.object({
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  image: z.string().min(1, 'Banner image is required'),
  link: z.string().optional(),
  ctaText: z.string().max(50).optional(),
  ctaLink: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

// ── Review ──────────────────────────────────────────────────

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
});

// ── Address ─────────────────────────────────────────────────

export const createAddressSchema = z.object({
  fullName: z.string().min(1).max(100),
  phone: z.string().min(10).max(15),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(5).max(10),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
  label: z.enum(['Home', 'Work', 'Other']).default('Home'),
});
