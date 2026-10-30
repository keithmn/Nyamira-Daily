"""Build src/data/contracts.json and public/files/contracts.csv for the project tracker (decision #71).

Inputs (data-src/contracts/, each row citing an official source and page):
  county_awards.json   County Government and County Assembly awards, PPIP (tenders.go.ke)
  roads_national.json  KeRRA, KURA and KeNHA contracts in Nyamira, PPIP and KeNHA award lists
  ngcdf_projects.json  NG-CDF project lines for the four constituencies (approved proposals, implementation
                       reports, Auditor-General reports): allocations, mostly without contractors
  national_other.json  other national contracts (water, schools, housing) where an award was found
Nothing is estimated: a field the source does not print stays null. Run:  python3 scripts/build-contracts.py
"""
import csv, hashlib, json, os, re
ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'data-src', 'contracts')
wards = json.load(open(os.path.join(ROOT, 'src', 'data', 'wards.json')))
WARD = {w['name'].lower(): w['slug'] for w in wards}
CONST = {'borabu': 'borabu', 'kitutu masaba': 'kitutu-masaba', 'north mugirango': 'north-mugirango', 'west mugirango': 'west-mugirango'}
SUB_OF = {w['slug']: w['subCounty'] for w in wards}

GROUPS = {
    'county': ('County Government', False), 'assembly': ('County Assembly', False), 'roads': ('National roads', True),
    'ng-cdf': ('NG-CDF', True), 'national': ('Other national projects', True),
}
AGENCY = {'kerra': 'KeRRA (Kenya Rural Roads Authority)', 'kura': 'KURA (Kenya Urban Roads Authority)', 'kenha': 'KeNHA (Kenya National Highways Authority)'}

def fy_of(date):
    if not date: return None
    y, m = int(date[:4]), int(date[5:7])
    return f'{y}/{str(y + 1)[2:]}' if m >= 7 else f'{y - 1}/{str(y)[2:]}'

def norm_fy(s):
    if not s: return None
    m = re.match(r'(\d{4})\s*/\s*(\d{2,4})$', s.strip())
    if not m: return s.strip()
    a, b = m.group(1), m.group(2)
    return f'{a}/{b[-2:]}'

def wards_in(text):
    if not text: return []
    found = []
    for part in re.split(r',|;| and |&', text):
        k = part.strip().lower().replace(' ward', '').strip()
        if k in WARD and WARD[k] not in found: found.append(WARD[k])
    return found

def const_in(text):
    if not text: return None
    t = text.lower()
    for k, v in CONST.items():
        if k in t: return v
    return None

def money(v):
    return None if v in (None, '') else round(float(v), 2)

