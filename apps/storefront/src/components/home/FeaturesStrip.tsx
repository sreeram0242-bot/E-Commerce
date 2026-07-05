'use client';

import { motion } from 'framer-motion';

const features = [
  {
    icon: '🚚',
    title: 'Free Shipping',
    description: 'On orders above ₹1,499',
  },
  {
    icon: '↩️',
    title: 'Easy Returns',
    description: '7-day hassle-free returns',
  },
  {
    icon: '🔒',
    title: 'Secure Payments',
    description: '100% secure checkout',
  },
  {
    icon: '💬',
    title: '24/7 Support',
    description: 'We are here to help',
  },
];

export function FeaturesStrip() {
  return (
    <section className="py-8 sm:py-10 bg-brand-surface border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 sm:gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-text-primary">
                  {feature.title}
                </h3>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
