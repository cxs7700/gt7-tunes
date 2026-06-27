# Service-worker image caching under a project Pages base path

**Goal:** Don't re-download the ~4000 tune images on every visit; lazy-load and
cache them.

**Approach:**
- **Lazy-load:** native `loading="lazy"` (+ `decoding="async"`) on card covers
  and gallery thumbnails. In a static export with `images.unoptimized`,
  `next/image` adds no resizing/srcset, so native lazy-loading is the simpler,
  equivalent solution.
- **Cache:** a hand-written service worker (`public/sw.js`) with a CacheFirst
  strategy for `*/images/*.webp`, capped at 700 entries (FIFO-trimmed).

**Base-path gotchas:**
- A service worker only controls its own directory and below. Serve it at
  `/<basePath>/sw.js` and register with `scope: '/<basePath>/'` so it controls
  the whole app. The SW file sits at the scope root, so no
  `Service-Worker-Allowed` header is needed.
- Cache keys are the full image URLs, which include the base path
  (`/gt7-tunes/images/...`). The fetch handler matches on `pathname` containing
  `/images/...webp`, so it works for both production and PR-preview base paths.
- Registration path is built from `BASE_PATH` (`lib/basePath.ts`), so PR previews
  (different base path) register and scope correctly too.

**Verification:** after first load the cache holds the visible images; after a
reload, **every** image response is `fromServiceWorker()` (zero network).
