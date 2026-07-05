'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '@/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function SearchOverlay() {
  const { isOpen, closeSearch, recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(query)}&limit=5&status=PUBLISHED`);
        const data = await res.json();
        if (data.success) setSuggestions(data.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    addRecentSearch(q.trim());
    closeSearch();
    router.push(`/shop?search=${encodeURIComponent(q.trim())}`);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 bg-brand-surface border-b border-brand-border shadow-2xl"
          >
            {/* Input */}
            <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-brand-text-secondary shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products, brands, categories..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
                className="flex-1 bg-transparent text-brand-text-primary placeholder:text-brand-text-secondary text-lg outline-none"
              />
              <button onClick={closeSearch} className="p-1.5 hover:bg-brand-bg rounded-lg transition-colors text-brand-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Suggestions / Recents */}
            <div className="max-w-3xl mx-auto px-4 pb-6">
              {loading && (
                <p className="text-sm text-brand-text-secondary animate-pulse">Searching...</p>
              )}

              {!loading && query.length >= 2 && suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary mb-2">Products</p>
                  <div className="space-y-1">
                    {suggestions.map(product => (
                      <button
                        key={product.id}
                        onClick={() => { closeSearch(); router.push(`/product/${product.slug}`); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-brand-bg rounded-lg text-left transition-colors"
                      >
                        <div className="w-10 h-10 rounded bg-brand-bg border border-brand-border overflow-hidden shrink-0">
                          {product.images?.[0] && (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-text-primary">{product.name}</p>
                          <p className="text-xs text-brand-text-secondary">₹{product.basePrice.toLocaleString('en-IN')}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => handleSearch(query)}
                      className="w-full text-left px-3 py-2 text-sm text-brand-primary hover:underline font-medium"
                    >
                      See all results for "{query}" →
                    </button>
                  </div>
                </div>
              )}

              {!loading && query.length >= 2 && suggestions.length === 0 && (
                <p className="text-sm text-brand-text-secondary">No products found for "{query}"</p>
              )}

              {!query && recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </p>
                    <button onClick={clearRecentSearches} className="text-xs text-brand-text-secondary hover:text-brand-error">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(q => (
                      <button key={q} onClick={() => handleSearch(q)} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-full text-sm text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!query && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Popular
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Electronics', 'Fashion', 'Running Shoes', 'Earbuds', 'Skincare'].map(term => (
                      <button key={term} onClick={() => handleSearch(term)} className="px-3 py-1.5 bg-brand-bg border border-brand-border rounded-full text-sm text-brand-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
