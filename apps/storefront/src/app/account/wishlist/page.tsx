'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('luxecart_token');
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('luxecart_token');
      await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter(i => i.productId !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToCart = (item: any) => {
    const product = item.product;
    const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
    addItem({
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      image: primaryImage?.url || '',
      quantity: 1,
      stock: product.stock || 999,
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  const token = typeof window !== 'undefined' ? localStorage.getItem('luxecart_token') : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-brand-error fill-brand-error" />
        <h1 className="text-3xl font-display font-bold text-brand-text-primary">My Wishlist</h1>
      </div>

      {!token ? (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">❤️</div>
          <p className="text-brand-text-secondary mb-4 text-lg">Please log in to view your wishlist.</p>
          <Link href="/login" className="inline-flex px-6 py-2.5 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-hover transition-colors">
            Sign In
          </Link>
        </div>
      ) : loading ? (
        <div className="text-brand-text-secondary">Loading wishlist...</div>
      ) : items.length === 0 ? (
        <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center">
          <div className="text-5xl mb-4">💔</div>
          <p className="text-brand-text-secondary mb-4 text-lg">Your wishlist is empty.</p>
          <Link href="/shop" className="inline-flex px-6 py-2.5 bg-brand-primary text-white rounded-xl font-medium hover:bg-brand-primary-hover transition-colors">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            const primaryImage = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
            const discount = product.compareAtPrice
              ? Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)
              : 0;

            return (
              <div key={item.id} className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden group hover:border-brand-primary transition-colors">
                <div className="relative aspect-square">
                  {primaryImage ? (
                    <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-brand-bg flex items-center justify-center text-4xl">📦</div>
                  )}
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-brand-error text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-brand-error hover:text-white transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-brand-error text-brand-error group-hover:fill-white" />
                  </button>
                </div>
                <div className="p-4">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-brand-text-primary text-sm line-clamp-2 hover:text-brand-primary transition-colors mb-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-brand-text-primary">{formatPrice(product.basePrice)}</span>
                    {product.compareAtPrice > product.basePrice && (
                      <span className="text-xs text-brand-text-secondary line-through">{formatPrice(product.compareAtPrice)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors text-sm font-medium"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
