// The checks that say Phase 3 is done (build brief, section 10): axe, keyboard, phones, JavaScript off, weight and links.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { isPlanned } from '../src/lib/routes.js';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(app, 'dist'), prod = join(app, 'dist-prod');
const TEMPLATES = ['/', '/sw/', '/dev/components/', '/sw/dev/components/', '/budget/2026-27/', '/sw/budget/2026-27/', '/budget/2026-27/sectors/', '/budget/2026-27/sectors/health/', '/sw/budget/2026-27/sectors/health/', '/budget/2026-27/votes/1066/', '/budget/2026-27/votes/1066/0502000/', '/counties/', '/sw/counties/', '/counties/nyamira/', '/sw/counties/nyamira/', '/counties/nairobi-city/', '/counties/nyamira/sheet/', '/counties/compare/?c=nyamira,kisii', '/search/?q=tsc'];
const PAGES = [...TEMPLATES, '/no-such-page/'];
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p, out); else if (f.endsWith('.html')) out.push(p); } return out; };

async function open(page, path, { width = 390, height = 844, scheme = 'light' } = {}) {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
  await page.goto(path);
}

for (const path of PAGES) {
  for (const width of [320, 360, 390, 768, 1280]) {
    test(`no sideways scroll, ${path} at ${width}`, async ({ page }) => {
      await open(page, path, { width });
      const [content, view] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(content).toBeLessThanOrEqual(view);
    });
  }

  test(`no script errors or policy violations, ${path}`, async ({ page }) => {
    const problems = [];
    page.on('pageerror', (e) => problems.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) problems.push(m.text()); });
    await open(page, path);
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });
}

