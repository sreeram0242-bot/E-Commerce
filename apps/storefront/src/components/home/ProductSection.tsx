'use client';

import Link from 'next/link';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number;
  images: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  category?: { name: string; slug: string };
  avgRating: number;
  reviewCount: number;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  stock: number;
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  loading?: boolean;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = 'View All',
  loading = false,
}: ProductSectionProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text-primary">
              {title}
            </h2>
            {subtitle && (
              <p className="text-brand-text-secondary mt-1 text-sm">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              {viewAllLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
          }
        </div>

        {/* Mobile View All */}
        {viewAllHref && (
          <div className="mt-6 text-center sm:hidden">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary"
            >
              {viewAllLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
