// The county registry's master check (decision #105). Loads the national and county registries together, so county
// figures can cite national sources and an id can never be used twice, then adds the checks only the county needs.
//   node scripts/county/check-county.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRegistry, readRegistry, staleSources } from '@kbe/engine/registry';
import { parseCsv } from '@kbe/engine/csv';
import { budgetFigures, historyFigures, quarterFigures } from './build-figures.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const COUNTY = join(root, 'data/county/nyamira');
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const PBB = 'ke.fy2025-26.estimates.county.nyamira';

export function loadAll() {
  const national = readRegistry(join(root, 'data/national'));
  const county = readRegistry(COUNTY);
  const countyIds = new Set(county.rawFigures.map((r) => r.figure.id));
  const reg = buildRegistry({ rawSources: [...national.rawSources, ...county.rawSources], rawFigures: [...national.rawFigures, ...county.rawFigures] });
  return { ...reg, countyIds, countySources: county.rawSources.map((s) => s.id) };
}

// Each vote's printed programme rows must add up to its printed totals in Tables 8, 12 and 19. The engine only checks
// that rows listed `within` a total do not exceed it.
export function programmeSums(figures) {
  const problems = [];
  const structure = read('data/county/nyamira/structure-2025-26.json');
  for (const v of structure.votes) {
    for (const [suffix, table] of [['', 'Table 8'], ['.recurrent', 'Table 12'], ['.development', 'Table 19']]) {
      const printed = figures.get(`${v.figure}${suffix}`)?.value ?? 0;
      const row = new RegExp(`^${PBB.replace(/\./g, '\\.')}\\.programme\\.${v.vote}\\.p\\d+\\.r\\d+${suffix.replace('.', '\\.')}$`);
      const rows = [...figures.values()].filter((f) => row.test(f.id));
      const sum = rows.reduce((a, f) => a + f.value, 0);
      if (sum !== printed) problems.push(`Vote ${v.vote} (${v.name}): Table 9 rows add to ${sum}${suffix ? ` ${suffix.slice(1)}` : ''}, ${table} prints ${printed}`);
    }
    for (const p of v.programmes) for (const r of p.rows) if (r.figure && !figures.has(r.figure)) problems.push(`Vote ${v.vote}: structure names ${r.figure}, which is not in the registry`);
  }
  return problems;
}

// programmes.csv carries the hand-typed names; its amounts must match the machine reading of Table 9 row for row.
export function secondReading() {
  const dir = join(root, 'data-src/county/nyamira/pbb-2025-26');
  const typed = parseCsv(readFileSync(join(dir, 'programmes.csv'), 'utf8'));
  const reading = parseCsv(readFileSync(join(dir, 'table9-reading.csv'), 'utf8')).filter((r) => !/^\s*(\|\s*)?(total|totals|sub-total)\b/i.test(r.text) && !(/^[\s|]*$/.test(r.text) && Number(r.total) >= 1e9));
  const problems = [];
  if (typed.length !== reading.length) problems.push(`programmes.csv has ${typed.length} rows, the reading of Table 9 has ${reading.length}`);
  typed.forEach((t, i) => {
    const r = reading[i];
    if (!r) return;
    for (const k of ['vote', 'recurrent', 'development', 'total', 'pdf_page']) if (t[k] !== r[k]) problems.push(`programmes.csv row ${i + 1} (vote ${t.vote}, row ${t.row}): ${k} is ${t[k]}, the reading says ${r[k]}`);
    if (Number(t.recurrent) + Number(t.development) !== Number(t.total)) problems.push(`programmes.csv row ${i + 1}: recurrent and development do not add to the total`);
  });
  return problems;
}

// The JSON files must be exactly what the builder makes from today's CSVs.
export function generatedInStep() {
  const problems = [];
  const same = (file, data) => { if (readFileSync(join(COUNTY, file), 'utf8') !== JSON.stringify(data, null, 2) + '\n') problems.push(`${file} is out of step with its CSV: run node scripts/county/build-figures.mjs`); };
  const { file, structure } = budgetFigures();
  same('figures/pbb-2025-26.json', file);
  same('structure-2025-26.json', structure);
  same('figures/cob-history.json', historyFigures());
  same('figures/bir-2025-26-q4.json', quarterFigures());
  return problems;
}

