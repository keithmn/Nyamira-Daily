// Photographs every infographic card into public/img/infographics/<lang>/<slug>-<format>.png and writes a manifest with the
// data release they show. Run by hand after a data release, against a preview of the current build, then build again:
//   npm run build -w @kbe/national && npx astro preview --port 4321   (in another terminal)
//   node e2e/infographics.mjs http://localhost:4321
// The browser checks fail while the manifest's release is older than the registry's, so a stale picture cannot ship.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp'; // installed with Astro, which uses it for images
import { release } from '../src/lib/figures.js';
import { FORMATS, allInfographics, imagePath } from '../src/lib/infographics.js';

const base = process.argv[2] ?? 'http://localhost:4321';
const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const browser = await chromium.launch({ channel: 'chrome' });
const files = [];
for (const lang of ['en', 'sw']) {
  for (const g of allInfographics(lang)) {
    for (const [format, size] of Object.entries(FORMATS)) {
      const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1, colorScheme: 'light' });
      await page.goto(`${base}${lang === 'sw' ? '/sw' : ''}/infographics/${g.slug}/card/${format}/`);
      await page.evaluate(() => document.fonts.ready);
      const out = join(pub, imagePath(g.slug, format, lang));
      mkdirSync(dirname(out), { recursive: true });
      // Flat colours and text: a 32-colour palette keeps the text sharp at a third of the size
      await sharp(await page.locator('[data-ig]').screenshot()).png({ palette: true, colors: 32, effort: 10, compressionLevel: 9 }).toFile(out);
      files.push(imagePath(g.slug, format, lang));
      await page.close();
    }
  }
  console.log(`${lang}: done`);
}
await browser.close();
writeFileSync(join(pub, 'img/infographics/manifest.json'), `${JSON.stringify({ release, files }, null, 1)}\n`);
console.log(`${files.length} pictures for release ${release}`);
