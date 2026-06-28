import type { Post, PpRange } from './types';
import { categorize } from './categorize';
import { canonicalOf } from './tagMerge';
import { derivePp } from './derive';

// Faceted counts for the filter modal. For each chip tag, returns how many posts
// would match if it were selected, given the currently-staged selections in
// OTHER categories. A category's own selections do NOT shrink its own counts
// (standard faceting), mirroring getFiltered's "OR within a category, AND
// across categories" semantics. With nothing staged, this equals the global
// per-tag counts.
export function facetCounts(
  posts: Post[],
  staged: Set<string>,
  tagCategoryOf: Record<string, string>,
  pp?: PpRange | null,
): Map<string, number> {
  const catOf = (t: string) => tagCategoryOf[t] ?? categorize(t);

  // Group staged tags by category.
  const byCat: Record<string, string[]> = {};
  for (const t of staged) (byCat[catOf(t)] ??= []).push(t);
  const stagedCats = Object.keys(byCat);

  // Each post's canonical tags, computed once. PP is a separate range dimension
  // that constrains every category's base (like an always-"other" group).
  const canonPosts = posts.map((p) => p.tags.map(canonicalOf));
  const ppOk = posts.map((p) => {
    if (!pp) return true;
    const v = derivePp(p);
    return v != null && v >= pp.min && v <= pp.max;
  });

  const counts = new Map<string, number>();
  const allCats = new Set(Object.values(tagCategoryOf));

  for (const cat of allCats) {
    // Base = posts matching every staged group EXCEPT this category's own.
    const otherGroups = stagedCats.filter((c) => c !== cat).map((c) => byCat[c]);
    for (let i = 0; i < posts.length; i++) {
      if (!ppOk[i]) continue;
      const canon = canonPosts[i];
      if (!otherGroups.every((g) => g.some((t) => canon.includes(t)))) continue;
      // Tally each distinct tag of this category present in the post.
      const seen = new Set<string>();
      for (const ct of canon) {
        if (seen.has(ct) || catOf(ct) !== cat) continue;
        seen.add(ct);
        counts.set(ct, (counts.get(ct) ?? 0) + 1);
      }
    }
  }
  return counts;
}
