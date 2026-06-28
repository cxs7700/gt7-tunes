import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import BrandLogo from '@/components/BrandLogo';
import { withBasePath } from '@/lib/basePath';
import './globals.css';

export const metadata: Metadata = {
  title: 'GT7 Tunes',
  description: 'A fast browser for Gran Turismo 7 car tunes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div
          className="app-bg"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${withBasePath('background.jpg')})`,
          }}
        />
        <header className="app-header">
          <div className="app-header-inner">
            <Link href="/" className="brand brand-link" aria-label="GT7 Tunes — home">
              <BrandLogo />
            </Link>
          </div>
        </header>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
