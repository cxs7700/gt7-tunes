import { defineConfig } from '@playwright/test';

const PORT = 4173;

// Runs the e2e suite against the real static export served under /gt7-tunes/
// (mirrors GitHub Pages). Build `out/` first (`npm run build`); the webServer
// only serves it.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'node scripts/serve-out.mjs',
    url: `http://localhost:${PORT}/gt7-tunes/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
