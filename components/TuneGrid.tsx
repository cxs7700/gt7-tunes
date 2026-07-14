'use client';

import type { Post, ViewMode } from '@/lib/types';
import TuneCard from './TuneCard';

// Arrow-key navigation across the card grid: when a card's overlay link is
// focused, arrows move focus to the neighbouring card (2D, based on the actual
// column count), Home/End jump to the first/last. Tab order is unchanged.
function onGridKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const links = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.card-overlay-link'));
  const i = links.indexOf(document.activeElement as HTMLElement);
  if (i === -1) return; // focus isn't on a card
  e.preventDefault();

  // Columns = how many cards share the first row's top edge.
  const top0 = links[0].getBoundingClientRect().top;
  let cols = links.findIndex((l) => l.getBoundingClientRect().top > top0 + 1);
  if (cols === -1) cols = links.length;

  let t = i;
  if (e.key === 'ArrowRight') t = i + 1;
  else if (e.key === 'ArrowLeft') t = i - 1;
  else if (e.key === 'ArrowDown') t = i + cols;
  else if (e.key === 'ArrowUp') t = i - cols;
  else if (e.key === 'Home') t = 0;
  else if (e.key === 'End') t = links.length - 1;
  if (t >= 0 && t < links.length) links[t].focus();
}

export default function TuneGrid({
  posts,
  query = '',
  view = 'detailed',
}: {
  posts: Post[];
  query?: string;
  view?: ViewMode;
}) {
  if (posts.length === 0) {
    return (
      <div className="posts-grid">
        <div className="no-results">No tunes match your filters.</div>
      </div>
    );
  }
  return (
    <div className={'posts-grid' + (view === 'compact' ? ' compact' : '')} onKeyDown={onGridKeyDown}>
      {posts.map((post) => (
        <TuneCard key={post.id} post={post} query={query} view={view} />
      ))}
    </div>
  );
}
