"""Build src/data/geo.json from ward boundaries (geoBoundaries ADM3, CC BY 4.0)
and OpenStreetMap points (ODbL). Re-run when boundaries or points change:
  python3 scripts/build-geo.py <nyamira.json> <osm_fac.json>
"""
import json, math, sys, os
wards_geo = json.load(open(sys.argv[1]))
osm = json.load(open(sys.argv[2]))
W = 600  # county map width in SVG units

def rings(g):
    t, c = g['type'], g['coordinates']
    return [p[0] for p in c] if t == 'MultiPolygon' else [c[0]]

allpts = [pt for f in wards_geo.values() for r in rings(f['geometry']) for pt in r]
minx = min(p[0] for p in allpts); maxx = max(p[0] for p in allpts)
miny = min(p[1] for p in allpts); maxy = max(p[1] for p in allpts)
k = math.cos(math.radians((miny + maxy) / 2))
sc = W / ((maxx - minx) * k)
H = round((maxy - miny) * sc)
def xy(lon, lat): return ((lon - minx) * k * sc, (maxy - lat) * sc)

def thin(r, tol=0.6):
    out = []
    for lon, lat in r:
        x, y = xy(lon, lat)
        if not out or abs(x - out[-1][0]) + abs(y - out[-1][1]) >= tol: out.append((x, y))
    return out

def cat(p):
    L = p['layer']; pr = p['props']
    if L == 'education_facilities': return 'school'
    if L == 'health_facilities': return 'health'
    if L == 'populated_places': return 'place'
    a = (pr.get('amenity') or '') + ' ' + (pr.get('shop') or '') + ' ' + (pr.get('building') or '')
    if 'worship' in a or 'church' in a: return 'worship'
    if 'market' in a: return 'market'
    if 'school' in a or 'college' in a or 'kindergarten' in a: return 'school'
    if 'clinic' in a or 'hospital' in a or 'pharmacy' in a or 'doctors' in a: return 'health'
    if 'water' in a: return 'water'
    return None

out = {'w': W, 'h': H, 'wards': {}, 'source': 'Ward boundaries: geoBoundaries (CC BY 4.0). Points: © OpenStreetMap contributors (ODbL).'}
for name, f in wards_geo.items():
    slug = name.lower().replace(' ', '-')
    rs = [thin(r) for r in rings(f['geometry'])]
    d = ''.join('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in r) + 'Z' for r in rs)
    xs = [x for r in rs for x, _ in r]; ys = [y for r in rs for _, y in r]
    big = max(rs, key=len)
    cx = sum(x for x, _ in big) / len(big); cy = sum(y for _, y in big) / len(big)
    bw, bh = max(xs) - min(xs), max(ys) - min(ys)
    pad = max(bw, bh) * 0.12
    vb = [min(xs) - pad, min(ys) - pad, bw + 2 * pad, bh + 2 * pad]
    pts = []
    for p in osm:
        if p['ward'] != name: continue
        nm = p['props'].get('name')
        c = cat(p)
        if not nm or not c: continue
        x, y = xy(p['lon'], p['lat'])
        pts.append({'x': round(x, 1), 'y': round(y, 1), 'name': nm, 'cat': c})
    out['wards'][slug] = {'name': name, 'd': d, 'cx': round(cx, 1), 'cy': round(cy, 1),
                         'vb': ' '.join(f'{v:.1f}' for v in vb), 'span': round(max(vb[2], vb[3]), 1), 'points': pts}
dst = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'geo.json')
json.dump(out, open(dst, 'w'), separators=(',', ':'))
print('wrote', dst, os.path.getsize(dst), 'bytes;', sum(len(w['points']) for w in out['wards'].values()), 'points')
