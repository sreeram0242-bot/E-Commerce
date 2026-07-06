'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [banners.length, nextSlide]);

  if (!banners.length) return null;

  const banner = banners[currentSlide];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full overflow-hidden bg-brand-bg">
      <div className="relative aspect-[16/7] sm:aspect-[16/6] lg:aspect-[16/5] max-h-[600px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <Image
              src={banner.image}
              alt={banner.title || 'Banner'}
              fill
              className="object-cover"
              priority={currentSlide === 0}
              sizes="100vw"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="max-w-xl"
                >
                  {banner.title && (
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight mb-3 drop-shadow-lg">
                      {banner.title}
                    </h1>
                  )}
                  {banner.subtitle && (
                    <p className="text-base sm:text-lg text-white/80 mb-6 max-w-md drop-shadow">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaText && banner.ctaLink && (
                    <Link
                      href={banner.ctaLink}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-brand-accent text-white font-semibold rounded-xl hover:bg-brand-accent-hover transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {banner.ctaText}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows Removed */}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); }}
                className={`transition-all duration-300 rounded-full ${
                  i === currentSlide
                    ? 'w-8 h-2.5 bg-white'
                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
