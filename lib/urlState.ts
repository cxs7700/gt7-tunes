import type { SortMode, ViewMode, PpRange } from './types';

// sessionStorage key for the list's scroll position (restored on Back).
export const SCROLL_KEY = 'gt7-list-scroll';

export function saveListScroll() {
  try {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  } catch {
    /* sessionStorage unavailable */
  }
}

// Allowed page sizes for the list, and the default.
export const PAGE_SIZES = [5, 10, 25] as const;
export const DEFAULT_PAGE_SIZE = 25;

// The list view's state, encoded in the URL query so it survives navigating to a
// tune's detail page and back (and is shareable).
export interface ListState {
  search: string;
  sort: SortMode;
  filters: string[];
  pp: PpRange | null;
  page: number;
  size: number;
  view: ViewMode;
}

const SORTS: SortMode[] = ['newest', 'pp-desc', 'pp-asc', 'rating'];

// Parse "min-max" (e.g. "700-950") into a PpRange, or null if absent/invalid.
function parsePp(raw: string | null): PpRange | null {
  if (!raw) return null;
  const m = raw.match(/^(\d+)-(\d+)$/);
  if (!m) return null;
  const min = parseInt(m[1], 10);
  const max = parseInt(m[2], 10);
  return min <= max ? { min, max } : null;
}

export function decodeState(search: string): ListState {
  const p = new URLSearchParams(search);
  const sort = p.get('sort');
  const f = p.get('f');
  const page = parseInt(p.get('page') || '1', 10);
  const size = parseInt(p.get('size') || '', 10);
  return {
    search: p.get('q') ?? '',
    sort: SORTS.includes(sort as SortMode) ? (sort as SortMode) : 'newest',
    filters: f ? f.split(',').map(decodeURIComponent).filter(Boolean) : [],
    pp: parsePp(p.get('pp')),
    page: Number.isFinite(page) && page > 0 ? page : 1,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
    view: p.get('view') === 'compact' ? 'compact' : 'detailed',
  };
}

// Returns a query string (with leading "?") or "" when everything is default.
export function encodeState(s: ListState): string {
  const p = new URLSearchParams();
  if (s.search) p.set('q', s.search);
  if (s.sort !== 'newest') p.set('sort', s.sort);
  if (s.filters.length) p.set('f', s.filters.map(encodeURIComponent).join(','));
  if (s.pp) p.set('pp', `${s.pp.min}-${s.pp.max}`);
  if (s.size !== DEFAULT_PAGE_SIZE) p.set('size', String(s.size));
  if (s.view !== 'detailed') p.set('view', s.view);
  if (s.page > 1) p.set('page', String(s.page));
  const str = p.toString();
  return str ? `?${str}` : '';
}