// The Q4 report measures spending against the printed estimates. Each department's budget in it must match the
// Programme Based Budget, within the KSh 1 the documents round by.
export function quarterMatchesBudget(figures) {
  const problems = [];
  const Q4 = 'ke.fy2025-26.spent.county.nyamira.q4';
  for (const f of figures.values()) {
    const m = f.id.match(/^ke\.fy2025-26\.spent\.county\.nyamira\.q4\.(?:vote\.(\d{4})\.)?(recurrent|development|total)\.target$/);
    if (!m) continue;
    // A vote's total has no suffix; the county's own totals are .total, .recurrent and .development.
    const pbb = m[1] ? `${PBB}.vote.${m[1]}${m[2] === 'total' ? '' : `.${m[2]}`}` : `${PBB}.${m[2]}`;
    const printed = figures.get(pbb)?.value ?? 0;
    if (Math.abs(printed - f.value) > 1) problems.push(`${f.id} is ${f.value}; the Programme Based Budget prints ${printed} (${pbb})`);
  }
  if (![...figures.keys()].some((id) => id.startsWith(`${Q4}.vote.`))) problems.push('No Q4 department figures loaded');
  return problems;
}

// While pages still read money.json and budget-sectors.json, every number in them must match the registry.
export function legacyAgrees(figures) {
  const problems = [];
  const money = read('src/data/money.json');
  const key = { budget: 'budget', spent: 'spent', dev: 'dev-spent', rec: 'rec-spent', devAbs: 'dev-absorption', osrTarget: 'osr-target', osr: 'osr-actual', eqShare: 'equitable-share', pending: 'pending-bills' };
  const eqIs = Object.fromEntries(parseCsv(readFileSync(join(root, 'data-src/county/nyamira/cob-history/history.csv'), 'utf8')).map((r) => [r.fy, r.eqShareIs]));
  for (const y of money.years) {
    for (const [col, field] of Object.entries(key)) {
      if (y[col] == null) continue;
      const k = col === 'eqShare' ? `${field}-${eqIs[y.fy]}` : field;
      const id = `ke.fy${y.fy.replace('/', '-')}.spent.county.nyamira.${k}`;
      const f = figures.get(id);
      if (!f) { problems.push(`money.json ${y.fy} ${col} (${y[col]}) has no registry figure ${id}`); continue; }
      // money.json rounds FY2024/25's totals from section 3.34; the registry holds Table 2.5's unrounded figures.
      const tol = y.fy === '2024/25' && ['budget', 'spent', 'dev'].includes(col) ? 10 : 0;
      if (Math.abs(f.value - y[col]) > tol) problems.push(`money.json ${y.fy} ${col} is ${y[col]}, the registry has ${f.value} (${id})`);
    }
  }
  const sectors = read('src/data/budget-sectors.json');
  const swapped = { 5280: '5282', 5282: '5280' }; // budget-sectors.json follows Table 17; the registry follows Tables 9, 11 and 12
  for (const d of sectors.departments) {
    const V = `${PBB}.vote.${swapped[d.vote] ?? d.vote}`;
    for (const [field, suffix] of [['total', ''], ['recurrent', '.recurrent'], ['development', '.development'], ['compensation', '.compensation'], ['operations', '.operations']]) {
      const got = figures.get(V + suffix)?.value ?? 0;
      if (got !== d[field]) problems.push(`budget-sectors.json ${d.vote} ${d.short} ${field} is ${d[field]}, the registry has ${got} (${V + suffix})`);
    }
  }
  return problems;
}

export function checkCounty() {
  const reg = loadAll();
  const problems = [
    ...reg.problems.filter((p) => [...reg.countyIds].some((id) => p.includes(id)) || reg.countySources.some((s) => p.includes(s))),
    ...programmeSums(reg.figures), ...secondReading(), ...generatedInStep(), ...legacyAgrees(reg.figures), ...quarterMatchesBudget(reg.figures),
  ];
  const stale = staleSources(new Map(reg.countySources.map((id) => [id, reg.sources.get(id)]).filter(([, s]) => s)), new Date().toISOString().slice(0, 10));
  return { problems, stale, figures: reg.countyIds.size };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { problems, stale, figures } = checkCounty();
  for (const s of stale) console.warn(`Overdue: ${s.id} expected a newer document by ${s.date}: ${s.what}`);
  if (problems.length) { for (const p of problems) console.error(p); console.error(`${problems.length} problems`); process.exit(1); }
  console.log(`County registry: ${figures} figures, all checks pass.`);
}
