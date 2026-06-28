import type { Post, FilterState } from './types';
import { categorize } from './categorize';
import { canonicalOf } from './tagMerge';
import { derivePp, deriveStars } from './derive';

// Pure filter+sort, ported from the original app:
//   - within a category: OR (match any selected tag)
//   - across categories: AND (must match each category that has a selection)
//   - full-text search over title + body + tags
//   - sort by newest (source order), PP (desc/asc), or rating
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
    filtered = filtered.filter((p) => {
      // Match against canonical tags so a merged chip matches any variant.
      const canon = p.tags.map(canonicalOf);
      return groups.every((g) => g.some((t) => canon.includes(t)));
    });
  }

  if (state.pp) {
    const { min, max } = state.pp;
    filtered = filtered.filter((p) => {
      const v = derivePp(p);
      return v != null && v >= min && v <= max;
    });
  }

  const q = state.search.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((p) => {
      const text = `${p.title} ${p.body} ${p.tags.join(' ')}`.toLowerCase();
      return text.includes(q);
    });
  }

  filtered = [...filtered];
  // Array.sort is stable, so ties keep the source (newest-first) order. Posts
  // missing the sort key sink to the bottom.
  if (state.sort === 'pp-desc') {
    filtered.sort((a, b) => (derivePp(b) ?? -1) - (derivePp(a) ?? -1));
  } else if (state.sort === 'pp-asc') {
    filtered.sort((a, b) => (derivePp(a) ?? Infinity) - (derivePp(b) ?? Infinity));
  } else if (state.sort === 'rating') {
    filtered.sort((a, b) => (deriveStars(b) ?? -1) - (deriveStars(a) ?? -1));
  } // 'newest' keeps source order (data is newest-first)
  return filtered;
}
