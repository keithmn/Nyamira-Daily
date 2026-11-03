// Adds interface text to both dictionaries from one file of pairs, so English and Kiswahili never drift apart. A key that
// already exists is replaced. Kiswahili lines stay marked for a native speaker's review (decision #87).
//   node scripts/national/add-i18n.mjs path/to/pairs.json      where pairs.json is { "key": ["English", "Kiswahili"] }
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'apps/national/src/i18n');
const pairs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
['en', 'sw'].forEach((lang, i) => {
  const file = join(dir, `${lang}.json`), dict = JSON.parse(readFileSync(file, 'utf8'));
  for (const [key, both] of Object.entries(pairs)) {
    if (!Array.isArray(both) || both.length !== 2) throw new Error(`${key} needs [English, Kiswahili]`);
    dict[key] = both[i];
  }
  writeFileSync(file, `${JSON.stringify(dict, null, 2)}\n`);
});
console.log(`${Object.keys(pairs).length} keys in both dictionaries`);
