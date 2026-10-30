"""Reconcile tracker contracts with the ward project lines (decision #72).

Links a county contract (src/data/contracts.json, from the procurement portal) to the project lines in
src/data/wardspend.json (from the county's budgets and development plans) only when the evidence is strong:
  - same ward, and
  - the names match closely (shared distinctive words), and
  - the amounts agree exactly (to the shilling), or the names match very closely in the same or next year
    for a single-ward contract.
Everything else stays unlinked; candidates that looked close but failed a rule go to
data-src/contracts/reconcile-review.json for a person to check. Overrides (confirm or reject a pair) go in
data-src/contracts/reconcile-overrides.json. Output: data-src/contracts/project-links.json.
Run after build-contracts.py, then re-run build-contracts.py (it reads the links).
"""
import json, os, re
ROOT = os.path.join(os.path.dirname(__file__), '..')
W = json.load(open(os.path.join(ROOT, 'src', 'data', 'wardspend.json')))['projects']
C = [c for c in json.load(open(os.path.join(ROOT, 'src', 'data', 'contracts.json')))['contracts'] if c['group'] == 'county']
ov_path = os.path.join(ROOT, 'data-src', 'contracts', 'reconcile-overrides.json')
OV = json.load(open(ov_path)) if os.path.exists(ov_path) else {'confirm': [], 'reject': []}
STOP = set('the of and to in at for a an proposed construction supply delivery deliverry installation completion improvement maintenance routine spot upgrading upgrade rehabilitation works work project projects ward wards county nyamira road roads grading gravelling murraming opening phase lot equipping repair'.split())
def toks(s): return {t for t in re.findall(r'[a-z]{3,}', s.lower()) if t not in STOP}
def fyn(s):
    m = re.match(r'(\d{4})', s or '')
    return int(m.group(1)) if m else None
def sim(a, b):
    a, b = toks(a), toks(b)
    return len(a & b) / len(a | b) if a and b else 0

links, review = {}, []
for c in C:
    for p in W:
        s = sim(c['title'], p['name'])
        if s < 0.35: continue
        ward_ok = (p['ward'] in c['wards']) if c['wards'] else False
        same_amt = c['amount'] is not None and p['amount'] is not None and abs(c['amount'] - p['amount']) < 1
        dy = abs((fyn(c['fy']) or 0) - (fyn(p['fy']) or 0)) if fyn(p['fy']) and fyn(c['fy']) else 9
        basis = None
        if ward_ok and s >= 0.4 and same_amt: basis = 'same ward, matching name, same amount'
        elif ward_ok and s >= 0.6 and len(c['wards']) == 1 and dy <= 1: basis = 'same ward, closely matching name, same or next financial year'
        elif not c['wards'] and s >= 0.8 and same_amt: basis = 'closely matching name, same amount'
        pair = [c['id'], p['projectId']]
        if pair in OV.get('reject', []): basis = None
        if pair in OV.get('confirm', []): basis = basis or 'confirmed by an editor'
        if basis:
            e = links.setdefault(c['id'], {'contractId': c['id'], 'projectIds': [], 'basis': basis, 'lines': []})
            if p['projectId'] not in e['projectIds']: e['projectIds'].append(p['projectId'])
            e['lines'].append({'projectId': p['projectId'], 'fy': p['fy'], 'kind': p['kind'], 'amount': p['amount'], 'sourceId': p['sourceId'], 'page': p['page']})
        elif s >= 0.5:
            review.append({'contractId': c['id'], 'contract': c['title'], 'contractFy': c['fy'], 'contractAmount': c['amount'], 'contractWards': c['wards'],
                           'projectId': p['projectId'], 'project': p['name'], 'projectFy': p['fy'], 'projectKind': p['kind'], 'projectAmount': p['amount'], 'projectWard': p['ward'], 'similarity': round(s, 2)})
review = [r for r in review if r['contractId'] not in links or r['projectId'] not in links[r['contractId']]['projectIds']]
out = os.path.join(ROOT, 'data-src', 'contracts')
json.dump(sorted(links.values(), key=lambda e: e['contractId']), open(os.path.join(out, 'project-links.json'), 'w'), indent=1)
json.dump(sorted(review, key=lambda r: -r['similarity']), open(os.path.join(out, 'reconcile-review.json'), 'w'), indent=1)
print(len(links), 'contracts linked to', len({p for e in links.values() for p in e['projectIds']}), 'project IDs;', len(review), 'pairs left for review')
