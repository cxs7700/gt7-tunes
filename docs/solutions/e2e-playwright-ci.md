# Playwright e2e against the real static export (CI)

**Goal.** Stop hand-running the same Playwright smoke checks on every PR; gate CI
with them instead.

**Key choices.**

- **Test what ships.** The suite runs against the built `out/` served under the
  real base path `/gt7-tunes/` (a tiny dependency-free `scripts/serve-out.mjs`),
  not `next dev`. This mirrors GitHub Pages and catches base-path / trailing-slash
  / export-only bugs that dev mode hides. `playwright.config.ts` points `baseURL`
  at the server's origin and tests use absolute `/gt7-tunes/...` paths.

- **Build first, serve only.** The Playwright `webServer` just serves `out/`;
  CI runs `npm run build` before `npm run test:e2e`. Locally, build once then
  `npm run test:e2e` (the server auto-starts, `reuseExistingServer` off in CI).

- **Browser provisioning.** Pin `@playwright/test` to the same version as the
  dev container's pre-installed browsers (1.56.1) so local runs use
  `/opt/pw-browsers` via `PLAYWRIGHT_BROWSERS_PATH`. CI has no such cache, so the
  workflow runs `npx playwright install --with-deps chromium` to fetch the
  matching build.

**Gotcha caught immediately.** The first facet test staged a `700PP` chip — but
PP became a slider, so that chip no longer exists and the test hung. That's
exactly the point of the suite: it pins behavior so a later change can't silently
drift the UI. Fixed by staging a Drivetrain chip instead.

**Coverage.** home loads (no page errors), search, PP-desc sort ordering, modal
faceting + apply, PP range slider, list-state restore on Back, rapid-tap
pagination, lightbox dots, favorites persistence + Saved view.
