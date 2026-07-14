import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import ScrollToTop from '@/components/ScrollToTop';
import BrandLogo from '@/components/BrandLogo';
import { BASE_PATH } from '@/lib/basePath';
import { SITE_URL, absoluteUrl } from '@/lib/site';
import './globals.css';

const DESCRIPTION = 'A fast browser for a large collection of Gran Turismo 7 car tunes — categorized filtering, full-text search, and per-tune detail pages.';

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: { default: 'GT7 Tunes', template: '%s — GT7 Tunes' },
  description: DESCRIPTION,
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
  openGraph: {
    type: 'website',
    siteName: 'GT7 Tunes',
    title: 'GT7 Tunes',
    description: DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [{ url: absoluteUrl('og-default.png'), width: 1200, height: 630, alt: 'GT7 Tunes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GT7 Tunes',
    description: DESCRIPTION,
    images: [absoluteUrl('og-default.png')],
  },
};

export const viewport: Viewport = {
  themeColor: '#0f1020',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="app-header">
          <div className="app-header-inner">
            <Link href="/" className="brand brand-link" aria-label="GT7 Tunes — home">
              <BrandLogo />
            </Link>
            <nav className="app-nav">
              <Link href="/browse" className="app-nav-link">
                Browse
              </Link>
              <Link href="/favorites" className="app-nav-link">
                Saved
              </Link>
            </nav>
          </div>
        </header>
        <div id="main">{children}</div>
        <ScrollToTop />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
