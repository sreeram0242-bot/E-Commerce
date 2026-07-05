'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

export function ProductGallery({ images, productName }: { images: any[], productName: string }) {
  const [activeImage, setActiveImage] = useState(images[0] || null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/5] bg-brand-bg rounded-2xl flex items-center justify-center text-brand-text-secondary">
        No Image Available
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24 shrink-0 hide-scrollbar pb-2 md:pb-0">
        {images.map((image, index) => (
          <button
            key={image.id || index}
            onClick={() => setActiveImage(image)}
            className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
              activeImage?.id === image.id ? 'border-brand-primary' : 'border-transparent hover:border-brand-primary/50'
            }`}
          >
            <Image src={image.url} alt={`Thumbnail ${index}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1 aspect-square md:aspect-auto md:h-[600px] bg-brand-bg rounded-2xl overflow-hidden border border-brand-border">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage.id || activeImage.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image src={activeImage.url} alt={productName} fill className="object-contain" priority sizes="(max-width: 768px) 100vw, 50vw" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
