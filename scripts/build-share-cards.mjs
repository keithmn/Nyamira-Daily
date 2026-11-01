// Ward share cards (decision #80): one 1200x630 PNG per ward, used as the WhatsApp/Facebook/X preview of each ward
// page. Output: public/brand/share/ward-<slug>.png. Run after the ward data changes:
//   node scripts/build-share-cards.mjs
// Needs Playwright with Chromium (npm i -D playwright && npx playwright install chromium); it is not a site
// dependency, and the PNGs are committed so the site build does not need it. The headline figure is the ward's
// FY2025/26 budgeted project total, exactly as the ward page computes it, with its evidence label and source.
// The logo is the brand-kit SVG, unchanged. Optional: shrink the PNGs afterwards (the committed ones were reduced
// to a 64-colour palette, about 25 KB each, with Python Pillow: Image.open(f).convert('RGB').quantize(64)).
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sumAmounts } from '../src/lib/project-amounts.js';
import { ksh } from '../src/lib/fmt.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url));
const wards = JSON.parse(read('src/data/wards.json'));
const projects = JSON.parse(read('src/data/wardspend.json')).projects;
const font = (f) => `data:font/woff2;base64,${read(`public/brand/fonts/${f}`).toString('base64')}`;
const logo = `data:image/svg+xml;base64,${read('public/brand/Nyamira-Daily_horizontal_full-colour.svg').toString('base64')}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function headline(slug) {
  const lines = projects.filter((p) => p.ward === slug && p.fy === '2025/26' && p.kind === 'budgeted');
  const amount = lines.length ? sumAmounts(lines.map((p) => p.amount)) : null;
  if (amount == null) return null;
  const zero = lines.filter((p) => p.amount === 0).length;
  // Wards whose lines are mostly printed as KSh 0 (Nyansiongo, Nyamaiya) carry that caveat on the card itself.
  const note = zero ? `${zero} of ${lines.length} budget lines are printed as KSh 0 in the budget` : '';
  return { value: ksh(amount), text: 'budgeted for ward projects in 2025/26', note, label: 'Official claim', source: 'County Programme Based Budget 2025/26, Table 18' };
}

function html(w) {
  const h = headline(w.slug);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: LS; font-weight: 500; src: url(${font('LeagueSpartan-Medium.woff2')}); }
@font-face { font-family: LS; font-weight: 700; src: url(${font('LeagueSpartan-Bold.woff2')}); }
@font-face { font-family: VR; src: url(${font('VarelaRound-Latin.woff2')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #FFFFFF; color: #111111; font-family: LS, sans-serif; position: relative; overflow: hidden; }
.logo { position: absolute; top: 56px; left: 72px; height: 58px; }
.main { position: absolute; left: 72px; right: 72px; top: 170px; }
.eyebrow { font-size: 30px; font-weight: 500; color: #45474a; letter-spacing: 0.5px; }
h1 { font-family: VR, sans-serif; font-weight: 400; font-size: 96px; line-height: 1.05; margin-top: 8px; }
.fig { margin-top: 34px; display: flex; align-items: baseline; gap: 18px; flex-wrap: wrap; }
.num { font-family: VR, sans-serif; font-size: 64px; }
.say { font-size: 34px; font-weight: 500; }
.note { margin-top: 14px; font-size: 26px; font-weight: 500; color: #45474a; }
.foot { position: absolute; left: 72px; right: 72px; bottom: 48px; display: flex; align-items: center; gap: 16px; font-size: 24px; color: #45474a; }
.label { background: #eeeeec; color: #45474a; border-radius: 999px; padding: 6px 18px; font-weight: 500; white-space: nowrap; }
.strip { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; background: #1FD07A; }
</style></head><body>
<img class="logo" src="${logo}" alt="">
<div class="main">
  <div class="eyebrow">${esc(w.subCounty)} Constituency · Nyamira County</div>
  <h1>${esc(w.name)} Ward</h1>
  ${h ? `<div class="fig"><span class="num">${esc(h.value)}</span><span class="say">${esc(h.text)}</span></div>${h.note ? `<div class="note">${esc(h.note)}</div>` : ''}`
      : '<div class="fig"><span class="say">Projects, services and leaders, with a source for every figure</span></div>'}
</div>
<div class="foot">${h ? `<span class="label">${esc(h.label)}</span><span>${esc(h.source)}</span>` : '<span>Ward receipt</span>'}</div>
<div class="strip"></div>
</body></html>`;
}

async function main() {
  const { chromium } = await import('playwright');
  const out = `${root}public/brand/share`;
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const w of wards) {
    await page.setContent(html(w), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    writeFileSync(`${out}/ward-${w.slug}.png`, await page.screenshot({ type: 'png' }));
  }
  await browser.close();
  console.log(`Wrote ${wards.length} cards to public/brand/share/`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
