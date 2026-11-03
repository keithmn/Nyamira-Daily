// Writes a route's English and Kiswahili page files, which only wrap one view component (SITEMAP.md: every route has a twin).
//   node scripts/national/new-route.mjs /tools/your-taxes/ YourTaxesPage taxes.title
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [route, view, titleKey] = process.argv.slice(2);
if (!route?.startsWith('/') || !route.endsWith('/') || !view || !titleKey) throw new Error('Usage: new-route.mjs /path/ ViewName title.key');
const pages = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'apps/national/src/pages');
for (const lang of ['en', 'sw']) {
  const dir = join(pages, lang === 'sw' ? 'sw' : '', route);
  const up = '../'.repeat(route.split('/').filter(Boolean).length + (lang === 'sw' ? 1 : 0) + 1);
  const file = join(dir, 'index.astro');
  if (existsSync(file)) { console.log(`kept ${file}`); continue; }
  mkdirSync(dir, { recursive: true });
  const attrs = lang === 'sw' ? ' lang="sw"' : '';
  writeFileSync(file, `---\nimport View from '${up}components/pages/${view}.astro';\nimport { t } from '${up}i18n/index.js';\nimport Base from '${up}layouts/Base.astro';\n---\n<Base${attrs} path="${route}" title={t('${lang}', '${titleKey}')}><View${attrs} /></Base>\n`);
  console.log(`wrote ${file}`);
}
