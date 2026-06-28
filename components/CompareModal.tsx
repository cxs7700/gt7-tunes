'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/types';
import { withBasePath } from '@/lib/basePath';
import { headlineSpecs } from '@/lib/derive';

const ROWS: { key: string; label: string }[] = [
  { key: 'PP', label: 'PP' },
  { key: 'Class', label: 'Class' },
  { key: 'Drivetrain', label: 'Drivetrain' },
  { key: 'Rating', label: 'Rating' },
];

function specMap(post: Post): Record<string, string> {
  const m: Record<string, string> = {};
  for (const s of headlineSpecs(post)) m[s.kind] = s.label;
  return m;
}

// Side-by-side spec comparison of the pinned tunes (2–3).
export default function CompareModal({
  posts,
  onRemove,
  onClose,
}: {
  posts: Post[];
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const specs = posts.map(specMap);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal compare-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Compare tunes"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Compare</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div
            className="compare-grid"
            style={{ gridTemplateColumns: `auto repeat(${posts.length}, minmax(0, 1fr))` }}
          >
            {/* Header row: blank label cell + one header per tune. */}
            <div className="compare-corner" />
            {posts.map((p) => (
              <div key={p.id} className="compare-head">
                <button
                  className="compare-remove"
                  onClick={() => onRemove(p.id)}
                  aria-label={`Remove ${p.title} from compare`}
                >
                  ×
                </button>
                <Link href={`/tune/${p.id}`} className="compare-head-link">
                  {p.imageUrls[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={withBasePath(p.imageUrls[0])} loading="lazy" decoding="async" alt="" />
                  )}
                  <span className="compare-head-title">{p.title}</span>
                </Link>
              </div>
            ))}

            {/* Spec rows. */}
            {ROWS.map((row) => (
              <div key={row.key} className="compare-row" style={{ display: 'contents' }}>
                <div className="compare-label">{row.label}</div>
                {specs.map((s, i) => (
                  <div key={posts[i].id} className="compare-cell">
                    {s[row.key] ?? '—'}
                  </div>
                ))}
              </div>
            ))}

            {/* Patreon links. */}
            <div className="compare-label">Source</div>
            {posts.map((p) => (
              <div key={p.id} className="compare-cell">
                <a className="compare-patreon" href={p.url} target="_blank" rel="noopener noreferrer">
                  Patreon ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
