// The Gusii ward register (decision #134): every county assembly ward in Kisii and Nyamira, from the IEBC's
// register of voters per ward, with each ward's boundary name in geoBoundaries ADM3.
//   node scripts/build-ward-register.mjs          writes src/data/ward-register.json
//   node scripts/build-ward-register.mjs --check  fails if the file is out of date
// Input: data-src/iebc/rov-per-caw-2022-gusii.csv, the Kisii (045) and Nyamira (046) rows of
// https://www.iebc.or.ke/docs/rov_per_caw.pdf, copied as printed. Fails if the ward voters do not add up to the
// IEBC county totals, if a ward has no boundary inside its county, or if Nyamira disagrees with wards.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(`${root}${p}`, 'utf8');
const OUT = 'src/data/ward-register.json';

// IEBC county totals from https://www.iebc.or.ke/docs/rov_per_county.pdf (sha256 1727da00…de), as printed.
const COUNTY_TOTALS = { kisii: 637010, nyamira: 323283 };
// IEBC spellings that differ from geoBoundaries ADM3, by IEBC ward code. Checked by position: each boundary
// below lies inside Kisii County and no other ward claims it.
const BOUNDARY_ALIASES = { 1317: 'Bobasi Central', 1319: 'Bobasi Bogetaorio', 1323: 'Majoge' };

const titleCase = (s) => s.toLowerCase().replace(/\s*\/\s*/g, '/').replace(/(^|[\s/])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
export const slugOf = (name) => name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const key = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

function parseCsv(text) {
  const [head, ...lines] = text.trim().split('\n');
  const cols = head.split(',');
  return lines.map((line) => {
    const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    return Object.fromEntries(cols.map((c, i) => [c, cells[i]]));
  });
}

// Wards whose boundary centre lies inside the county boundary (both geoBoundaries, CC BY 4.0).
function boundaryNames(countyName) {
  const adm3 = JSON.parse(read('data-src/geoboundaries-ken-adm3-simplified.geojson'));
  const adm1 = JSON.parse(read('data-src/geoboundaries-ken-adm1-simplified.geojson'));
  const polys = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
  const inRing = ([x, y], ring) => {
    let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const inGeom = (pt, g) => polys(g).some((p) => inRing(pt, p[0]) && !p.slice(1).some((h) => inRing(pt, h)));
  const centroid = (g) => {
    const p = polys(g).map((q) => q[0]).sort((a, b) => b.length - a.length)[0];
    let A = 0, cx = 0, cy = 0;
    for (let i = 0; i < p.length - 1; i++) {
      const [x0, y0] = p[i], [x1, y1] = p[i + 1];
      const f = x0 * y1 - x1 * y0;
      A += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f;
    }
    return [cx / (3 * A), cy / (3 * A)];
  };
  const shape = adm1.features.find((f) => f.properties.shapeName === countyName).geometry;
  return adm3.features.filter((f) => inGeom(centroid(f.geometry), shape)).map((f) => f.properties.shapeName);
}

export function buildRegister() {
  const rows = parseCsv(read('data-src/iebc/rov-per-caw-2022-gusii.csv'));
  const existing = JSON.parse(read('src/data/wards.json'));
  const problems = [];
  const wards = [];
  const constituencies = [];
  const counties = {};

  for (const countyName of ['Kisii', 'Nyamira']) {
    const slug = countyName.toLowerCase();
    const mine = rows.filter((r) => r.county === countyName.toUpperCase());
    const bounds = boundaryNames(countyName);
    const unclaimed = new Set(bounds);
    for (const r of mine) {
      const name = titleCase(r.ward);
      const boundaryName = BOUNDARY_ALIASES[r.ward_code] ?? bounds.find((b) => key(b) === key(name));
      if (!boundaryName || !unclaimed.has(boundaryName)) problems.push(`${countyName}: no free boundary for ${name} (${r.ward_code})`);
      unclaimed.delete(boundaryName);
      wards.push({
        slug: slugOf(name), name, county: slug, constituency: titleCase(r.constituency),
        iebcWardCode: r.ward_code, iebcConstituencyCode: r.constituency_code,
        registeredVoters2022: Number(r.registered_voters_2022),
        boundaryName,
      });
    }
    if (unclaimed.size) problems.push(`${countyName}: boundaries with no IEBC ward: ${[...unclaimed].join(', ')}`);
    const total = mine.reduce((a, r) => a + Number(r.registered_voters_2022), 0);
    if (total !== COUNTY_TOTALS[slug]) problems.push(`${countyName}: wards add up to ${total}, IEBC county total is ${COUNTY_TOTALS[slug]}`);
    counties[slug] = { name: countyName, iebcCode: mine[0].county_code, wards: mine.length, registeredVoters2022: total };
    for (const code of [...new Set(mine.map((r) => r.constituency_code))]) {
      const inC = mine.filter((r) => r.constituency_code === code);
      constituencies.push({ code, name: titleCase(inC[0].constituency), county: slug, wards: inC.length, registeredVoters2022: inC.reduce((a, r) => a + Number(r.registered_voters_2022), 0) });
    }
  }

  const slugs = wards.map((w) => w.slug);
  for (const s of slugs.filter((s, i) => slugs.indexOf(s) !== i)) problems.push(`duplicate slug ${s}`);
  for (const w of existing) {
    const r = wards.find((x) => x.slug === w.slug);
    if (!r) problems.push(`wards.json ${w.slug} is not in the IEBC register`);
    else if (r.name !== w.name || r.constituency !== w.subCounty || r.county !== w.county) problems.push(`wards.json ${w.slug} disagrees with the register: ${w.name}/${w.subCounty}/${w.county} vs ${r.name}/${r.constituency}/${r.county}`);
  }
  if (problems.length) throw new Error(`Ward register problems:\n  ${problems.join('\n  ')}`);

  return {
    source: {
      title: 'Registered voters per county assembly ward for the 2022 General Election',
      publisher: 'Independent Electoral and Boundaries Commission (IEBC)',
      url: 'https://www.iebc.or.ke/docs/rov_per_caw.pdf',
      sha256: '904aee16b5a1e13442eac5c1156482a2aa9418396f615ff6a97340fc66b8671c',
      label: 'official',
      checked: 'Ward totals match the IEBC register of voters per county (rov_per_county.pdf): Kisii 637,010, Nyamira 323,283.',
      note: 'Names and spellings as printed by the IEBC. Three Kisii wards are spelt differently in the boundary data: Basi Central (Bobasi Central), Basi Bogetaorio (Bobasi Bogetaorio) and Majoge Basi (Majoge).',
    },
    boundarySource: 'Ward boundaries: geoBoundaries gbOpen KEN ADM3; county boundaries: geoBoundaries gbOpen KEN ADM1 (CC BY 4.0).',
    counties,
    constituencies,
    wards,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = JSON.stringify(buildRegister(), null, 1) + '\n';
  if (process.argv.includes('--check')) {
    if (read(OUT) !== text) { console.error(`${OUT} is out of date: run node scripts/build-ward-register.mjs`); process.exit(1); }
    console.log(`${OUT} is up to date`);
  } else {
    writeFileSync(`${root}${OUT}`, text);
    console.log(`Wrote ${OUT}`);
  }
}
