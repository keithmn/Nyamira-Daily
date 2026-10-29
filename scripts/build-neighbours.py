"""Build src/data/neighbours.json: Nyamira and its neighbouring counties, clipped to a frame around the
county and drawn in the same SVG projection as src/data/geo.json, for map context (hero map, /maps/).
Source: geoBoundaries gbOpen KEN ADM1, simplified (CC BY 4.0), e.g.
https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/KEN/ADM1/geoBoundaries-KEN-ADM1_simplified.geojson
  python3 scripts/build-neighbours.py <geoBoundaries-KEN-ADM1_simplified.geojson>
County lines at this scale are approximate and do not exactly match the ward boundaries (ADM3);
they are context only and never links or data.
"""
import json, os, sys
root = os.path.join(os.path.dirname(__file__), '..')
d = json.load(open(sys.argv[1]))
P = json.load(open(os.path.join(root, 'src', 'data', 'geo.json')))['proj']
def xy(lon, lat): return ((lon - P['minx']) * P['k'] * P['sc'], (P['maxy'] - lat) * P['sc'])
X0, Y0, X1, Y1 = -320, -260, 920, 1210

def clip(poly):
    def cl(pts, inside, inter):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if inside(b):
                if not inside(a): out.append(inter(a, b))
                out.append(b)
            elif inside(a): out.append(inter(a, b))
        return out
    ix = lambda x: (lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])))
    iy = lambda y: (lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y))
    for ins, it in [(lambda p: p[0] >= X0, ix(X0)), (lambda p: p[0] <= X1, ix(X1)), (lambda p: p[1] >= Y0, iy(Y0)), (lambda p: p[1] <= Y1, iy(Y1))]:
        if not poly: break
        poly = cl(poly, ins, it)
    return poly

def thin(r, tol=2.0):
    out = []
    for p in r:
        if not out or abs(p[0] - out[-1][0]) + abs(p[1] - out[-1][1]) >= tol: out.append(p)
    return out

res = {}
for f in d['features']:
    n = f['properties']['shapeName']; g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    parts = [thin(c) for c in (clip([xy(lon, lat) for lon, lat in poly[0]]) for poly in polys) if len(c) > 2]
    if not parts: continue
    area = sum(p[i - 1][0] * p[i][1] - p[i][0] * p[i - 1][1] for p in parts for i in range(len(p)))
    if abs(area) / 2 < 2000: continue  # slivers at the frame's edge
    big = max(parts, key=len)
    res[n] = {'d': ''.join('M' + 'L'.join(f'{x:.0f} {y:.0f}' for x, y in p) + 'Z' for p in parts),
              'lx': round(sum(p[0] for p in big) / len(big)), 'ly': round(sum(p[1] for p in big) / len(big)), 'area': round(abs(area) / 2)}
dst = os.path.join(root, 'src', 'data', 'neighbours.json')
json.dump({'box': [X0, Y0, X1 - X0, Y1 - Y0], 'source': 'County boundaries: geoBoundaries gbOpen KEN ADM1 (CC BY 4.0)', 'counties': res}, open(dst, 'w'), separators=(',', ':'))
print('wrote', dst, sorted(res))
