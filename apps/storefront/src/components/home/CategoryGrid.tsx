'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  displayName?: string;
  slug: string;
  image?: string;
  _count?: { products: number };
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories.length) return null;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text-primary">
              Shop by Category
            </h2>
            <p className="text-brand-text-secondary mt-1 text-sm">
              Find exactly what you&apos;re looking for
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors"
          >
            View All
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <Link
                href={`/shop?categorySlug=${category.slug}`}
                className="group block relative overflow-hidden rounded-2xl aspect-square bg-brand-bg border border-brand-border hover:border-brand-primary/30 transition-all duration-300 hover:shadow-xl"
              >
                {/* Image */}
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.displayName || category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                    📦
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category Name */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-base sm:text-lg drop-shadow-lg">
                    {category.displayName || category.name}
                  </h3>
                  {category._count && (
                    <p className="text-white/70 text-xs mt-0.5">
                      {category._count.products} products
                    </p>
                  )}
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary"
          >
            View All Categories
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
