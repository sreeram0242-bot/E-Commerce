import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories?flat=true`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-brand-text-primary">All Categories</h1>
        <p className="text-brand-text-secondary mt-1 text-sm">Browse all product categories</p>
      </div>

      {categories.length === 0 ? (
        <div className="py-20 text-center text-brand-text-secondary">
          <p className="text-5xl mb-4">📦</p>
          <p>No categories found.</p>
          <Link href="/shop" className="mt-4 inline-block text-brand-primary hover:underline text-sm font-medium">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/shop?categorySlug=${category.slug}`}
              className="group block relative overflow-hidden rounded-2xl aspect-square bg-brand-bg border border-brand-border hover:border-brand-primary/30 transition-all duration-300 hover:shadow-xl"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.displayName || category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10">
                  📦
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-white font-semibold text-base sm:text-lg drop-shadow-lg">
                  {category.displayName || category.name}
                </h2>
                {category._count && (
                  <p className="text-white/70 text-xs mt-0.5">{category._count.products} products</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
