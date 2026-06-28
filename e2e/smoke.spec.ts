import { test, expect } from '@playwright/test';

// Smoke coverage for the recurring flows that have regressed before — these were
// previously hand-run with Playwright on every PR; now they gate CI.
const HOME = '/gt7-tunes/';

// Filters / Sort / view / Saved live behind the "Options" toggle (collapsed by
// default). Open it before interacting with those controls.
async function openControls(page: import('@playwright/test').Page) {
  const toggle = page.locator('.controls-toggle');
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click();
    await expect(page.locator('.controls-panel')).toHaveClass(/open/);
  }
}

test('home loads all tunes with no page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(HOME);
  await expect(page.locator('.stats')).toContainText('of 1068 tunes');
  expect(errors).toEqual([]);
});

test('PWA manifest and icons are wired up', async ({ page, request }) => {
  await page.goto(HOME);
  const manifestHref = await page.getAttribute('link[rel="manifest"]', 'href');
  expect(manifestHref).toContain('/gt7-tunes/manifest.webmanifest');
  const res = await request.get(manifestHref!);
  expect(res.ok()).toBeTruthy();
  const m = await res.json();
  expect(m.name).toBe('GT7 Tunes');
  expect(m.start_url).toContain('/gt7-tunes/');
  expect(m.icons.length).toBeGreaterThanOrEqual(3);
  expect(await page.getAttribute('link[rel="apple-touch-icon"]', 'href')).toContain(
    '/gt7-tunes/apple-touch-icon.png',
  );
});

test('search narrows the result set', async ({ page }) => {
  await page.goto(HOME);
  await page.fill('#search', 'porsche');
  await expect(page.locator('.stats')).not.toContainText('1068 of');
  await expect(page.locator('.post-card').first()).toBeVisible();
});

test('search tolerates a typo (fuzzy match) and ranks the car first', async ({ page }) => {
  await page.goto(HOME);
  await page.fill('#search', 'porshe'); // missing the "c"
  await expect(page.locator('.post-card').first()).toBeVisible();
  await expect(page.locator('.post-card').first().locator('.post-title')).toContainText(/porsche/i);
});

test('sort PP high→low orders cards by PP descending', async ({ page }) => {
  await page.goto(HOME);
  await openControls(page);
  await page.selectOption('.sort-select select', 'pp-desc');
  await expect(page).toHaveURL(/sort=pp-desc/);
  const pps = await page.$$eval('.post-card .spec-chip.spec-pp', (els) =>
    els.map((e) => parseInt(e.textContent || '0', 10)),
  );
  expect(pps.length).toBeGreaterThan(0);
  for (let i = 1; i < pps.length; i++) expect(pps[i - 1]).toBeGreaterThanOrEqual(pps[i]);
});

test('filter modal shows faceted counts and applies', async ({ page }) => {
  await page.goto(HOME);
  await openControls(page);
  await page.click('.more-filters-btn');
  await expect(page.locator('.modal')).toBeVisible();
  // Nissan's count is read from the (collapsed) Make/Brand group; staging a
  // Drivetrain chip should facet it down.
  const nissan = page.locator('.chip', { hasText: 'Nissan' }).first().locator('.chip-count');
  await expect(nissan).toHaveText('76'); // global count
  await page.locator('.filter-group-header', { hasText: 'Drivetrain' }).click();
  await page.locator('.chip', { hasText: '4WD' }).first().click();
  await expect(nissan).not.toHaveText('76'); // faceted by the staged Drivetrain selection
  await page.click('.modal-footer .btn:not(.secondary)');
  await expect(page).toHaveURL(/f=4WD/);
  await expect(page.locator('.active-chip', { hasText: '4WD' })).toBeVisible();
});

test('PP range slider filters to the chosen range', async ({ page }) => {
  await page.goto(HOME);
  await openControls(page);
  await page.click('.more-filters-btn');
  await page.locator('.range-slider input[type=range]').first().fill('700');
  await page.click('.modal-footer .btn:not(.secondary)');
  await expect(page).toHaveURL(/pp=700-/);
  const pps = await page.$$eval('.post-card .spec-chip.spec-pp', (els) =>
    els.map((e) => parseInt(e.textContent || '0', 10)),
  );
  for (const v of pps) expect(v).toBeGreaterThanOrEqual(700);
});

