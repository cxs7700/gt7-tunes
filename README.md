# GT7 Tunes

A fast browser for a collection of **Gran Turismo 7** car tunes — ~1,000 tune
posts (setup notes + screenshots) with categorized filtering and full-text
search. Built with **Next.js (App Router)** and exported to fully static files
for GitHub Pages.

## Stack

- **Next.js 14** App Router + TypeScript, `output: 'export'` (no server — pure
  static HTML/JS/CSS).
- Hosted on **GitHub Pages** at base path `/gt7-tunes/`.
- `data/posts.json` is the **canonical source of truth**, read at build time and
  never mutated. All derived data (tag categories, filters) lives in `lib/`.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/` | Routes: `layout.tsx`, `page.tsx` (home), `globals.css` (the design). |
| `components/` | React components (`HomeClient`, …). |
| `lib/` | `posts.ts` (build-time data read), `types.ts`, `categorize.ts`, `filter.ts`, `basePath.ts`. |
| `data/posts.json` | Canonical tune data (source of truth). |
| `public/images/` | Local post screenshots (WebP), referenced by `data/posts.json`. |
| `scripts/validate-data.mjs` | Read-only CI gate (ids unique, images present). |
| `docs/solutions/` | Compound-engineering learnings (one note per gotcha solved). |
| `.github/workflows/` | `deploy.yml` (build → Pages), `pr-preview.yml` (per-PR preview). |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000/gt7-tunes
npm run build      # static export → ./out
npm run validate-data
```

To preview the production export exactly as Pages serves it (under the base
path), serve `out/` from a parent dir so the app lives at `/gt7-tunes/`:

```bash
mkdir -p /tmp/site && ln -s "$PWD/out" /tmp/site/gt7-tunes
(cd /tmp/site && python3 -m http.server 8000)   # open http://localhost:8000/gt7-tunes/
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the static
export and publishes it to GitHub Pages.

> **One-time setup:** in repo **Settings → Pages → Source**, select
> **"GitHub Actions"** (instead of "Deploy from a branch"). The site is then
> served from the workflow build.

Every pull request gets a live preview at
`https://cxs7700.github.io/gt7-tunes/pr-preview/pr-<N>/` (built with a per-PR
base path), removed automatically when the PR closes.

## Filtering

Tags are grouped into categories — **PP, Class, Drivetrain, Track, Make/Brand,
Rating, Setup, Other** — with **OR within a category, AND across categories**,
combined with full-text search. Categorization (incl. an explicit GT7 `MAKES`
allow-list) lives in `lib/categorize.ts`; the data file is never modified.

## Logo

The header shows `public/logo.svg` if present, otherwise it falls back to the
"GT7 Tunes" wordmark. To use a custom logo, drop an SVG (or update `BrandLogo` to
point at a PNG) at `public/logo.svg`. Make sure you have the rights to any logo
you add — game/brand logos are trademarked.

## Background image

The app shows `public/background.jpg` behind a semi-transparent black overlay
(see `.app-bg` in `globals.css` and the inline overlay in `app/layout.tsx`). If
the file is absent it falls back to the solid dark background. Drop a
`background.jpg` into `public/` to use one (make sure you have the rights to it).
Adjust the overlay opacity in `layout.tsx` to taste.

## Updating tunes

Edit `data/posts.json` (array of `{ id, title, date, body, url, tags,
imageUrls }`) and add images under `public/images/`. New tags are categorized
automatically; add new GT7 brands to `MAKES` in `lib/categorize.ts`. Run
`npm run validate-data` to check integrity, then rebuild.
