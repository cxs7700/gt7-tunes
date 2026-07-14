import Link from 'next/link';
import type { Post } from '@/lib/types';
import { withBasePath } from '@/lib/basePath';
import FadeImage from './FadeImage';

// Horizontal rail of similar tunes on the detail page. Server component — the
// related set is computed at build time. Links use next/link (client nav,
// auto-basePath); raw <img> src goes through withBasePath.
export default function RelatedTunes({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="related" aria-label="Similar tunes">
      <h2 className="related-title">Similar tunes</h2>
      <div className="related-rail">
        {posts.map((p) => (
          <Link key={p.id} href={`/tune/${p.id}`} className="related-card">
            {p.imageUrls[0] && (
              <FadeImage src={withBasePath(p.imageUrls[0])} loading="lazy" decoding="async" alt="" />
            )}
            <span className="related-card-title">{p.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
