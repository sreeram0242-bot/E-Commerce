'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingCartBar() {
  const { items, getSubtotal, toggleCart, isOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = getSubtotal();

  const shouldShow = mounted && itemCount > 0 && !isOpen;

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0,
  }).format(price);

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
            className="w-full flex items-center justify-between p-4 rounded-2xl pointer-events-auto transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(18,22,31,0.88)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(59,130,246,0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                style={{ background: 'linear-gradient(180deg,#4F8DFF 0%,#2563EB 100%)' }}
              >
                {itemCount}
              </div>
              <div className="text-left">
                <span className="text-xs font-medium block" style={{ color: '#9CA3AF' }}>Total</span>
                <span className="font-bold text-base text-white leading-none">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{
                background: 'linear-gradient(180deg,#4F8DFF 0%,#2563EB 100%)',
                boxShadow: '0 8px 20px rgba(37,99,235,0.4)',
              }}
            >
              View Cart
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
