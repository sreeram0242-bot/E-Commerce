// ============================================================
// CONSTANTS — Shared across the platform
// ============================================================

export const ORDER_STATUS_FLOW = [
  'PLACED',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PLACED: '#F59E0B',
  CONFIRMED: '#3B82F6',
  PACKED: '#8B5CF6',
  SHIPPED: '#06B6D4',
  DELIVERED: '#22C55E',
  CANCELLED: '#EF4444',
  RETURNED: '#F97316',
  REFUNDED: '#6B7280',
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
  OUT_OF_STOCK: 'Out of Stock',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
  ORDER_MANAGER: 'Order Manager',
  PRODUCT_MANAGER: 'Product Manager',
  SUPPORT: 'Support Staff',
};

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'ORDER_MANAGER', 'PRODUCT_MANAGER', 'SUPPORT'] as const;

export const CURRENCY = {
  symbol: '₹',
  code: 'INR',
  locale: 'en-IN',
};

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
};

export const IMAGE = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  productMaxImages: 10,
};

export const BREAKPOINTS = {
  mobile: 639,
  tablet: 1023,
  desktop: 1024,
} as const;

// Format price for Indian locale
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate URL-safe slug
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Generate order number
export function generateOrderNumber(): string {
  const prefix = 'LC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
