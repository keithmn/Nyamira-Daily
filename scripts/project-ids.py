"""Give every project record in src/data/wardspend.json a stable `projectId`.

The same project gets the same ID in every year's documents when its ward and normalised name match:
  - lower case; "&" becomes "and"; punctuation removed; spaces collapsed;
  - leading work words dropped: construction, completion, renovation(s), rehabilitation, upgrading,
    equipping, purchase, repair(s), fencing, "of", "and", "the";
  - "road routine maintenance:" prefix dropped.
IDs are P- plus the first 7 hex digits of the SHA-1 of "ward|normalised name", so they do not change when
the file is re-run. Names that differ between documents (for example a project folded into a longer line)
are matched by hand in data-src/project-id-overrides.json. Usage:
  python3 scripts/project-ids.py           # write projectId into wardspend.json
  python3 scripts/project-ids.py --keys    # print every key, to write overrides
"""
import json, hashlib, os, sys, string
root = os.path.join(os.path.dirname(__file__), '..')
path = os.path.join(root, 'src', 'data', 'wardspend.json')
data = json.load(open(path))
over = json.load(open(os.path.join(root, 'data-src', 'project-id-overrides.json')))['merge']
DROP = {'construction', 'completion', 'renovation', 'renovations', 'rehabilitation', 'upgrading', 'equipping', 'purchase', 'repair', 'repairs', 'fencing', 'of', 'and', 'the'}

def norm(name):
    s = name.lower().replace('&', ' and ').replace('road routine maintenance:', ' ')
    s = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in s)
    words = s.split()
    while words and words[0] in DROP: words.pop(0)
    return ' '.join(words)

def key(p): return f"{p.get('ward') or 'county'}|{norm(p['name'])}"

keys = set()
for p in data['projects']:
    k = key(p); k = over.get(k, k); keys.add(k)
    p['projectId'] = 'P-' + hashlib.sha1(k.encode()).hexdigest()[:7]
if '--keys' in sys.argv:
    print('\n'.join(sorted(keys))); sys.exit()
ids = {}
for k in keys:
    i = 'P-' + hashlib.sha1(k.encode()).hexdigest()[:7]
    assert i not in ids, f'ID collision: {k} and {ids[i]}'
    ids[i] = k
json.dump(data, open(path, 'w'), indent=1, ensure_ascii=False)
open(path, 'a').write('\n')
multi = sum(1 for i in ids if len({p['fy'] for p in data['projects'] if p['projectId'] == i}) > 1)
print(f"{len(data['projects'])} records, {len(ids)} projects, {multi} found in more than one year")
