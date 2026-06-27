// Merge duplicate-variant tags for the FILTER UI only. The data file is never
// changed — this just collapses spelling/case variants into one canonical chip,
// and a selected canonical matches a post tagged with ANY of its variants.
//
// Add new groups here as variants appear in the data (canonical label -> variants).
const GROUPS: Record<string, string[]> = {
  Nordschleife: ['Nordschleife', 'nordschleife', 'Nordschleiffe'],
  Suzuka: ['Suzuka', 'suzuka'],
  SWAP: ['SWAP', 'swap'],
};

const VARIANT_TO_CANONICAL: Record<string, string> = {};
for (const [canonical, variants] of Object.entries(GROUPS)) {
  for (const v of variants) VARIANT_TO_CANONICAL[v] = canonical;
}

// Returns the canonical tag for any variant (or the tag itself if not a variant).
export function canonicalOf(tag: string): string {
  return VARIANT_TO_CANONICAL[tag] ?? tag;
}
