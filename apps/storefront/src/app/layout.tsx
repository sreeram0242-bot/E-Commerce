import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FloatingCartBar } from '@/components/cart/FloatingCartBar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LuxeCart — Premium Online Shopping',
  description: 'Discover premium fashion, electronics, and lifestyle products at LuxeCart. Shop the latest trends with free shipping and easy returns.',
  keywords: 'online shopping, fashion, electronics, premium, India, LuxeCart',
  openGraph: {
    title: 'LuxeCart — Premium Online Shopping',
    description: 'Discover premium fashion, electronics, and lifestyle products at LuxeCart.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'LuxeCart',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LuxeCart — Premium Online Shopping',
    description: 'Discover premium fashion, electronics, and lifestyle products at LuxeCart.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans`}>
        <ThemeProvider>
          <AnnouncementBar />
          <Header />
          <CartDrawer />
          <FloatingCartBar />
          <main className="min-h-[80vh]">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