test('list state is restored after visiting a tune and going back', async ({ page }) => {
  await page.goto(HOME);
  await openControls(page);
  await page.selectOption('.sort-select select', 'pp-desc');
  await page.locator('.card-overlay-link').first().click();
  await expect(page).toHaveURL(/\/tune\/\d+\//);
  await page.goBack();
  await expect(page).toHaveURL(/sort=pp-desc/);
  await openControls(page);
  await expect(page.locator('.sort-select select')).toHaveValue('pp-desc');
});

test('rapid Next taps advance the page indicator', async ({ page }) => {
  await page.goto(HOME);
  const next = page.locator('.list-footer .page-nav button', { hasText: 'Next' });
  for (let i = 0; i < 4; i++) await next.click();
  await expect(page.locator('.page-indicator')).toContainText('Page 5');
});

test('lightbox dots match the image count and track position', async ({ page }) => {
  await page.goto(HOME);
  await page.locator('.card-overlay-link').first().click();
  await expect(page).toHaveURL(/\/tune\/\d+\//);
  const imgs = page.locator('.detail-images img');
  const n = await imgs.count();
  test.skip(n < 2, 'needs a multi-image tune');
  await imgs.first().click();
  await expect(page.locator('.lightbox')).toBeVisible();
  await expect(page.locator('.lb-dot')).toHaveCount(n);
  await expect(page.locator('.lb-dot').first()).toHaveClass(/active/);
  await page.locator('.lightbox-nav.next').click();
  await expect(page.locator('.lb-dot').nth(1)).toHaveClass(/active/);
});

test('detail page shows a Similar tunes rail that navigates', async ({ page }) => {
  await page.goto(HOME);
  await page.locator('.card-overlay-link').first().click();
  await expect(page).toHaveURL(/\/tune\/\d+\//);
  const rail = page.locator('.related .related-card');
  await expect(rail.first()).toBeVisible();
  const before = new URL(page.url()).pathname;
  await rail.first().click();
  // Wait until we land on a *different* tune (the generic /tune/<id>/ regex
  // would otherwise match the page we started on).
  await page.waitForFunction(
    (b) => location.pathname !== b && /\/tune\/\d+\//.test(location.pathname),
    before,
  );
  expect(new URL(page.url()).pathname).not.toBe(before);
});

test('detail page Share button copies the tune URL', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(HOME);
  await page.locator('.card-overlay-link').first().click();
  await expect(page).toHaveURL(/\/tune\/\d+\//);
  const share = page.locator('.share-btn');
  await expect(share).toBeVisible();
  await share.click(); // no Web Share API in headless → clipboard fallback
  await expect(share).toContainText('Copied!');
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toContain('/tune/');
});

test('compare: pin two tunes and open the side-by-side modal', async ({ page }) => {
  await page.goto(HOME);
  const cards = page.locator('.post-card');
  await cards.nth(0).locator('.cmp-btn').click();
  await cards.nth(1).locator('.cmp-btn').click();
  await expect(page.locator('.compare-bar-label')).toContainText('2/3');
  await page.locator('.compare-bar .btn:not(.secondary)').click();
  await expect(page.locator('.compare-modal')).toBeVisible();
  await expect(page.locator('.compare-head')).toHaveCount(2);
  await expect(page.locator('.compare-label', { hasText: 'PP' })).toBeVisible();
  await page.locator('.compare-remove').first().click();
  await expect(page.locator('.compare-head')).toHaveCount(1);
});

test('favorites persist and the Saved view filters to them', async ({ page }) => {
  await page.goto(HOME);
  await page.locator('.post-card .card-fav').first().click();
  await openControls(page);
  await expect(page.locator('.saved-toggle')).toContainText('Saved (1)');
  await page.click('.saved-toggle');
  await expect(page).toHaveURL(/saved=1/);
  await expect(page.locator('.post-card')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('.post-card')).toHaveCount(1); // localStorage persisted
});
