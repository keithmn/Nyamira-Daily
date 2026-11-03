// End-of-phase screenshots at 390 and 1280, light and dark (build brief, section 10). Run by hand against a preview:
//   node e2e/phase-shots.mjs <outDir> <baseUrl> /path/ [/path/ ...]
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const [out, base, ...paths] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
for (const path of paths) {
  const name = path.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home';
  for (const width of [390, 1280]) {
    for (const scheme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto(base + path);
      await page.screenshot({ path: join(out, `${name}-${width}-${scheme}.png`), fullPage: true });
      await page.close();
    }
  }
  console.log(name);
}
await browser.close();