for (const path of TEMPLATES) {
  for (const width of [390, 1280]) {
    for (const scheme of ['light', 'dark']) {
      test(`axe, ${path} at ${width}, ${scheme}`, async ({ page }) => {
        await open(page, path, { width, scheme });
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target).join(' | ')}`)).toEqual([]);
      });
    }
  }

  test(`headings run in order, ${path}`, async ({ page }) => {
    await open(page, path);
    const levels = await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main h4')].map((h) => Number(h.tagName[1])));
    expect(levels[0]).toBe(1);
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    expect(levels.filter((l, i) => i && l > levels[i - 1] + 1)).toEqual([]);
  });

  test(`tap targets are at least 44px, ${path}`, async ({ page }) => {
    await open(page, path);
    const small = await page.evaluate(() => [...document.querySelectorAll('a, button, input, summary, select')]
      // A glossary term keeps its line height and takes its 44px from a ::after box, which getBoundingClientRect cannot see
      .filter((e) => !e.closest('.vh') && !e.classList.contains('skip') && !e.classList.contains('gt') && e.type !== 'radio')
      .map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && (r.height < 44 || r.width < 24))
      .map(({ e, r }) => `${e.tagName} ${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`));
    expect(small).toEqual([]);
  });
}

test.describe('with JavaScript off', () => {
  test.use({ javaScriptEnabled: false });

  test('the home page gives its number and a way to every county', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('h1')).toHaveText('KSh 4.82 trillion');
    await page.locator('summary', { hasText: 'All 47 counties' }).click();
    await expect(page.locator('.county-links a')).toHaveCount(47);
    await expect(page.locator('.county-links a', { hasText: 'Nyamira' })).toHaveAttribute('href', '/counties/nyamira/');
    await expect(page.locator('[data-county-input]')).toBeHidden();
  });

  test('every chart value is on the page', async ({ page }) => {
    await open(page, '/dev/components/');
    await expect(page.locator('.rb-val').first()).toBeVisible();
    await expect(page.locator('.k-pc').first()).toHaveText('KSh 31');
    await expect(page.locator('.lc')).toBeVisible();
  });

  test('a glossary term still opens', async ({ page }) => {
    await open(page, '/dev/components/');
    await page.locator('#furniture .gt').first().click();
    await expect(page.locator('#gt-eq')).toBeVisible();
  });
});

test('nothing that waits for a county shows before one is picked', async ({ page }) => {
  await open(page, '/');
  await expect(page.locator('[data-mc]')).toBeHidden();
  await expect(page.locator('[data-mc-link]')).toBeHidden();
  await expect(page.locator('[data-mc-title]')).toHaveText('My county');
  await open(page, '/dev/components/');
  await expect(page.locator('[data-mine-tag]:visible')).toHaveCount(0);
  await expect(page.locator('.rb-row.is-mine')).toHaveCount(0);
});

test('elements marked hidden really are, whatever their class sets', async ({ page }) => {
  await open(page, '/dev/components/');
  const shown = await page.evaluate(() => [...document.querySelectorAll('[hidden]')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.outerHTML.slice(0, 80)));
  expect(shown).toEqual([]);
});

test('the headline number fits one line on a phone, with its word smaller', async ({ page }) => {
  await open(page, '/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveText('KSh 4.82 trillion');
  await expect(h1.locator('small')).toHaveText('trillion');
  const [height, line] = await h1.evaluate((e) => [e.getBoundingClientRect().height, parseFloat(getComputedStyle(e).fontSize)]);
  expect(height).toBeLessThan(line * 1.6);
});

test('the theme control sits on one row', async ({ page }) => {
  await open(page, '/');
  const tops = await page.locator('[data-theme-control] label').evaluateAll((list) => list.map((l) => Math.round(l.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
});

test('the My county choice is remembered and follows the reader', async ({ page }) => {
  await open(page, '/');
  await page.locator('[data-county-input]').fill('nyamira');
  await expect(page.locator('[data-mc] .mc-num')).toHaveText('KSh 6.27 billion');
  await expect(page.locator('[data-mc]')).toContainText('up 3.2% on last year');
  await expect(page.locator('[data-mc]')).toContainText('59% of the FY2025/26 development budget was spent');
  await expect(page.locator('[data-chip]')).toHaveAttribute('aria-label', 'My county: Nyamira');
  await expect(page.locator('[data-chip]')).toHaveAttribute('href', '/counties/nyamira/');
  await page.goto('/dev/components/');
  await expect(page.locator('[data-chip]')).toHaveAttribute('aria-label', 'My county: Nyamira');
  await expect(page.locator('.rb-row.is-mine')).toHaveCount(1);
  await expect(page.locator('.rb-row.is-mine .tag')).toHaveText('Your county');
  await page.goto('/');
  await expect(page.locator('[data-county-input]')).toHaveValue('Nyamira');
  await expect(page.locator('[data-mc-title]')).toHaveText('My county: Nyamira');
});

test('the county card speaks Kiswahili on the Kiswahili page', async ({ page }) => {
  await open(page, '/sw/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
  await expect(page.locator('h1')).toHaveText('KSh trilioni 4.82');
  await page.locator('[data-county-input]').fill('Nyamira');
  await expect(page.locator('[data-mc] .mc-num')).toHaveText('KSh bilioni 6.27');
  await expect(page.locator('[data-chip]')).toHaveAttribute('href', '/sw/counties/nyamira/');
});

test('the language link goes to the twin page', async ({ page }) => {
  await open(page, '/dev/components/');
  await page.locator('.lang-link').click();
  await expect(page).toHaveURL('/sw/dev/components/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
});

test('tooltips open by keyboard and close with Escape', async ({ page }) => {
  await open(page, '/dev/components/', { width: 1280 });
  const row = page.locator('#ranked .rb-row').first();
  await row.focus();
  await expect(page.locator('#tip')).toBeVisible();
  await expect(page.locator('#tip')).toHaveText('KSh 784.5 billion');
  await expect(row).toHaveAttribute('aria-describedby', 'tip');
  await page.keyboard.press('Escape');
  await expect(page.locator('#tip')).toBeHidden();
});

test('a tooltip survives the scroll that focus causes', async ({ page }) => {
  await open(page, '/dev/components/');
  await page.locator('#money .k-row').last().focus();
  await page.waitForTimeout(100);
  await expect(page.locator('#tip')).toBeVisible();
});

test('the line chart is one tab stop, moved by arrow keys', async ({ page }) => {
  await open(page, '/dev/components/', { width: 1280 });
  await page.locator('[data-trend]').focus();
  const last = await page.locator('#tip').textContent();
  expect(last).toContain('2024/25');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#tip')).toContainText('2023/24');
  await expect(page.locator('.lc .p.on')).toHaveCount(1);
});

test('a table sorts by its raw numbers, and says which way', async ({ page }) => {
  await open(page, '/dev/components/', { width: 1280 });
  const firstCounty = page.locator('#tables tbody tr').first().locator('td').nth(1);
  const share = page.locator('#tables thead th').nth(2);
  await share.locator('button').click();
  await expect(share).toHaveAttribute('aria-sort', 'ascending');
  await expect(firstCounty).toHaveText('Lamu');
  await share.locator('button').click();
  await expect(share).toHaveAttribute('aria-sort', 'descending');
  await expect(firstCounty).toHaveText('Nairobi City');
});

test('copying a citation reports through the status line', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await open(page, '/dev/components/', { width: 1280 });
  await page.locator('#figures .cite summary').first().click();
  await page.locator('#figures .cite [data-copy]').first().click();
  await expect(page.locator('#status')).toHaveText('Citation copied.');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('ke.fy2026-27.estimates.debt.interest');
  expect(copied).toContain('Kenya Budget Explained');
});

test('the theme choice is remembered, and Phone follows the device', async ({ page }) => {
  await open(page, '/');
  await page.locator('[data-theme-control] label', { hasText: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('[data-theme-control] label', { hasText: 'Phone' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
});

test('the CSV a table links to is a real file with its source', async ({ request }) => {
  const res = await request.get('/data/county-equitable-share-2026-27.csv');
  expect(res.status()).toBe(200);
  const lines = (await res.text()).trim().split('\n');
  expect(lines).toHaveLength(48);
  expect(lines.find((l) => l.includes('Nyamira'))).toContain('6265653089');
  expect(lines[0]).toContain('figure_id');
});

// The usability tasks from the brief, walked with taps on a phone screen. These prove the paths exist and how many taps
// they take. They do not replace the rounds with real readers (build brief, section 9).
test.describe('the journeys, tap by tap, at 390px', () => {
  test('task 1: a county\'s share and last year\'s development spending, within 3 taps', async ({ page }) => {
    await open(page, '/');
    await page.locator('.tabs a', { hasText: 'Counties' }).click();
    await page.locator('table a', { hasText: 'Nyamira' }).click();
    await expect(page).toHaveURL('/counties/nyamira/');
    await expect(page.locator('.hero-num')).toHaveText('KSh 6.27 billion');
    const spent = page.locator('.mycounty .fig-num');
    await expect(spent).toHaveText('59%');
    await expect(spent).toBeInViewport();
    await expect(page.locator('.hero-num')).toBeInViewport();
  });

  test('task 2: the interest bill and its share of revenue, in one tap', async ({ page }) => {
    await open(page, '/');
    await page.locator('.tabs a', { hasText: 'Budget' }).click();
    await expect(page).toHaveURL('/budget/2026-27/');
    const card = page.locator('.fig', { hasText: 'interest on public debt' });
    await expect(card.locator('.fig-num')).toHaveText('KSh 1.25 trillion');
    await expect(card).toContainText('KSh 42 of every KSh 100 of ordinary revenue');
  });

  test('task 3: a sector, this year against last, and its table to download', async ({ page, request }) => {
    await open(page, '/');
    await page.locator('.tabs a', { hasText: 'Budget' }).click();
    await page.locator('.rb a', { hasText: 'Health' }).click();
    await expect(page).toHaveURL('/budget/2026-27/sectors/health/');
    await expect(page.locator('h1')).toHaveText('Health');
    await expect(page.locator('.hero-line')).toContainText('27.6% more than last year');
    const csv = page.locator('.tbl-csv');
    await expect(csv).toBeVisible();
    const res = await request.get(await csv.getAttribute('href'));
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('State Department for Medical Services');
  });

  test('task 4: copy a question, from the county page', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await open(page, '/counties/kisumu/');
    await page.locator('.qc [data-copy]').first().click();
    await expect(page.locator('#status')).toHaveText('Question copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Which projects were not started');
  });

  test('task 5: Share is on the county page\'s first screen and carries the figure and source', async ({ page }) => {
    await open(page, '/counties/nyamira/');
    const share = page.locator('.hero a.btn', { hasText: 'Share on WhatsApp' });
    await expect(share).toBeInViewport();
    const text = decodeURIComponent(await share.getAttribute('href'));
    expect(text).toContain('Nyamira gets KSh 6.27 billion as its equitable share in FY2026/27, up 3.2% on FY2025/26.');
    expect(text).toContain('County Allocation of Revenue Act, 2026');
    expect(text).toContain('/counties/nyamira/');
  });
});

test('every county has its page and sheet, in both languages', () => {
  for (const root of [dist, join(dist, 'sw')]) {
    const counties = readdirSync(join(root, 'counties')).filter((d) => d !== 'compare' && statSync(join(root, 'counties', d)).isDirectory());
    expect(counties).toHaveLength(47);
    for (const c of counties) expect(existsSync(join(root, 'counties', c, 'sheet', 'index.html'))).toBe(true);
  }
});

test('every vote and programme has its page', () => {
  const votes = join(dist, 'budget/2026-27/votes'), codes = readdirSync(votes);
  expect(codes).toHaveLength(87);
  const programmes = codes.flatMap((c) => readdirSync(join(votes, c)).filter((d) => statSync(join(votes, c, d)).isDirectory()));
  expect(programmes).toHaveLength(201);
});

test('/budget/ sends the reader to the current year', async ({ page }) => {
  await open(page, '/budget/');
  await expect(page).toHaveURL('/budget/2026-27/');
});

test('the Budget and Counties tabs mark where the reader is', async ({ page }) => {
  await open(page, '/budget/2026-27/votes/1066/');
  await expect(page.locator('.tabs a[aria-current]')).toHaveText('Budget');
  await open(page, '/counties/nyamira/');
  await expect(page.locator('.tabs a[aria-current]')).toHaveText('Counties');
});

test('breadcrumbs lead back up from a programme', async ({ page }) => {
  await open(page, '/budget/2026-27/votes/1066/0502000/');
  await expect(page.locator('.crumbs li')).toHaveText(['Home', 'Budget', 'Education', 'State Department for Basic Education', 'Secondary Education']);
  await page.locator('.crumbs a', { hasText: 'Basic Education' }).click();
  await expect(page).toHaveURL('/budget/2026-27/votes/1066/');
});

test('a county without affirmative action shows no such line, and no row is blank', async ({ page }) => {
  await open(page, '/counties/nairobi-city/');
  await expect(page.locator('table').first()).not.toContainText('Affirmative action');
  await expect(page.locator('.hero-title')).toHaveText('Nairobi City County');
  await expect(page.locator('body')).not.toContainText('NaN');
  await expect(page.locator('body')).not.toContainText('undefined');
});

test('compare reads the link, follows the picks and keeps them in the link', async ({ page }) => {
  await open(page, '/counties/compare/?c=nyamira,kisii');
  await expect(page.locator('[data-compare-table] thead th')).toHaveText(['Measure', 'Nyamira', 'Kisii']);
  await expect(page.locator('[data-compare-table] tbody tr').first()).toContainText('KSh 6.27 billion');
  await page.locator('#c3').selectOption('bomet');
  await expect(page).toHaveURL('/counties/compare/?c=nyamira,kisii,bomet');
  await page.locator('[data-compare-set]').click();
  await expect(page.locator('[data-compare-table] thead th')).toHaveText(['Measure', 'Nyamira', 'Kisii', 'Bomet', 'Kericho']);
});

test('search finds a short name and goes to the page', async ({ page }) => {
  await open(page, '/');
  await page.locator('.search-box input').fill('TSC');
  await page.locator('.search-box button').click();
  await expect(page).toHaveURL('/search/?q=TSC');
  await page.locator('.results a', { hasText: 'Teachers Service Commission' }).first().click();
  await expect(page).toHaveURL('/budget/2026-27/votes/2091/');
});

test('Make this my county sets the chip', async ({ page }) => {
  await open(page, '/counties/kisii/');
  await page.locator('[data-set-county]').click();
  await expect(page.locator('[data-chip]')).toHaveAttribute('aria-label', 'My county: Kisii');
  await open(page, '/counties/');
  await expect(page.locator('tr.is-mine')).toContainText('Kisii');
});

test('the print sheet fits one A4 page, and its QR code points at the county', async ({ page, browserName }) => {
  await open(page, '/counties/nyamira/sheet/', { width: 794, height: 1123 });
  await expect(page.locator('.sheet-qr svg')).toBeVisible();
  await expect(page.locator('.sheet-qs li')).toHaveCount(2);
  await expect(page.locator('.sheet-nums > div')).toHaveCount(5);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.sheet-tools')).toBeHidden();
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(height).toBeLessThanOrEqual(1123);
  expect(browserName).toBe('chromium');
});

for (const path of ['/', '/sw/', '/budget/2026-27/', '/budget/2026-27/sectors/governance-justice-law-order/', '/budget/2026-27/votes/1071/', '/counties/', '/counties/compare/', '/counties/nyamira/', '/sw/counties/nyamira/']) {
  test(`weight stays within budget, ${path}`, () => {
    const file = join(dist, path, 'index.html'), html = readFileSync(file);
    const assets = [...html.toString().matchAll(/(?:href|src)="(\/_astro\/[^"]+\.(css|js))"/g)];
    const size = (kind) => assets.filter((a) => a[2] === kind).reduce((n, a) => n + gzipSync(readFileSync(join(dist, a[1]))).length, 0);
    const parts = { html: gzipSync(html).length, css: size('css'), js: size('js') };
    expect(parts.html).toBeLessThan(60 * 1024);
    expect(parts.css).toBeLessThan(12 * 1024);
    expect(parts.js).toBeLessThan(10 * 1024);
    expect(parts.html + parts.css + parts.js).toBeLessThan(120 * 1024);
  });
}

test('the stylesheet and script are files, and only hashed inline scripts exist', () => {
  for (const file of walk(dist)) {
    const html = readFileSync(file, 'utf8');
    expect(html).not.toMatch(/<style[\s>]/);
    expect(html).not.toMatch(/\son[a-z]+="/);
  }
  const headers = readFileSync(join(dist, '_headers'), 'utf8');
  expect(headers.match(/'sha256-/g).length).toBeGreaterThan(0);
});

test('every internal link is built or planned', () => {
  const broken = new Set();
  for (const file of walk(dist)) {
    for (const [, link] of readFileSync(file, 'utf8').matchAll(/href="(\/[^"#?]*)/g)) {
      if (link.startsWith('/_astro/')) continue;
      const target = join(dist, link);
      const built = existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
      if (!built && !isPlanned(link)) broken.add(link);
    }
  }
  expect([...broken]).toEqual([]);
});

test('a production build leaves out /dev/, and carries canonical and hreflang links', () => {
  expect(existsSync(join(prod, 'dev'))).toBe(false);
  expect(existsSync(join(prod, 'sw', 'dev'))).toBe(false);
  const home = readFileSync(join(prod, 'index.html'), 'utf8');
  expect(home).toContain('rel="canonical" href="https://example.invalid/"');
  expect(home).toContain('hreflang="sw" href="https://example.invalid/sw/"');
  expect(home).toContain('hreflang="x-default"');
  expect(home).not.toContain('noindex');
  expect(readFileSync(join(dist, 'index.html'), 'utf8')).toContain('noindex');
});
