# GT7 Tunes

A fast, static, single-page browser for a collection of **Gran Turismo 7** car
tunes. It renders ~1,000 tune posts (car setup notes + screenshots) with
full-text search and categorized filtering — no backend, no build step required.

## What's in the repo

| Path              | Purpose                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| `index.html`      | The whole app — markup, styles, and logic. Holds **no data**.          |
| `data/posts.json` | **The source of truth.** One JSON array of every tune. Never rendered into HTML. |
| `images/`         | Locally-hosted post screenshots (WebP), referenced by `data/posts.json`. |

The data lives entirely in `data/posts.json`, kept separate from the app so it
stays a clean, reusable, diff-friendly source of truth. `index.html` fetches it
at runtime — editing the page never risks touching the data, and vice versa.

## Viewing it

Because the page fetches `data/posts.json`, it needs to be served over HTTP
(opening `index.html` straight from disk via `file://` blocks the fetch).

```bash
# From the repo root:
python3 -m http.server 8000
# then open http://localhost:8000/
```

If you only have the files locally and don't want to run a server, open
`index.html` anyway — when the automatic load fails it shows a drop zone, and
you can **drag `data/posts.json` onto the page** to load it.

### Hosting (GitHub Pages)

This is a plain static site, so GitHub Pages works out of the box: enable Pages
for the repository (Settings → Pages → deploy from branch), and the site is live
— no build step.

## Search & filtering

The toolbar has a **full-text search** box (matches title, body, and tags) plus
**sort** (newest / oldest / title). Below it, tags are organized into collapsible
filter categories instead of one long flat list:

- **PP** — performance-point brackets (350PP … 950PP), sorted numerically
- **Class** — Gr1–Gr4, GrB, VGT, F1, Super Formula, NASCAR, etc.
- **Drivetrain** — FF, FR, MR, RR, 4WD
- **Track** — Nürburgring, Le Mans, Spa, Route X, …
- **Make / Brand** — car manufacturers and tuners (collapsed by default; it's long)
- **Rating** — star ratings
- **Setup** — swap, BOP, and other setup notes

Each chip shows how many tunes carry that tag. Filter logic:

- **Within a category** selections are **OR** — e.g. picking `600PP` and `700PP`
  shows tunes at either bracket.
- **Across categories** selections are **AND** — e.g. `700PP` + `Ferrari` shows
  only 700PP Ferraris.

Search combines with the active filters, and **Clear filters** resets everything.
Click any screenshot to open the lightbox (arrow keys / `Esc` to navigate).

## Updating the data

`data/posts.json` is an array of post objects. Each object has the shape:

```json
{
  "id": "161626685",
  "title": "Peugeot 9X8 '25 Gr1 - 4WD - WEC SPECS - Racing Hard Tires - All Track - 1.70",
  "date": "Jun 20, 2026",
  "body": "Setup notes…",
  "url": "https://www.patreon.com/.../161626685",
  "tags": ["4WD", "Gr1", "Peugeot", "WEC specs"],
  "imageUrls": ["images/cw-.../001-.../01.webp", "..."]
}
```

- `id` is used for deduplication; posts are shown in array order (newest first).
- `tags` drive the filter chips. New tags appear automatically; their category is
  decided by the rules in the `categorize()` function near the top of the script
  in `index.html`. Anything not matched by an explicit rule falls into
  **Make / Brand**. To recategorize a tag, edit the sets there — the data file is
  never modified by the app.
- `imageUrls` should be repo-relative paths under `images/`.

To add or edit tunes, change `data/posts.json` directly. No build step or
regeneration is needed — reload the page.
