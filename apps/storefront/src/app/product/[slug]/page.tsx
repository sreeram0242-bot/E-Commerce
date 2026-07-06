import Link from 'next/link';
import { ProductGallery } from '@/components/product/ProductGallery';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { ProductSection } from '@/components/home/ProductSection';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/products/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  const res = await fetch(`${API_URL}/products?categoryId=${categoryId}&limit=4`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data.filter((p: any) => p.id !== excludeId).slice(0, 4);
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-brand-text-primary">Product not found</h1>
        <Link href="/shop" className="mt-4 text-brand-primary hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const relatedProducts = product.categoryId ? await getRelatedProducts(product.categoryId, product.id) : [];

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-secondary hover:text-brand-primary mb-8 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Shop
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Product Info */}
        <div className="flex flex-col">
          {product.category && (
            <Link href={`/shop?categorySlug=${product.category.slug}`} className="text-brand-primary text-sm font-medium uppercase tracking-wider hover:underline mb-2">
              {product.category.name}
            </Link>
          )}
          
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 leading-tight" style={{ letterSpacing: '-0.5px' }}>
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={i < Math.round(product.avgRating) ? '#FBBF24' : 'none'} stroke="#FBBF24" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-sm" style={{ color: '#9CA3AF' }}>{product.reviewCount} Reviews</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl sm:text-4xl font-bold text-white" style={{ fontWeight: 700, lineHeight: 1 }}>
              ₹{product.basePrice.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
              <>
                <span className="text-xl line-through mb-1" style={{ color: '#6B7280' }}>
                  ₹{product.compareAtPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold mb-2 px-2 py-0.5 rounded-lg" style={{ background: 'rgba(249,115,22,0.15)', color: '#F97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="text-brand-text-secondary leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="mt-auto">
            <AddToCartButton product={product} />
            <div className="mt-4 flex items-center gap-6 text-sm text-brand-text-secondary">
              <span className="flex items-center gap-2"><span className="text-xl">🚚</span> Free delivery over ₹1,499</span>
              <span className="flex items-center gap-2"><span className="text-xl">↩️</span> 7 Days return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductSection title="You May Also Like" products={relatedProducts} />
      )}
    </div>
  );
}
