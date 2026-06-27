'use client';

import Link from 'next/link';
import type { Post, ViewMode } from '@/lib/types';
import { withBasePath } from '@/lib/basePath';
import { saveListScroll } from '@/lib/urlState';
import Highlight from './Highlight';

// A card whose whole surface navigates to the tune's detail page (stretched-link
// pattern, so no nested <a>). Detailed view also shows body preview, tags, photo
// count, and an "Open on Patreon" button (which sits above the overlay link).
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

          <div className="card-footer">
            {post.imageUrls.length > 0 && (
              <span className="card-imgcount">
                {post.imageUrls.length} photo{post.imageUrls.length > 1 ? 's' : ''}
              </span>
            )}
            <a
              className="btn secondary patreon-btn"
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open on Patreon ↗
            </a>
          </div>
        </>
      )}
    </article>
  );
}
