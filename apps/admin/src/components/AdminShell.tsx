'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShoppingBag, FolderTree, Users, Tags, Star, Settings, Package, LogOut, Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: ShoppingBag },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Orders', href: '/orders', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Coupons', href: '/coupons', icon: Tags },
  { name: 'Reviews', href: '/reviews', icon: Star },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('luxecart_token');
    const userData = localStorage.getItem('luxecart_admin_user');
    if (!token || !userData) {
      router.replace('/login');
      return;
    }
    try {
      setUser(JSON.parse(userData));
    } catch {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('luxecart_token');
    localStorage.removeItem('luxecart_admin_user');
    router.push('/login');
  };

  const pageTitle = navigation.find(n => pathname.startsWith(n.href))?.name || 'Dashboard';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="text-brand-text-secondary text-sm animate-pulse">Authenticating...</div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-brand-border shrink-0">
        <div className="flex items-center gap-2 text-brand-primary font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-sm">L</div>
          LuxeCart
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-text-secondary hover:bg-brand-bg hover:text-brand-text-primary'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-primary' : ''}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-brand-border shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-text-primary truncate">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-brand-text-secondary truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-brand-error hover:bg-brand-error/10 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 bg-brand-surface border-r border-brand-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar - mobile */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-surface border-r border-brand-border flex flex-col transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-brand-surface border-b border-brand-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-brand-text-secondary hover:text-brand-text-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-brand-text-primary">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand-primary hover:text-brand-primary-hover hidden sm:block"
            >
              View Store ↗
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
