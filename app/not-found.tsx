import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="notfound">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className="notfound-mark">
        <defs>
          <linearGradient id="nfg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="#ff8a5b" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#nfg)" />
        <circle cx="32" cy="32" r="17" stroke="#fff" strokeWidth="4.4" />
        <circle cx="32" cy="32" r="5" fill="#fff" />
        <line x1="27" y1="32" x2="15" y2="32" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
        <line x1="37" y1="32" x2="49" y2="32" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
        <line x1="32" y1="37" x2="32" y2="49" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
      </svg>
      <h1 className="notfound-title">Page not found</h1>
      <p className="notfound-text">This page doesn&apos;t exist or may have been removed.</p>
      <div className="notfound-actions">
        <Link className="btn" href="/">
          Browse all tunes
        </Link>
        <Link className="btn secondary" href="/browse">
          Explore by tag
        </Link>
      </div>
    </main>
  );
}
