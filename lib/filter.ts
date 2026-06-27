import type { Post, FilterState } from './types';
import { categorize } from './categorize';

// Pure filter+sort, ported from the original app:
//   - within a category: OR (match any selected tag)
//   - across categories: AND (must match each category that has a selection)
//   - full-text search over title + body + tags
//   - sort by newest (source order) / oldest (reversed) / title
export function getFiltered(
  posts: Post[],
  state: FilterState,
  tagCategoryOf: Record<string, string>,
): Post[] {
  let filtered = posts;

  if (state.activeFilters.size) {
    const byCat: Record<string, string[]> = {};
    for (const t of state.activeFilters) {
      const c = tagCategoryOf[t] ?? categorize(t);
      (byCat[c] ??= []).push(t);
    }
    const groups = Object.values(byCat);
    filtered = filtered.filter((p) =>
      groups.every((g) => g.some((t) => p.tags.includes(t))),
    );
  }

  const q = state.search.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((p) => {
      const text = `${p.title} ${p.body} ${p.tags.join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  }

  filtered = [...filtered];
  if (state.sort === 'oldest') {
    filtered.reverse();
  } else if (state.sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } // 'newest' keeps source order (data is newest-first)
  return filtered;
}
