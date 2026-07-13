# OG/Twitter cards, sitemap & robots on a static export under a base path

**Goal.** Shared tune links should unfurl into rich cards (image + title), and
every tune should be indexable.

**Gotchas solved.**

- **Absolute URLs must include the base path.** OG images and sitemap `<loc>`s
  must be absolute, and the site lives under `/gt7-tunes`. `lib/site.ts` composes
  `SITE_URL = SITE_ORIGIN + BASE_PATH`, so the deploy build emits the real
  production URLs and PR previews emit their own. `metadataBase` is set to
  `new URL(\`${SITE_URL}/\`)` so relative metadata URLs resolve correctly.
- **next/image auto-prefixes base path; metadata does NOT.** `openGraph.images`
  / `twitter.images` are resolved against `metadataBase`, not the router base
  path — always build them with `absoluteUrl()`.
- **Per-tune cards for free.** `generateMetadata` already runs per tune, so the
  cover screenshot (`post.imageUrls[0]`) becomes the OG/Twitter image and the
  body's first ~155 chars the description. `alternates.canonical` points at the
  tune's own URL.
- **sitemap.ts / robots.ts need `export const dynamic = 'force-static'`** to be
  emitted as static files under `output: 'export'`. They land at
  `out/sitemap.xml` and `out/robots.txt`.
- **Project-page caveat.** On a GitHub *project* page the domain root
  (`user.github.io/robots.txt`) isn't ours, so the generated
  `/gt7-tunes/robots.txt` has limited crawler effect — submit
  `/gt7-tunes/sitemap.xml` to Search Console directly. The per-page OG/meta is
  where most of the value is.

**Verify:** grep the built `out/**/index.html` for `og:image` / `twitter:card`,
and confirm `out/sitemap.xml` lists every `/tune/<id>/`.
