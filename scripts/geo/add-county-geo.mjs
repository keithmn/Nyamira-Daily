// Add a Gusii county's wards to src/data/geo.json in the projection Nyamira's map already uses (decision #134), so
// existing Nyamira coordinates, town marks and labels do not move. There is one map: `frame` is the viewBox that
// shows every county together (Kisii lies west and south, so its shapes have negative x and y beyond geo.h).
//   node scripts/geo/add-county-geo.mjs kisii [osm-points.json]
// Boundaries: geoBoundaries gbOpen KEN ADM3 (CC BY 4.0), matched by the ward register's `boundaryName`.
// Points (optional): OpenStreetMap (ODbL), same format build-geo.py reads ({ward, lon, lat, layer, props}).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const read = (p) => JSON.parse(readFileSync(`${root}${p}`, 'utf8'));
const [countySlug, pointsFile] = process.argv.slice(2);
if (!countySlug) { console.error('usage: node scripts/geo/add-county-geo.mjs <county> [osm-points.json]'); process.exit(1); }

const geo = read('src/data/geo.json');
const register = read('src/data/ward-register.json');
const adm3 = read('data-src/geoboundaries-ken-adm3-simplified.geojson');
const { minx, maxy, k, sc } = geo.proj;
const xy = (lon, lat) => [(lon - minx) * k * sc, (maxy - lat) * sc];
const rings = (g) => (g.type === 'MultiPolygon' ? g.coordinates.map((p) => p[0]) : [g.coordinates[0]]);
const f1 = (v) => v.toFixed(1);

function thin(ring, tol = 0.6) {
  const out = [];
  for (const [lon, lat] of ring) {
    const [x, y] = xy(lon, lat);
    const last = out[out.length - 1];
    if (!last || Math.abs(x - last[0]) + Math.abs(y - last[1]) >= tol) out.push([x, y]);
  }
  return out;
}

// Same categories as build-geo.py's cat()
function cat(p) {
  const L = p.layer, pr = p.props ?? {};
  if (L === 'education_facilities') return 'school';
  if (L === 'health_facilities') return 'health';
  if (L === 'populated_places') return 'place';
  const a = `${pr.amenity ?? ''} ${pr.shop ?? ''} ${pr.building ?? ''}`;
  if (/worship|church/.test(a)) return 'worship';
  if (/market/.test(a)) return 'market';
  if (/school|college|kindergarten/.test(a)) return 'school';
  if (/clinic|hospital|pharmacy|doctors/.test(a)) return 'health';
  if (/water/.test(a)) return 'water';
  return null;
}

const points = pointsFile && existsSync(pointsFile) ? JSON.parse(readFileSync(pointsFile, 'utf8')) : [];
const wards = register.wards.filter((w) => w.county === countySlug);
if (!wards.length) { console.error(`no wards for county ${countySlug} in the ward register`); process.exit(1); }

for (const w of wards) {
  const f = adm3.features.find((x) => x.properties.shapeName === w.boundaryName);
  if (!f) { console.error(`no boundary named ${w.boundaryName}`); process.exit(1); }
  const rs = rings(f.geometry).map((r) => thin(r));
  const d = rs.map((r) => 'M' + r.map(([x, y]) => `${f1(x)} ${f1(y)}`).join('L') + 'Z').join('');
  const xs = rs.flat().map((p) => p[0]), ys = rs.flat().map((p) => p[1]);
  const big = rs.reduce((a, b) => (b.length > a.length ? b : a));
  const cx = big.reduce((s, p) => s + p[0], 0) / big.length, cy = big.reduce((s, p) => s + p[1], 0) / big.length;
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const pad = Math.max(bw, bh) * 0.12;
  const vb = [Math.min(...xs) - pad, Math.min(...ys) - pad, bw + 2 * pad, bh + 2 * pad];
  const pts = points
    .filter((p) => p.ward === w.slug || p.ward === w.boundaryName)
    .map((p) => ({ p, c: cat(p) }))
    .filter(({ p, c }) => p.props?.name && c)
    .map(({ p, c }) => { const [x, y] = xy(p.lon, p.lat); return { x: +f1(x), y: +f1(y), name: p.props.name, cat: c }; });
  geo.wards[w.slug] = { name: w.name, county: countySlug, d, cx: +f1(cx), cy: +f1(cy), vb: vb.map(f1).join(' '), span: +f1(Math.max(vb[2], vb[3])), points: pts };
}

// Every ward names its county; Nyamira's were built first by build-geo.py.
const countyOf = Object.fromEntries(register.wards.map((w) => [w.slug, w.county]));
for (const [slug, w] of Object.entries(geo.wards)) w.county ??= countyOf[slug];

// The one map's viewBox: every ward in every county, from the ward outlines.
const nums = Object.values(geo.wards).flatMap((w) => w.d.match(/-?\d+(\.\d+)?/g).map(Number));
const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
const [x0, y0, x1, y1] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
const pad = Math.max(x1 - x0, y1 - y0) * 0.04;
geo.frame = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad].map(f1).join(' ');
delete geo.frames;
geo.source = 'Ward boundaries: geoBoundaries gbOpen KEN ADM3 (CC BY 4.0). Points: © OpenStreetMap contributors (ODbL).';

writeFileSync(`${root}src/data/geo.json`, JSON.stringify(geo));
console.log(`geo.json: ${wards.length} ${countySlug} wards, ${wards.reduce((n, w) => n + geo.wards[w.slug].points.length, 0)} points; frame ${geo.frame}`);
