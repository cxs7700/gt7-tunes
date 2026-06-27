import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="detail">
      <h1 className="detail-title">Tune not found</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>
        That tune doesn&apos;t exist or may have been removed.
      </p>
      <Link className="btn" href="/">
        ← Back to tunes
      </Link>
    </main>
  );
}
