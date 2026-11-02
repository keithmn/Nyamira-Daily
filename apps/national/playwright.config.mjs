import { defineConfig } from '@playwright/test';

// Uses the Chrome already on the machine, so installing the repo downloads no browser. `site` runs on every pull request.
// `visual` compares against saved pictures, which differ between operating systems, so it runs on the laptop only.
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.mjs',
  fullyParallel: true,
  reporter: [['list', { printSteps: false }]],
  webServer: { command: 'node e2e/serve.mjs', port: 4310, reuseExistingServer: true },
  use: { baseURL: 'http://127.0.0.1:4310', channel: 'chrome' },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  projects: [
    { name: 'site', testMatch: 'site.spec.mjs' },
    { name: 'visual', testMatch: 'visual.spec.mjs' },
  ],
});
