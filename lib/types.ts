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

export type SortMode = 'newest' | 'oldest' | 'title';

export interface FilterState {
  search: string;
  sort: SortMode;
  activeFilters: Set<string>;
}
