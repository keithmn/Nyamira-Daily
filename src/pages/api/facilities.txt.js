// Facility summary as plain text under 900 characters, for SMS/USSD/WhatsApp bot replies.
import wards from '../../data/wards.js';
import { text } from '../../lib/api.js';

export function GET() {
  const all = wards.flatMap((w) => w.facilities);
  const byCat = {};
  for (const f of all) byCat[f.category] = (byCat[f.category] ?? 0) + 1;
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c}: ${n}`);
  const lines = [
    `Nyamira County Facilities (Nyamira Daily)`,
    ``,
    `Total listed: ${all.length} across ${wards.length} wards`,
    ...cats,
    ``,
    `Choose a ward for details:`,
    ...wards.map((w) => `${w.name}: ${w.facilities.length} facilities`),
    ``,
    `More: https://nyamiradaily.org/map/`,
  ];
  return text(lines.join('\n').slice(0, 900));
}
