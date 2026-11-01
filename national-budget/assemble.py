"""Put data.json into page.src.html and write kenya-budget.html (one self-contained page)."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
p = lambda f: os.path.join(HERE, f)
d = open(p('data.json'), encoding='utf-8').read()
json.loads(d)
d = d.replace('</', '<\\/')
s = open(p('page.src.html'), encoding='utf-8').read().replace('__DATA__', d)
open(p('kenya-budget.html'), 'w', encoding='utf-8').write(s)
print('wrote kenya-budget.html', len(s), 'bytes')
