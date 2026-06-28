'use client';

import Link from 'next/link';
import type { Post, ViewMode } from '@/lib/types';
import { withBasePath } from '@/lib/basePath';
import { saveListScroll } from '@/lib/urlState';
import Highlight from './Highlight';
import SpecChips from './SpecChips';

// A card whose whole surface navigates to the tune's detail page (stretched-link
// pattern, so no nested <a>). Detailed view also shows headline spec chips, body
// preview, and tags; the "Open on Patreon" button lives on the detail page only.
// Compact view shows only image + title + date.
export default function TuneCard({
  post,
  query = '',
  view = 'detailed',
}: {
  post: Post;
  query?: string;
  view?: ViewMode;
}) {
  const cover = post.imageUrls[0];
  const compact = view === 'compact';

  return (
    <article className={'post-card' + (compact ? ' compact' : '')}>
      <Link
        href={`/tune/${post.id}`}
        className="card-overlay-link"
        aria-label={post.title}
        onClick={saveListScroll}
      />

      {cover && (
        <img className="card-cover" src={withBasePath(cover)} loading="lazy" decoding="async" alt="" />
      )}

      <div className="post-header">
        <div className="post-title">
          <Highlight text={post.title} query={query} />
        </div>
        <div className="post-date">{post.date}</div>
      </div>

      {!compact && (
        <>
          <SpecChips post={post} />

          <div className="post-body-preview">
            <Highlight text={post.body} query={query} />
          </div>

          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((t) => (
                <span className="post-tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );
}
