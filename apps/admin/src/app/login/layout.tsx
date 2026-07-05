import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LuxeCart Admin Login',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} font-sans bg-brand-bg`}>
        {children}
      </body>
    </html>
  );
}
