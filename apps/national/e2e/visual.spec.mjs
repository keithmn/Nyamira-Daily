// Saved pictures of the key components, at phone and desktop width, light and dark. Run `npm run test:national:visual`, and
// add `-- --update-snapshots` after a deliberate change. Laptop only: fonts render differently on other systems.
import { expect, test } from '@playwright/test';

const SHOTS = [['/', '.hero', 'home-hero'], ['/dev/components/', '#figures', 'figure-cards'], ['/dev/components/', '#stages', 'stages'], ['/dev/components/', '#money', 'ksh100'], ['/dev/components/', '#ranked', 'ranked-bars'], ['/dev/components/', '#years', 'years']];

for (const [width, height] of [[390, 844], [1280, 800]]) {
  for (const scheme of ['light', 'dark']) {
    for (const [path, target, name] of SHOTS) {
      test(`${name}, ${width}, ${scheme}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
        await page.goto(path);
        await page.evaluate(async () => {
          await document.fonts.ready;
          // The sticky bars would otherwise land on top of whatever part of the page is being pictured
          for (const bar of ['.top', '.tabs']) document.querySelector(bar).style.position = 'static';
        });
        await expect(page.locator(target)).toHaveScreenshot(`${name}-${width}-${scheme}.png`);
      });
    }
  }
}
