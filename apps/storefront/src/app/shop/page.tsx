'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 0 },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: 0 },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Best Selling', value: 'bestseller' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categorySlug = searchParams.get('categorySlug') || '';
  const isOnSale = searchParams.get('isOnSale') || '';
  const isNewArrival = searchParams.get('isNewArrival') || '';
  const isBestSeller = searchParams.get('isBestSeller') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const priceRange = searchParams.get('price') || '';

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => router.push('/shop');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories?flat=true`);
        const data = await res.json();
        if (data.success) setCategories(data.data);
      } catch (e) { console.error(e); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = '?';
      if (categorySlug) query += `categorySlug=${categorySlug}&`;
      if (isOnSale) query += `isOnSale=true&`;
      if (isNewArrival) query += `isNewArrival=true&`;
      if (isBestSeller) query += `isBestSeller=true&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (sort === 'price_asc') query += `sortBy=price&sortOrder=asc&`;
      if (sort === 'price_desc') query += `sortBy=price&sortOrder=desc&`;
      if (sort === 'rating') query += `sortBy=rating&`;
      if (sort === 'bestseller') query += `isBestSeller=true&`;
      query = query.endsWith('&') ? query.slice(0, -1) : query;
      if (query === '?') query = '';

      try {
        const res = await fetch(`${API_URL}/products${query}`);
        const data = await res.json();
        if (data.success) {
          let result = data.data || [];

          // Client-side price filter
          if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            result = result.filter((p: any) => {
              if (min && max) return p.basePrice >= min && p.basePrice <= max;
              if (min && !max) return p.basePrice >= min;
              return true;
            });
          }

          setProducts(result);
        }
      } catch (e) { console.error('Failed to fetch products', e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, [searchParams]);

  const hasActiveFilters = categorySlug || isOnSale || isNewArrival || priceRange || isBestSeller || search;

  const pageTitle = search
    ? `Search: "${search}"`
    : categorySlug
    ? categories.find(c => c.slug === categorySlug)?.name || categorySlug
    : isOnSale ? 'On Sale' : isNewArrival ? 'New Arrivals' : isBestSeller ? 'Best Sellers' : 'All Products';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Filters */}
        <div className={`
          md:w-56 shrink-0
          ${filtersOpen ? 'fixed inset-0 z-50 bg-brand-surface p-6 overflow-y-auto md:relative md:inset-auto md:z-auto md:p-0' : 'hidden md:block'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="font-bold text-brand-text-primary">Filters</h2>
            <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-brand-text-primary mb-3 text-sm uppercase tracking-wider">Categories</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setParam('categorySlug', '')}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categorySlug ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-brand-text-secondary hover:bg-brand-bg'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setParam('categorySlug', cat.slug); setFiltersOpen(false); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categorySlug === cat.slug ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-brand-text-secondary hover:bg-brand-bg'}`}
                >
                  {cat.name}
                  <span className="float-right text-xs text-brand-text-secondary">{cat._count?.products || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold text-brand-text-primary mb-3 text-sm uppercase tracking-wider">Price Range</h3>
            <div className="space-y-1.5">
              {PRICE_RANGES.map(range => {
                const value = range.min || range.max ? `${range.min}-${range.max}` : '';
                return (
                  <button
                    key={range.label}
                    onClick={() => setParam('price', value)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${priceRange === value ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-brand-text-secondary hover:bg-brand-bg'}`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mb-6">
            <h3 className="font-semibold text-brand-text-primary mb-3 text-sm uppercase tracking-wider">Filter By</h3>
            <div className="space-y-2">
              {[
                { label: '🔥 On Sale', key: 'isOnSale', value: isOnSale },
                { label: '✨ New Arrivals', key: 'isNewArrival', value: isNewArrival },
                { label: '⭐ Best Sellers', key: 'isBestSeller', value: isBestSeller },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-brand-bg">
                  <input
                    type="checkbox"
                    checked={!!f.value}
                    onChange={e => setParam(f.key, e.target.checked ? 'true' : '')}
                    className="accent-brand-primary"
                  />
                  <span className="text-sm text-brand-text-secondary">{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="w-full py-2 text-sm text-brand-error hover:bg-brand-error/10 rounded-lg transition-colors font-medium">
              Clear All Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-text-primary">{pageTitle}</h1>
              <p className="text-sm text-brand-text-secondary mt-1">{loading ? '...' : `${products.length} results`}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-sm text-brand-text-primary"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <select
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
                className="px-4 py-2 bg-brand-surface border border-brand-border rounded-lg text-sm text-brand-text-primary focus:outline-none focus:border-brand-primary"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.length > 0
                ? products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
                : (
                  <div className="col-span-full py-20 text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-brand-text-secondary">No products found matching your criteria.</p>
                    <button onClick={clearFilters} className="mt-4 text-brand-primary hover:underline text-sm font-medium">Clear filters</button>
                  </div>
                )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
