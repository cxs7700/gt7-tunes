import type { SortMode } from './types';

// sessionStorage key for the list's scroll position (restored on Back).
export const SCROLL_KEY = 'gt7-list-scroll';

export function saveListScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  } catch {
    /* sessionStorage unavailable */
  }
}

// The list view's state, encoded in the URL query so it survives navigating to a
// tune's detail page and back (and is shareable).
export interface ListState {
  search: string;
  sort: SortMode;
  filters: string[];
}

const SORTS: SortMode[] = ['newest', 'oldest', 'title'];

export function decodeState(search: string): ListState {
  const p = new URLSearchParams(search);
  const sort = p.get('sort');
  const f = p.get('f');
  return {
    search: p.get('q') ?? '',
    sort: SORTS.includes(sort as SortMode) ? (sort as SortMode) : 'newest',
    filters: f ? f.split(',').map(decodeURIComponent).filter(Boolean) : [],
  };
}

// Returns a query string (with leading "?") or "" when everything is default.
export function encodeState(s: ListState): string {
  const p = new URLSearchParams();
  if (s.search) p.set('q', s.search);
  if (s.sort !== 'newest') p.set('sort', s.sort);
  if (s.filters.length) p.set('f', s.filters.map(encodeURIComponent).join(','));
  const str = p.toString();
  return str ? `?${str}` : '';
}
