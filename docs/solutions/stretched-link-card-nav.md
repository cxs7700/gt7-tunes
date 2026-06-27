# Whole-card navigation without nested anchors

**Problem:** The whole tune card should navigate to `/tune/[id]` on click, but the
card also contains an "Open on Patreon" link. Wrapping the card in a `next/link`
(`<a>`) and putting the Patreon `<a>` inside creates invalid nested anchors.

**Fix (stretched-link pattern):**
- Card is `position: relative`.
- A `next/link` overlay (`.card-overlay-link`) is `position: absolute; inset: 0;
  z-index: 1` — it covers the whole card and is the click target for navigation.
- The Patreon `<a>` is `position: relative; z-index: 2`, so it sits above the
  overlay and receives its own clicks. They're siblings, not nested — valid HTML.

**Why it works:** the overlay and the Patreon button are independent elements;
the topmost element at the click point wins. No JS click handling or
`stopPropagation` is needed, and the card stays a real crawlable `<a>`.

**Verification:** Playwright — clicking the card body navigates to
`/gt7-tunes/tune/<id>/` with **0 popups** (no new tab, no Patreon nav); the
Patreon button is `target="_blank"` to `patreon.com`.
