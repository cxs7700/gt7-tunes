'use client';

import { useEffect, useState } from 'react';
import { getFavorites, subscribe, toggleFavorite } from './favorites';

// React binding for the favorites store. `ready` is false until after mount so
// server and first client render agree (no hydration mismatch) — components
// should treat "not ready" as "nothing saved yet".
export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavs(getFavorites());
    setReady(true);
    return subscribe(setFavs);
  }, []);

  return {
    favs,
    ready,
    isFav: (id: string) => favs.has(id),
    toggle: toggleFavorite,
  };
}
