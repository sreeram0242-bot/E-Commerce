import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AdminShell from '@/components/AdminShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LuxeCart Admin',
  description: 'LuxeCart Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} font-sans`}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
