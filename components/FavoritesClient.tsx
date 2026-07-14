'use client';

import type { Post } from '@/lib/types';
import { useFavorites } from '@/lib/useFavorites';
import TuneGrid from './TuneGrid';

// Dedicated Saved-tunes page body. Reads favorites from localStorage and filters
// the full posts list to them (source order, newest-first). Renders nothing
// until the store is ready to avoid a wrong "empty" flash on load.
export default function FavoritesClient({ posts }: { posts: Post[] }) {
  const { favs, ready } = useFavorites();
  const saved = posts.filter((p) => favs.has(p.id));

  return (
    <main className="saved-page">
      <h1 className="saved-title">
        Saved tunes
        {ready && <span className="tag-count">{saved.length}</span>}
      </h1>
      {!ready ? null : saved.length === 0 ? (
        <p className="empty-state">No saved tunes yet — tap the ☆ on any tune to save it.</p>
      ) : (
        <TuneGrid posts={saved} view="detailed" />
      )}
    </main>
  );
}
