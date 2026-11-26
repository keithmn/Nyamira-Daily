// Data freshness metadata: every dataset, its last-checked date, next expected refresh, and source count.
// A monitoring cron, Datasette, or a dashboard reads this to know what's stale.
import money from '../../lib/county-money.js';
import { notes as registryNotes } from '../../lib/county-registry.js';
import L from '../../data/leaders.json' with { type: 'json' };
import wardsRaw from '../../data/wards.json' with { type: 'json' };
import wards from '../../data/wards.js';
import contracts from '../../data/contracts.json' with { type: 'json' };
import audit from '../../data/audit.json' with { type: 'json' };
import fees from '../../data/fees.json' with { type: 'json' };
import schools from '../../data/schools.json' with { type: 'json' };
import health from '../../data/health.json' with { type: 'json' };
import teamilk from '../../data/teamilk.json' with { type: 'json' };
import census from '../../data/census.json' with { type: 'json' };
import roads from '../../data/roads.json' with { type: 'json' };
import { json } from '../../lib/api.js';

const datasets = [
  {
    id: 'county-money',
    name: 'County money (registry)',
    checked: registryNotes.updated,
    refresh: 'Each new Controller of Budget annual report (around August–October)',
    records: money.years.length,
    endpoints: ['/api/money.json', '/api/budget.txt'],
  },
  {
    id: 'leaders',
    name: 'County and national leaders',
    checked: L.updated,
    refresh: 'After any by-election, court ruling or appointment',
    records: L.county.length + L.national.length + Object.keys(L.mcas).length,
    verified: L.mcaGazetteChecked,
    endpoints: ['/api/leaders.json', '/api/leaders.txt'],
  },
  {
    id: 'wards',
    name: 'Ward metadata and facilities',
    checked: '2026-10-22',
    refresh: 'When reviewed facility evidence is added',
    records: wardsRaw.length,
    endpoints: ['/api/wards.json', '/api/ward/<slug>.json', '/api/ward/<slug>.txt'],
  },
  {
    id: 'contracts',
    name: 'Contracts and project tracker',
    checked: '2026-10-30',
    refresh: 'Quarterly from the PPRA portal',
    records: contracts.contracts.length,
    endpoints: ['/api/contracts.json', '/api/ocds.json'],
  },
  {
    id: 'facilities',
    name: 'Public facilities',
    checked: '2026-10-27',
    sourceDate: 'Health: KMHFL 2017 export; schools and others: OpenStreetMap/Google Maps (various dates)',
    refresh: 'When reviewed evidence is added; living events update conditions',
    records: wards.reduce((n, w) => n + (w.facilities?.length ?? 0), 0),
    endpoints: ['/api/facilities.json', '/api/facilities.txt'],
  },
  {
    id: 'audit',
    name: 'Auditor-General findings',
    checked: '2026-10-24',
    refresh: 'Each new OAG report (around December–March)',
    records: audit.findings?.length ?? 0,
  },
  {
    id: 'roads',
    name: 'County roads',
    checked: '2026-10-29',
    refresh: 'After wardspend.json or audit.json changes; run build-roads.js',
    records: roads.roads?.length ?? 0,
  },
  {
    id: 'fees',
    name: 'County fees',
    checked: '2026-10-22',
    refresh: 'When a new Finance Act is passed',
    records: fees.fees?.length ?? fees.length ?? 0,
  },
  {
    id: 'schools',
    name: 'Schools and education',
    checked: '2026-10-24',
    sourceDate: 'MoE statistical booklet 2020; KNEC KCSE 2024–2025',
    refresh: 'When a newer MoE statistical booklet appears',
    records: schools.items?.length ?? 0,
  },
  {
    id: 'health',
    name: 'Health indicators',
    checked: '2026-10-24',
    sourceDate: 'KDHS 2022; CIDP 2023–2027',
    refresh: 'Next KDHS or CIDP',
  },
  {
    id: 'tea-milk',
    name: 'Tea and milk',
    checked: '2026-10-24',
    refresh: 'Each September/October (bonus season)',
    records: teamilk.factories?.length ?? 0,
  },
  {
    id: 'census',
    name: 'Census 2019',
    checked: '2026-10-22',
    sourceDate: 'KNBS Kenya Population and Housing Census 2019',
    refresh: 'Next census (expected 2029)',
    records: census.wards?.length ?? 0,
  },
  {
    id: 'language',
    name: 'Ekegusii language dataset',
    checked: '2026-10-22',
    refresh: 'As entries are contributed and reviewed',
    endpoints: ['/api/language.json'],
  },
];

export function GET({ site }) {
  return json({
    description: 'Data freshness metadata for all Nyamira Daily datasets. "checked" is when the site last loaded or reviewed this dataset. "sourceDate", where present, is the date of the underlying source data (which may be much older). Use this to monitor what is stale.',
    datasets,
  }, site);
}
