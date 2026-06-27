# Merging duplicate-variant tags (UI only)

**Problem:** The data contains spelling/case variants of the same tag
(`Nordschleife`/`nordschleife`/`Nordschleiffe`, `Suzuka`/`suzuka`,
`SWAP`/`swap`), which showed up as separate filter chips. We must merge them in
the UI **without editing `data/posts.json`** (the source of truth).

**Fix:** `lib/tagMerge.ts` defines canonical groups (`canonical -> variants`) and
`canonicalOf(tag)` returns the canonical label for any variant.
- `buildCategorized` tallies counts by `canonicalOf(tag)`, so each group shows a
  single chip with the summed count and is categorized by its canonical form.
- `getFiltered` maps each post's tags through `canonicalOf` before matching, so a
  selected canonical chip matches a post tagged with **any** variant.

Selections (and the URL) therefore use canonical tokens.

**Verification:** chips show `Nordschleife [295]`, `Suzuka [12]`, `SWAP [233]`
(no variant duplicates); selecting `Nordschleife` returns 295 (sum of all
spellings); `git diff data/posts.json` is empty.

**Extending:** add a new entry to `GROUPS` in `lib/tagMerge.ts` when a new
variant appears. (A normalized case/whitespace fallback could be added later for
fully automatic trivial-dupe merging.)
