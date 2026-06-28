import type { Post } from './types';
import { categorize } from './categorize';
import { canonicalOf } from './tagMerge';
import { derivePp } from './derive';

interface Facets {
  make: string | null;
  drivetrain: string | null;
  classes: Set<string>;
  tracks: Set<string>;
}

function facetsOf(post: Post): Facets {
  const f: Facets = { make: null, drivetrain: null, classes: new Set(), tracks: new Set() };
  for (const t of post.tags) {
    const c = categorize(t);
    if (c === 'Make / Brand') f.make ??= t;
    else if (c === 'Drivetrain') f.drivetrain ??= t;
    else if (c === 'Class') f.classes.add(canonicalOf(t));
    else if (c === 'Track') f.tracks.add(canonicalOf(t));
  }
  return f;
}

// Tunes most like `target`: same make/class/drivetrain, close on PP, shared
// track. Computed at build time on the detail page (server). Returns up to
// `limit`, most similar first; only posts with some relation.
export function relatedPosts(target: Post, all: Post[], limit = 6): Post[] {
  const t = facetsOf(target);
  const tpp = derivePp(target);
  const scored: { p: Post; score: number }[] = [];

  for (const p of all) {
    if (p.id === target.id) continue;
    const o = facetsOf(p);
    let score = 0;
    if (t.make && o.make === t.make) score += 3;
    if (t.drivetrain && o.drivetrain === t.drivetrain) score += 2;
    for (const c of t.classes) {
      if (o.classes.has(c)) {
        score += 2;
        break;
      }
    }
    const opp = derivePp(p);
    if (tpp != null && opp != null) {
      const d = Math.abs(tpp - opp);
      if (d === 0) score += 2;
      else if (d <= 50) score += 1;
    }
    for (const tr of t.tracks) {
      if (o.tracks.has(tr)) {
        score += 1;
        break;
      }
    }
    if (score > 0) scored.push({ p, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}
