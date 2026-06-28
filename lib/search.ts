import type { Post } from './types';

// Weighted, typo-tolerant full-text scoring. Each whitespace-separated query
// term must match somewhere (AND across terms); a term scores by where it hits
// (title > tags > body), with a small bonus for a title prefix. If a term has no
// exact substring hit it falls back to fuzzy (edit distance ≤ 1) word matching,
// so "porshe" still finds "Porsche". Returns null when any term fails to match.

// Edit distance ≤ 1 (insert / delete / substitute), with cheap early exits.
export function withinEditDistance1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  if (la > lb) return withinEditDistance1(b, a); // make `a` the shorter one
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (la === lb) {
      i++;
      j++;
    } else {
      j++; // insertion in the longer string
    }
  }
  if (i < la || j < lb) edits++; // leftover trailing char
  return edits <= 1;
}

function fuzzyWordMatch(text: string, term: string): boolean {
  for (const w of text.split(/[^a-z0-9]+/)) {
    if (w.length >= 3 && withinEditDistance1(w, term)) return true;
  }
  return false;
}

export function scorePost(post: Post, terms: string[]): number | null {
  const title = post.title.toLowerCase();
  const tags = post.tags.join(' ').toLowerCase();
  const body = post.body.toLowerCase();
  let total = 0;
  for (const term of terms) {
    let s = 0;
    if (title.includes(term)) {
      s = 10;
      if (title.startsWith(term)) s += 3;
    } else if (tags.includes(term)) {
      s = 6;
    } else if (body.includes(term)) {
      s = 2;
    } else if (term.length >= 4) {
      if (fuzzyWordMatch(title, term)) s = 5;
      else if (fuzzyWordMatch(tags, term)) s = 3;
      else if (fuzzyWordMatch(body, term)) s = 1;
    }
    if (s === 0) return null; // every term must match
    total += s;
  }
  return total;
}

export function queryTerms(q: string): string[] {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}
