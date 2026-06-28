import type { Post } from './types';
import { categorize } from './categorize';

// Derived (computed) post metadata. The source of truth is data/posts.json and
// the tags within it; this module only *reads* tags (and, for ratings, the body)
// to surface numbers/headline specs the UI needs for sorting and spec chips.
// Nothing here mutates the data. This is the keystone the sort, spec-chip, and
// (future) facet/range features build on.

// Numeric Performance Points from a post's PP tag (e.g. "700PP" -> 700).
export function derivePp(post: Post): number | null {
  for (const t of post.tags) {
    if (categorize(t) === 'PP') {
      const m = t.match(/\d{3,4}/);
      if (m) return parseInt(m[0], 10);
    }
  }
  return null;
}

// Star rating (1–5). Prefer an explicit Rating tag; fall back to the body, where
// Praiano's posts reliably open with e.g. "5 STARS CAR SETUP". This lifts
// coverage from ~25% (tags only) to ~91%.
export function deriveStars(post: Post): number | null {
  for (const t of post.tags) {
    const m = t.match(/^(\d+)\s*stars?$/i);
    if (m) return clampStars(parseInt(m[1], 10));
  }
  const b = post.body.match(/(\d+)\s*stars?\b/i);
  if (b) return clampStars(parseInt(b[1], 10));
  return null;
}

function clampStars(n: number): number | null {
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

// Headline specs shown as prominent chips on cards/detail, in a fixed order.
// Each is the post's own tag for that category (the first one if several).
export const SPEC_CATEGORIES = ['PP', 'Class', 'Drivetrain', 'Rating'] as const;
export type SpecKind = (typeof SPEC_CATEGORIES)[number];

export interface Spec {
  kind: SpecKind;
  label: string;
}

export function headlineSpecs(post: Post): Spec[] {
  const byKind = new Map<SpecKind, string>();
  for (const t of post.tags) {
    const c = categorize(t) as SpecKind;
    if ((SPEC_CATEGORIES as readonly string[]).includes(c) && !byKind.has(c)) {
      byKind.set(c, t.trim());
    }
  }
  return SPEC_CATEGORIES.filter((c) => byKind.has(c)).map((c) => ({
    kind: c,
    label: byKind.get(c)!,
  }));
}
