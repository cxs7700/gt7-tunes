// Mirrors data/posts.json exactly. This file is the canonical source of truth
// and is never mutated by the app — all derived data lives in other lib modules.
export interface Post {
  id: string;
  title: string;
  date: string;
  body: string;
  url: string;
  tags: string[];
  imageUrls: string[];
}

export interface TagEntry {
  tag: string;
  count: number;
}

export type Categorized = Record<string, TagEntry[]>;

// Newest is the default (data is stored newest-first). PP/rating sorts read the
// derived metadata in lib/derive.ts.
export type SortMode = 'newest' | 'pp-desc' | 'pp-asc' | 'rating';

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'pp-desc', label: 'PP: High → Low' },
  { value: 'pp-asc', label: 'PP: Low → High' },
  { value: 'rating', label: 'Highest rated' },
];

export type ViewMode = 'detailed' | 'compact';

export interface FilterState {
  search: string;
  sort: SortMode;
  activeFilters: Set<string>;
}
