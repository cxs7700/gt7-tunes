# Restoring list state + scroll on Back (static export)

**Goal:** After opening a tune and pressing Back, the list must show the same
filters/search/sort and the same scroll position.

**Why the naive version fails:** App Router remounts the home page on Back, so
in-memory React state is lost (filters reset). And if filters are applied in a
post-mount `useEffect`, the first paint shows the *unfiltered* layout, so any
scroll restore targets the wrong height and lands in the wrong place.

**Fix:**
1. **State in the URL.** Encode `q`/`sort`/`f` (filters) into the query string
   (`lib/urlState.ts`), updated via `router.replace(..., { scroll: false })`.
   On Back the browser restores that URL, so the state is recoverable.
2. **Initialize synchronously from the URL** in the `useState` initializers
   (client reads `window.location.search`; server returns defaults). This makes
   the **first** client paint already filtered, so layout/height are correct.
3. **Mount gate** to avoid a hydration mismatch: render an empty shell until
   `mounted` is true (server HTML and first client render are state-independent
   and identical), then render the URL-derived state in one go.
4. **Scroll:** capture `window.scrollY` at card-click time (`saveListScroll`),
   not via a continuous listener — otherwise the detail page's scroll-to-top
   overwrites it before navigation. On Back, restore with a short retry loop
   (`requestAnimationFrame` until it sticks) and set
   `history.scrollRestoration = 'manual'` so the browser doesn't fight it.

**Verification:** filter → scroll to 2000 → open a tune → Back ⇒ filters
restored (chip active, correct count) and `scrollY === 2000` (delta 0).

**Trade-off:** the home list is now client-rendered (not in the prerendered
HTML). Acceptable for this interactive, client-filtered view; per-tune detail
pages remain fully prerendered.
