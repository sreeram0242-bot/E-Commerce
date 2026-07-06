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
      className="product-card"
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div
          className="relative rounded-[22px] overflow-hidden border transition-all duration-300"
          style={{
            background: 'var(--card-bg, rgb(24 29 39))',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          }}
        >
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden" style={{ borderRadius: '22px 22px 0 0' }}>
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-text-secondary text-sm bg-brand-surface">
                No Image
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="px-2 py-0.5 text-white text-xs font-bold rounded-lg shadow-sm" style={{ background: '#EF4444' }}>
                  -{discount}%
                </span>
              )}
              {product.isNewArrival && (
                <span className="px-2 py-0.5 text-white text-xs font-bold rounded-lg shadow-sm" style={{ background: 'linear-gradient(135deg,#4F8DFF,#2563EB)' }}>
                  NEW
                </span>
              )}
              {product.isBestSeller && (
                <span className="px-2 py-0.5 text-white text-xs font-bold rounded-lg shadow-sm" style={{ background: '#F97316' }}>
                  BEST
                </span>
              )}
            </div>

            {/* Wishlist */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleWishlist}
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all"
                style={{
                  background: isWishlisted ? '#EF4444' : 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: isWishlisted ? 'white' : '#9CA3AF',
                }}
                aria-label="Add to wishlist"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {product.category && (
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#3B82F6' }}>
                {product.category.name}
              </p>
            )}

            <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors" style={{ color: '#fff' }}>
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="11" height="11" viewBox="0 0 24 24"
                      fill={i < Math.round(product.avgRating) ? '#FBBF24' : 'none'}
                      stroke="#FBBF24" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>({product.reviewCount})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: '#fff' }}>
                {formatPrice(product.basePrice)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-xs line-through" style={{ color: '#6B7280' }}>
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

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="rounded-[22px] overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgb(24 29 39)' }}>
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
