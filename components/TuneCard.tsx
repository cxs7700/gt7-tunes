'use client';

import Link from 'next/link';
import type { Post } from '@/lib/types';
import { withBasePath } from '@/lib/basePath';
import { saveListScroll } from '@/lib/urlState';
import Highlight from './Highlight';

// A card whose whole surface navigates to the tune's detail page (stretched-link
// pattern, so no nested <a>). The "Open on Patreon" button sits above the
// overlay and opens the external URL instead.
export default function TuneCard({ post, query = '' }: { post: Post; query?: string }) {
  const cover = post.imageUrls[0];
  return (
    <article className="post-card">
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
    </article>
  );
}
