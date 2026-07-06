'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCartStore, useWishlistStore } from '@/store';

interface ProductCardProps {
  product: {
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
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      image: primaryImage?.url,
      price: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      quantity: 1,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative bg-brand-surface rounded-2xl overflow-hidden border border-brand-border hover:border-brand-primary/30 transition-all duration-300 hover:shadow-lg">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-brand-bg">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-text-secondary text-sm">
                No Image
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="px-2.5 py-1 bg-brand-error text-white text-xs font-bold rounded-lg shadow-sm">
                  -{discount}%
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-2.5 py-1 bg-brand-primary text-white text-xs font-bold rounded-lg shadow-sm">
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-2.5 py-1 bg-brand-accent text-white text-xs font-bold rounded-lg shadow-sm">
                  BEST
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleWishlist}
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all ${
                  isWishlisted
                    ? 'bg-brand-error text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-brand-error hover:text-white'
                }`}
                aria-label="Add to wishlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {product.category && (
              <p className="text-xs text-brand-text-secondary uppercase tracking-wider mb-1">
                {product.category.name}
              </p>
            )}

            <h3 className="text-sm font-semibold text-brand-text-primary line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={i < Math.round(product.avgRating) ? '#F59E0B' : 'none'}
                      stroke="#F59E0B"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-brand-text-secondary">
                  ({product.reviewCount})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-brand-text-primary">
                {formatPrice(product.basePrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-sm text-brand-text-secondary line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loader for product cards
export function ProductCardSkeleton() {
  return (
    <div className="bg-brand-surface rounded-2xl overflow-hidden border border-brand-border">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-2/3 skeleton" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 skeleton" />
          <div className="h-4 w-14 skeleton" />
        </div>
      </div>
    </div>
  );
}
