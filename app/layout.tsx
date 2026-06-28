import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import BrandLogo from '@/components/BrandLogo';
import { BASE_PATH } from '@/lib/basePath';
import './globals.css';

export const metadata: Metadata = {
  title: 'GT7 Tunes',
  description: 'A fast browser for Gran Turismo 7 car tunes.',
  applicationName: 'GT7 Tunes',
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${BASE_PATH}/icon.svg`, type: 'image/svg+xml' },
      { url: `${BASE_PATH}/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${BASE_PATH}/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: `${BASE_PATH}/apple-touch-icon.png`, sizes: '180x180' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'GT7 Tunes' },
};

export const viewport: Viewport = {
  themeColor: '#0f1020',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
