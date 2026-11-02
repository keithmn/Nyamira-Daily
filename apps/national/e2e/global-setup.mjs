// Builds the two versions the tests look at: a preview with /dev/ in dist, and a production build in dist-prod.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const astro = join(app, '..', '..', 'node_modules', 'astro', 'bin', 'astro.mjs');

function build(env, args = []) {
  const { status, stderr, stdout } = spawnSync(process.execPath, [astro, 'build', ...args], { cwd: app, env: { ...process.env, ...env }, encoding: 'utf8' });
  if (status !== 0) throw new Error(`Build failed:\n${stdout}\n${stderr}`);
}

export default function setup() {
  build({ KBE_PREVIEW_BUILD: '1', KBE_SITE_URL: '' });
  build({ KBE_PREVIEW_BUILD: '', KBE_SITE_URL: 'https://example.invalid' }, ['--outDir', 'dist-prod']);
}
