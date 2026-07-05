// ============================================================
// TYPE DEFINITIONS — Shared across admin, storefront, and API
// ============================================================

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'ORDER_MANAGER' | 'PRODUCT_MANAGER' | 'SUPPORT';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'OUT_OF_STOCK';

export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NETBANKING';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FEATURED';

export type CouponType = 'PERCENTAGE' | 'FLAT';

// ── API Response Types ──────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Auth Types ──────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}

// ── Product Types ───────────────────────────────────────────

export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  brandName?: string;
  tags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popularity' | 'rating' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
}

export interface CartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

// ── Dashboard Stats ─────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  todayOrders: number;
  todayRevenue: number;
  lowStockProducts: number;
  newCustomersToday: number;
  topProducts: Array<{ id: string; name: string; totalSold: number; revenue: number }>;
  recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string }>;
  salesByDay: Array<{ date: string; revenue: number; orders: number }>;
}

// ── Store Settings ──────────────────────────────────────────

export interface StoreConfig {
  siteName: string;
  siteTagline: string;
  logo: string;
  favicon: string;
  currency: string;
  currencyCode: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    pinterest?: string;
  };
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  announcementBar: {
    active: boolean;
    messages: string[];
  };
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
  };
  paymentMethods: {
    cod: boolean;
    upi: boolean;
    card: boolean;
    netbanking: boolean;
  };
}
