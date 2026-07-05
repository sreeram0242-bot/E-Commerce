'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Anita R.',
    location: 'Mumbai',
    rating: 5,
    comment: 'Absolutely love the quality! The cotton shirt I ordered is the best I have ever worn. Will definitely order again.',
    avatar: 'A',
  },
  {
    name: 'Vikram S.',
    location: 'Bangalore',
    rating: 5,
    comment: 'Fast delivery and amazing packaging. The earbuds sound incredible for the price. Highly recommended!',
    avatar: 'V',
  },
  {
    name: 'Meera P.',
    location: 'Delhi',
    rating: 4,
    comment: 'Great collection and easy returns. Customer service is very helpful. My go-to online store now.',
    avatar: 'M',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-12 sm:py-16 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-brand-text-primary">
            What Our Customers Say
          </h2>
          <p className="text-brand-text-secondary mt-2 text-sm">
            Real reviews from real shoppers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-brand-surface rounded-2xl p-6 border border-brand-border hover:border-brand-primary/20 transition-all hover:shadow-md"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={i < testimonial.rating ? '#F59E0B' : 'none'}
                    stroke="#F59E0B"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-brand-text-primary leading-relaxed mb-4">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              {/* User */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary font-semibold flex items-center justify-center text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-text-primary">{testimonial.name}</p>
                  <p className="text-xs text-brand-text-secondary">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
