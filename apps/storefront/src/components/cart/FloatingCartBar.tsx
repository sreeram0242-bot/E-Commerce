'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCartBar() {
  const { items, getSubtotal, toggleCart, isOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getSubtotal();

  // Do not show if cart is empty or if the cart drawer is already open
  const shouldShow = mounted && itemCount > 0 && !isOpen;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-0 right-0 z-40 mx-auto max-w-md px-4 sm:px-0 pointer-events-none"
        >
          <button
            onClick={toggleCart}
            className="w-full flex items-center justify-between p-4 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 pointer-events-auto hover:bg-brand-primary-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                {itemCount}
              </div>
              <div className="text-left flex flex-col">
                <span className="text-sm font-medium opacity-90">Total</span>
                <span className="font-bold text-lg leading-none">{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 font-semibold">
              View Cart
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
