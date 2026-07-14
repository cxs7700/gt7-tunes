import type { Post } from './types';
import { canonicalOf } from './tagMerge';

// URL-safe slug for a tag. Computed over CANONICAL tags (see tagMerge), whose
// slugs are collision-free for this dataset.
export function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'tag';
}

export function canonicalTags(posts: Post[]): string[] {
  const s = new Set<string>();
  for (const p of posts) for (const t of p.tags) s.add(canonicalOf(t));
  return [...s];
}

export function tagForSlug(posts: Post[], slug: string): string | null {
  return canonicalTags(posts).find((t) => slugifyTag(t) === slug) ?? null;
}

// Tunes carrying a (canonical) tag, in source order (newest-first).
export function postsForTag(posts: Post[], tag: string): Post[] {
  return posts.filter((p) => p.tags.some((t) => canonicalOf(t) === tag));
}

export function tagHref(tag: string): string {
  return `/tag/${slugifyTag(canonicalOf(tag))}`;
}
