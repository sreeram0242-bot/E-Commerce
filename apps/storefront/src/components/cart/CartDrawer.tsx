'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store';

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal } = useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
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
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-brand-surface shadow-2xl z-50 flex flex-col border-l border-brand-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-border">
              <h2 className="text-xl font-display font-bold text-brand-text-primary">
                Your Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 rounded-xl hover:bg-brand-bg transition-colors text-brand-text-secondary hover:text-brand-text-primary"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-brand-text-secondary">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-50">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <p>Your cart is empty.</p>
                  <button onClick={closeCart} className="px-6 py-2.5 bg-brand-primary/10 text-brand-primary rounded-xl font-medium hover:bg-brand-primary hover:text-white transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-brand-bg p-3 rounded-2xl border border-brand-border">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-white">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-surface" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/product/${item.productId}`} onClick={closeCart} className="text-sm font-semibold text-brand-text-primary line-clamp-2 hover:text-brand-primary">
                          {item.name}
                        </Link>
                        <button onClick={() => removeItem(item.id)} className="text-brand-text-secondary hover:text-brand-error p-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-brand-surface rounded-lg border border-brand-border px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-brand-text-secondary hover:text-brand-primary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </button>
                          <span className="text-xs font-semibold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-brand-text-secondary hover:text-brand-primary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          </button>
                        </div>
                        <span className="font-bold text-sm text-brand-text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-brand-border bg-brand-bg space-y-4">
                <div className="flex justify-between items-center text-brand-text-primary">
                  <span className="font-medium text-sm">Subtotal</span>
                  <span className="font-bold text-lg">{formatPrice(getSubtotal())}</span>
                </div>
                <p className="text-xs text-brand-text-secondary">Shipping and taxes calculated at checkout.</p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex justify-center items-center py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-hover transition-colors shadow-lg"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
