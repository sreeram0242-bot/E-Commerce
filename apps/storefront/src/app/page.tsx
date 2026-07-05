import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductSection } from '@/components/home/ProductSection';
import { FeaturesStrip } from '@/components/home/FeaturesStrip';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchData(endpoint: string) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  // Fetch all homepage data in parallel
  const [banners, categories, featuredProducts, newArrivals, bestSellers] = await Promise.all([
    fetchData('/banners'),
    fetchData('/categories?homeOnly=true'),
    fetchData('/products?isFeatured=true&limit=8&status=PUBLISHED'),
    fetchData('/products?isNewArrival=true&limit=8&status=PUBLISHED'),
    fetchData('/products?isBestSeller=true&limit=8&status=PUBLISHED'),
  ]);

  // Fallback demo data when API is not running
  const demoBanners = banners || [
    {
      id: '1',
      title: 'Summer Collection 2026',
      subtitle: 'Up to 70% Off on Premium Fashion',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=600&fit=crop',
      ctaText: 'Shop Now',
      ctaLink: '/shop',
    },
    {
      id: '2',
      title: 'Tech Deals',
      subtitle: 'Latest Gadgets at Unbeatable Prices',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&h=600&fit=crop',
      ctaText: 'Explore',
      ctaLink: '/shop',
    },
    {
      id: '3',
      title: 'Home Makeover',
      subtitle: 'Transform Your Space — Starting ₹999',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&h=600&fit=crop',
      ctaText: 'View Collection',
      ctaLink: '/shop',
    },
  ];

  const demoCategories = categories || [
    { id: '1', name: 'Fashion', displayName: 'Fashion & Apparel', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', _count: { products: 24 } },
    { id: '2', name: 'Electronics', displayName: 'Electronics & Gadgets', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop', _count: { products: 18 } },
    { id: '3', name: 'Home & Living', displayName: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop', _count: { products: 15 } },
    { id: '4', name: 'Beauty', displayName: 'Beauty & Personal Care', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', _count: { products: 20 } },
    { id: '5', name: 'Sports', displayName: 'Sports & Fitness', slug: 'sports', image: 'https://images.unsplash.com/photo-1461896836934-bd45ba2cee14?w=400&h=400&fit=crop', _count: { products: 12 } },
    { id: '6', name: 'Books', displayName: 'Books & Stationery', slug: 'books', image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=400&fit=crop', _count: { products: 8 } },
    { id: '7', name: 'Accessories', displayName: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop', _count: { products: 16 } },
    { id: '8', name: 'Groceries', displayName: 'Groceries & Gourmet', slug: 'groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop', _count: { products: 10 } },
  ];

  const demoProducts = [
    { id: '1', name: 'Premium Cotton Slim Fit Shirt', slug: 'premium-cotton-slim-fit-shirt', basePrice: 2499, compareAtPrice: 3999, images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Fashion', slug: 'fashion' }, avgRating: 4.5, reviewCount: 89, isOnSale: true, isNewArrival: true, stock: 150 },
    { id: '2', name: 'ProSound Elite Wireless Earbuds', slug: 'prosound-elite-wireless-earbuds', basePrice: 4999, compareAtPrice: 7999, images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Electronics', slug: 'electronics' }, avgRating: 4.7, reviewCount: 456, isBestSeller: true, isOnSale: true, stock: 200 },
    { id: '3', name: 'Artisan Handwoven Throw Blanket', slug: 'artisan-handwoven-throw-blanket', basePrice: 1899, compareAtPrice: 2999, images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Home & Living', slug: 'home-living' }, avgRating: 4.8, reviewCount: 67, isNewArrival: true, stock: 75 },
    { id: '4', name: 'Vitamin C Brightening Serum', slug: 'vitamin-c-brightening-serum', basePrice: 899, compareAtPrice: 1499, images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Beauty', slug: 'beauty' }, avgRating: 4.6, reviewCount: 890, isBestSeller: true, isOnSale: true, stock: 300 },
    { id: '5', name: 'UltraFlex Running Shoes', slug: 'ultraflex-running-shoes', basePrice: 3499, compareAtPrice: 5499, images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Sports', slug: 'sports' }, avgRating: 4.4, reviewCount: 234, isFeatured: true, isOnSale: true, stock: 120 },
    { id: '6', name: 'Chronograph Leather Watch', slug: 'chronograph-leather-watch', basePrice: 6999, compareAtPrice: 9999, images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Accessories', slug: 'accessories' }, avgRating: 4.9, reviewCount: 112, isFeatured: true, isOnSale: true, stock: 45 },
    { id: '7', name: 'Smart Home Speaker', slug: 'smart-home-speaker', basePrice: 5999, compareAtPrice: 8999, images: [{ url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Electronics', slug: 'electronics' }, avgRating: 4.5, reviewCount: 420, isBestSeller: true, isOnSale: true, stock: 65 },
    { id: '8', name: 'Minimalist Leather Wallet', slug: 'minimalist-leather-wallet', basePrice: 1799, compareAtPrice: 2499, images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop', isPrimary: true }], category: { name: 'Accessories', slug: 'accessories' }, avgRating: 4.7, reviewCount: 305, isBestSeller: true, isOnSale: true, stock: 100 },
  ];

  const displayFeatured = featuredProducts || demoProducts;
  const displayNewArrivals = newArrivals || demoProducts.filter((p: any) => p.isNewArrival);
  const displayBestSellers = bestSellers || demoProducts.filter((p: any) => p.isBestSeller);

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner banners={demoBanners} />

      {/* Features Strip */}
      <FeaturesStrip />

      {/* Category Grid */}
      <CategoryGrid categories={demoCategories} />

      {/* Featured Products */}
      <ProductSection
        title="Featured Products"
        subtitle="Handpicked premium selections"
        products={displayFeatured}
        viewAllHref="/shop?isFeatured=true"
      />

      {/* Promotional Banner */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-primary to-emerald-700 p-8 sm:p-12 lg:p-16">
            <div className="relative z-10 max-w-lg">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4">
                LIMITED TIME OFFER
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                Use Code <span className="text-brand-accent">WELCOME10</span>
              </h2>
              <p className="text-white/80 mb-6">
                Get 10% off on your first order. No minimum purchase required.
              </p>
              <a
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-accent text-white font-semibold rounded-xl hover:bg-brand-accent-hover transition-all shadow-lg"
              >
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/3" />
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <ProductSection
        title="Best Sellers"
        subtitle="Most loved by our customers"
        products={displayBestSellers}
        viewAllHref="/shop?isBestSeller=true"
      />

      {/* New Arrivals */}
      <ProductSection
        title="New Arrivals"
        subtitle="Fresh drops you don't want to miss"
        products={displayNewArrivals}
        viewAllHref="/shop?isNewArrival=true"
        viewAllLabel="See What's New"
      />

      {/* Testimonials */}
      <TestimonialsSection />
    </>
  );
}
