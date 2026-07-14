import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Accessibility gate: no serious/critical WCAG 2 A/AA violations on the key
// surfaces. Runs axe-core against the real static export.
const scan = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page }).options({ runOnly: ['wcag2a', 'wcag2aa'] }).analyze();

const serious = (violations: Awaited<ReturnType<typeof scan>>['violations']) =>
  violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');

const summary = (violations: Awaited<ReturnType<typeof scan>>['violations']) =>
  JSON.stringify(
    serious(violations).map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length })),
    null,
    2,
  );

for (const [name, path] of [
  ['home', '/gt7-tunes/'],
  ['detail', '/gt7-tunes/tune/161626685/'],
  ['tag page', '/gt7-tunes/tag/porsche/'],
] as const) {
  test(`no serious a11y violations: ${name}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const { violations } = await scan(page);
    expect(serious(violations), summary(violations)).toEqual([]);
  });
}

test('no serious a11y violations: filters modal open', async ({ page }) => {
  await page.goto('/gt7-tunes/', { waitUntil: 'networkidle' });
  await page.click('.controls-toggle');
  await page.click('.more-filters-btn');
  await expect(page.locator('.modal')).toBeVisible();
  const { violations } = await scan(page);
  expect(serious(violations), summary(violations)).toEqual([]);
});
