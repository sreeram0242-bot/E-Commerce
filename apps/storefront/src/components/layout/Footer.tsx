import Link from 'next/link';

export function Footer() {
  const links = {
    Shop: [
      { label: 'All Products', href: '/shop' },
      { label: 'New Arrivals', href: '/shop?isNewArrival=true' },
      { label: 'Best Sellers', href: '/shop?isBestSeller=true' },
      { label: 'Sale', href: '/shop?isOnSale=true' },
    ],
    Account: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'My Orders', href: '/account/orders' },
      { label: 'Wishlist', href: '/account/wishlist' },
    ],
    Help: [
      { label: 'FAQ', href: '#' },
      { label: 'Shipping Policy', href: '#' },
      { label: 'Return Policy', href: '#' },
      { label: 'Contact Us', href: '#' },
    ],
  };

  return (
    <footer className="bg-brand-surface border-t border-brand-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-sm">L</div>
              <span className="font-bold text-xl text-brand-text-primary">LuxeCart</span>
            </div>
            <p className="text-brand-text-secondary text-sm leading-relaxed">
              Premium shopping experience with curated collections from top brands worldwide.
            </p>
            <div className="flex gap-3 mt-4">
              {['𝕏', 'f', 'in', '📸'].map((icon, i) => (
                <a key={i} href="#" className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-bg border border-brand-border text-brand-text-secondary hover:text-brand-primary hover:border-brand-primary transition-colors text-xs font-bold">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3 className="font-semibold text-brand-text-primary mb-4">{group}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-brand-text-secondary hover:text-brand-primary text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-border mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-brand-text-secondary text-sm">
            © {new Date().getFullYear()} LuxeCart. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-brand-text-secondary">
            <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