sources, rows = {}, []
for fname, prefix in [('county_awards.json', 'ca'), ('roads_national.json', 'rn'), ('ngcdf_projects.json', 'ng'), ('national_other.json', 'no')]:
    d = json.load(open(os.path.join(SRC, fname)))
    for s in d['sources']:
        sources[f"{prefix}:{s['id']}"] = {k: s.get(k) for k in ('title', 'publisher', 'url', 'date')}
    for n, r in enumerate(d['contracts']):
        f = r.get('funder')
        if prefix == 'ca': group = 'assembly' if 'Assembly' in r['procuringEntity'] else 'county'
        elif prefix == 'rn': group = 'roads'
        elif prefix == 'ng': group = 'ng-cdf'
        else: group = 'national'
        notes = r.get('notes') or ''
        fy = norm_fy(r.get('financialYear')) or (lambda m: norm_fy(m.group(1)) if m else None)(re.search(r'Financial year:\s*([0-9]{4}\s*/\s*[0-9]{2,4})', notes)) or fy_of(r.get('awardDate'))
        term = re.search(r'TERMINATED on (\d{4}-\d{2}-\d{2})(?:; reason as printed: \'([^\']+)\')?', notes)
        contractor = r.get('contractor')
        withheld = contractor is None and bool(re.search(r'withheld|private (person|individual)', notes, re.I))
        amount = money(r.get('contractSum'))
        label = 'Contract sum'
        if group == 'national' and r.get('contractSumPrinted') and 'contract sum' not in notes.lower(): label = 'Total project cost'
        if amount is None and r.get('allocation') is not None:
            amount, label = money(r['allocation']), 'Allocation'
        printed = r.get('contractSumPrinted') if label != 'Allocation' else r.get('allocationPrinted')
        ws = wards_in(r.get('ward')) or wards_in(r.get('location'))
        const = CONST.get((r.get('constituency') or '').lower()) or const_in(r.get('location')) or (const_in(SUB_OF[ws[0]]) if ws else None)
        key = '|'.join(str(x) for x in (group, r.get('tenderNo'), contractor, r['title'], fy, r.get('sourceId'), r.get('page'), amount, (r.get('notes') or '')[:120]))
        rid = 'C-' + hashlib.sha1(key.encode()).hexdigest()[:8]
        rows.append({
            'id': rid, 'group': group, 'national': GROUPS[group][1], 'kind': 'allocation' if label == 'Allocation' else 'contract',
            'title': ' '.join(r['title'].split()), 'agency': AGENCY.get(f) or r['procuringEntity'],
            'tenderNo': r.get('tenderNo'), 'contractor': contractor, 'contractorWithheld': withheld,
            'amount': amount, 'amountLabel': label, 'amountPrinted': printed,
            'awardDate': r.get('awardDate'), 'startDate': r.get('startDate'), 'endDate': r.get('endDate'), 'durationPrinted': r.get('durationPrinted'),
            'fy': fy, 'wards': ws, 'constituency': const, 'location': r.get('location') or r.get('site'), 'road': r.get('road'),
            'department': r.get('department'),
            'paid': money(r.get('amountPaid')), 'paidAsAt': r.get('amountPaidAsAt'),
            'progress': r.get('progressPrinted'), 'progressAsAt': r.get('progressAsAt'),
            'terminated': {'date': term.group(1), 'reason': term.group(2)} if term else None,
            'source': f"{prefix}:{r['sourceId']}", 'page': r.get('page'), 'notes': notes or None,
        })
ids = [r['id'] for r in rows]
dupes = {i for i in ids if ids.count(i) > 1}
assert not dupes, f'duplicate ids: {sorted(dupes)[:5]}'
for r in rows: assert r['source'] in sources, r['source']
# Links to the county's own budget lines (decision #72), made by scripts/reconcile-contracts.py
lp = os.path.join(ROOT, 'data-src', 'contracts', 'project-links.json')
LINKS = {l['contractId']: l for l in (json.load(open(lp)) if os.path.exists(lp) else [])}
for r in rows:
    l = LINKS.get(r['id'])
    r['projectIds'] = l['projectIds'] if l else []
    r['linkBasis'] = l['basis'] if l else None
stale = set(LINKS) - set(ids)
assert not stale, f'project-links.json names contracts that no longer exist: {sorted(stale)[:5]} (re-run reconcile-contracts.py)'
rows.sort(key=lambda r: (r['awardDate'] or '', r['fy'] or ''), reverse=True)
out = {'built': 'scripts/build-contracts.py', 'groups': {k: {'label': v[0], 'national': v[1]} for k, v in GROUPS.items()}, 'sources': sources, 'contracts': rows}
json.dump(out, open(os.path.join(ROOT, 'src', 'data', 'contracts.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
cols = ['id', 'group', 'title', 'projectIds', 'agency', 'tenderNo', 'contractor', 'amountLabel', 'amount', 'awardDate', 'startDate', 'endDate', 'fy', 'wards', 'constituency', 'location', 'progress', 'progressAsAt', 'terminated', 'source_title', 'source_url', 'page']
with open(os.path.join(ROOT, 'public', 'files', 'contracts.csv'), 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(cols)
    for r in rows:
        s = sources[r['source']]
        w.writerow([r['id'], r['group'], r['title'], ' '.join(r['projectIds']), r['agency'], r['tenderNo'], r['contractor'], r['amountLabel'], r['amount'], r['awardDate'], r['startDate'], r['endDate'], r['fy'], ' '.join(r['wards']), r['constituency'], r['location'], r['progress'], r['progressAsAt'], (r['terminated'] or {}).get('date'), s['title'], s['url'], r['page']])
from collections import Counter
print(len(rows), 'records;', Counter(r['group'] for r in rows), '; with contractor:', sum(1 for r in rows if r['contractor']), '; with a ward:', sum(1 for r in rows if r['wards']), '; linked to budget lines:', sum(1 for r in rows if r['projectIds']))
