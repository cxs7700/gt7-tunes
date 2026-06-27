# Base path under GitHub Pages project sites

**Problem:** The site is served at `/gt7-tunes/`, not `/`. Anything that builds a
URL by hand (raw `<img src>`, the lightbox `src`, fetches) will 404 because it
won't include the base path. PR previews are served at a *different* base
(`/gt7-tunes/pr-preview/pr-<N>/`), so the base path can't be hardcoded.

**Fix:**
- `next.config.mjs` reads `BASE_PATH` (default `/gt7-tunes`) and sets `basePath`,
  `assetPrefix`, and exposes it as `NEXT_PUBLIC_BASE_PATH`.
- `next/link`, `next/image`, and `next/script` prepend `basePath` automatically.
- For **raw `<img>`/hand-built URLs**, route through `lib/basePath.ts`
  `withBasePath()` (skips absolute `http(s)`/`data:` URLs).
- PR preview workflow builds with `BASE_PATH=/gt7-tunes/pr-preview/pr-<N>` so the
  preview's assets resolve; production build keeps `/gt7-tunes`.
- `trailingSlash: true` so deep links like `/tune/<id>/` serve
  `out/tune/<id>/index.html` and survive refresh on Pages.

**Verification:** Serve `out/` under a `/gt7-tunes/` prefix locally and confirm
images + chunks return 200 (the only 404 should be `/favicon.ico`).

**Why:** Static export has no server to rewrite paths; the browser resolves
hand-built relative/absolute URLs against the origin root unless the base path is
included explicitly.
