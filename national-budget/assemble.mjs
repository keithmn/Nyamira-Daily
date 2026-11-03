// Put data.json into page.src.html and write kenya-budget.html (one self-contained page).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const d = readFileSync(join(HERE, 'data.json'), 'utf8');
JSON.parse(d);
const safe = d.replaceAll('</', '<\\/');
const s = readFileSync(join(HERE, 'page.src.html'), 'utf8').replaceAll('__DATA__', () => safe);
writeFileSync(join(HERE, 'kenya-budget.html'), s);
console.log('wrote kenya-budget.html', Buffer.byteLength(s), 'bytes');
