"""Build src/data/unit-costs.json: like-for-like unit costs from Nyamira's own project records
(src/data/wardspend.json), for the "What KSh 1 billion could build" tool.

Only clearly comparable items are used, each example keeps its project ID, year, kind and source:
  - road: routine maintenance contracts (FY2023/24) whose name gives the length "(x km)": contract sum / km
  - ecde: 2025/26 budget lines for ONE named ECDE classroom ("... ECDE class", not "classes", centres or toilets)
  - borehole: "Equipping and distribution of <name> borehole" lines
  - opd: contract sums to build or complete one outpatient (OPD) block
Re-run after wardspend.json changes:  python3 scripts/unit-costs.py
"""
import json, os, re, statistics
root = os.path.join(os.path.dirname(__file__), '..')
W = json.load(open(os.path.join(root, 'src', 'data', 'wardspend.json')))
P = W['projects']

def ex(p, per=None, units=1):
    return {'projectId': p['projectId'], 'name': p['name'], 'ward': p['ward'], 'fy': p['fy'], 'kind': p['kind'],
            'amount': p['amount'], 'units': units, 'perUnit': round(per if per is not None else p['amount'] / units),
            'sourceId': p['sourceId'], 'page': p['page']}

items = []
# Roads: routine maintenance contracts with a stated length
road = []
for p in P:
    m = re.search(r'\((\d+(?:\.\d+)?)\s*km\)', p['name'])
    if p['kind'] == 'contract' and p['fy'] == '2023/24' and p['name'].startswith('Road routine maintenance') and m and p['amount']:
        km = float(m.group(1))
        road.append(ex(p, p['amount'] / km, km))
items.append({'key': 'road', 'plural': 'km of road maintenance', 'item': 'km of routine road maintenance (murram roads)', 'basis': 'contract sums, FY2023/24, divided by the length in the contract name', 'examples': road})

ecde = [ex(p) for p in P if p['kind'] == 'budgeted' and p['fy'] == '2025/26' and p['amount']
        and re.search(r'\becde class(room)?\b', p['name'], re.I) and not re.search(r'classes|centre|toilet|\b\d+\s+ecde', p['name'], re.I)]
items.append({'key': 'ecde', 'plural': 'ECDE classrooms', 'item': 'ECDE (nursery) classroom', 'basis': 'FY2025/26 budget lines for one named classroom', 'examples': ecde})

bore = [ex(p) for p in P if p['amount'] and re.match(r'equipping and distribution of .* borehole', p['name'], re.I) and p['kind'] in ('budgeted', 'contract')]
items.append({'key': 'borehole', 'plural': 'boreholes equipped with pumps and pipes', 'item': 'borehole equipped with a pump and water distribution', 'basis': 'budget lines and contract sums for "equipping and distribution" of one borehole', 'examples': bore})

opd = [ex(p) for p in P if p['kind'] == 'contract' and p['amount'] and re.match(r'(construction|completion)\b.*\b(opd|outpatient)\b', p['name'], re.I)]
items.append({'key': 'opd', 'plural': 'outpatient (OPD) blocks at dispensaries', 'item': 'outpatient (OPD) block at a dispensary or health centre', 'basis': 'contract sums for building or completing one OPD block (status at 30 June 2025)', 'examples': opd})

for it in items:
    v = [e['perUnit'] for e in it['examples']]
    it.update({'n': len(v), 'min': min(v), 'max': max(v), 'median': round(statistics.median(v))})
src = {s['id']: {'title': s['title'], 'url': s['url']} for s in W['sources']}
out = {'checked': W['checked'], 'note': 'Estimate: based on past county contract sums and budget lines. Not adjusted for inflation. A budget line is planned money, not a final cost.', 'sources': src, 'items': items}
json.dump(out, open(os.path.join(root, 'src', 'data', 'unit-costs.json'), 'w'), indent=1, ensure_ascii=False)
for it in items: print(it['key'], it['n'], it['min'], it['median'], it['max'])
