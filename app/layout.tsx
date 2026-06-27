import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

export const metadata: Metadata = {
  title: 'GT7 Tunes',
  description: 'A fast browser for Gran Turismo 7 car tunes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header-inner">
            <Link href="/" className="brand brand-link">
              <span className="brand-mark">GT7</span>
              <span className="brand-name">Tunes</span>
            </Link>
          </div>
        </header>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
