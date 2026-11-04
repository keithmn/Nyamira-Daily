// Nyamira's money year by year, FY2013/14 to the latest Controller of Budget report, built from the figure registry
// (decision #105). Same shape as the years in the old src/data/money.json, so pages change only their import, except
// the equitable share: money.json's one column mixed the allocation and the amount received, so there are two here.
// Values are KSh million, except devAbs (per cent). A value the report does not give is null, never 0.
import { fig, maybe, notes } from './county-registry.js';

export const FIRST_FY = '2013/14';
export const LAST_FY = '2025/26';

export function fiscalYears(first = FIRST_FY, last = LAST_FY) {
  const out = [];
  for (let y = Number(first.slice(0, 4)); y <= Number(last.slice(0, 4)); y++) out.push(`${y}/${String(y + 1).slice(2)}`);
  return out;
}

const FIELDS = {
  budget: 'budget', spent: 'spent', dev: 'dev-spent', rec: 'rec-spent', devAbs: 'dev-absorption',
  osrTarget: 'osr-target', osr: 'osr-actual', eqAllocated: 'equitable-share-allocated', eqReceived: 'equitable-share-received', pending: 'pending-bills',
};
const base = (fy) => `ke.fy${fy.replace('/', '-')}.spent.county.nyamira`;
const idOf = (fy, field) => `${base(fy)}.${FIELDS[field]}`;

export function moneyYear(fy) {
  const y = { fy };
  for (const field of Object.keys(FIELDS)) y[field] = maybe(idOf(fy, field));
  const spent = fig(idOf(fy, 'spent'));
  y.src = spent.doc.url;
  y.page = spent.page;
  y.source = spent.doc.title;
  const osr = y.osr != null ? fig(idOf(fy, 'osr')) : null;
  const fif = maybe(`${base(fy)}.osr-fif-actual`);
  y.osrNote = osr?.note ?? (fif != null ? `Includes ${fif}M hospital fees (FIF).` : null);
  y.pendingNote = y.pending != null ? fig(idOf(fy, 'pending')).note ?? null : null;
  y.eqNote = [y.eqAllocated, y.eqReceived].some((v) => v != null) ? fig(idOf(fy, y.eqReceived != null ? 'eqReceived' : 'eqAllocated')).note ?? null : null;
  return y;
}

// The registry id behind one value, for pages that cite figure by figure.
export const figureId = idOf;

const money = { updated: notes.updated, unit: 'KSh million', note: notes.note, caveats: notes.caveats, years: fiscalYears().map(moneyYear) };
export default money;
