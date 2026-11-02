import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { headers } from './integrations/headers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const preview = process.env.KBE_PREVIEW_BUILD === '1';
const site = process.env.KBE_SITE_URL || undefined;
if (process.argv.includes('build') && !site && !preview) throw new Error('Set KBE_SITE_URL for a public build, or KBE_PREVIEW_BUILD=1 for a preview.');

// Static and light. Every stylesheet and script stays a file, so the content security policy can stay strict (DESIGN.md).
export default defineConfig({
  site,
  base: process.env.KBE_BASE || '/',
  trailingSlash: 'always',
  compressHTML: true,
  build: { format: 'directory', inlineStylesheets: 'never' },
  integrations: [headers()],
  vite: {
    build: { assetsInlineLimit: 0 },
    define: { __KBE_DATA__: JSON.stringify(join(root, 'data/national')), __KBE_MAIN_DATA__: JSON.stringify(join(root, 'src/data')), __KBE_PREVIEW__: JSON.stringify(preview) },
  },
});
