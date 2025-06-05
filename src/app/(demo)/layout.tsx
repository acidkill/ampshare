import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppNavbar } from '@/components/layout/AppNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ampshare - Demo',
  description: 'Demo area for Ampshare web components',
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <AppNavbar />
          <main className="container mx-auto py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
