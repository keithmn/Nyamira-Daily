// All the page's behaviour, in one small file (DESIGN.md: 10 KB at most). Every feature is an enhancement: the page is
// complete without it. Nothing here sends anything anywhere; the saved county and theme stay in this browser.
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const root = document.documentElement;
const saved = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const save = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* the page works without it */ } };

/* status line */
const status = $('#status');
const say = (msg) => { status.textContent = msg; };

/* copy */
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('[data-copy]');
  if (!b) return;
  const done = () => say(b.dataset.done), fail = () => say(b.dataset.fail);
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(b.dataset.copy).then(done, fail); else fail();
});

/* theme */
const control = $('[data-theme-control]');
if (control) {
  const now = saved('kbe-theme');
  const start = control.querySelector(`input[value="${now === 'light' || now === 'dark' ? now : 'auto'}"]`);
  if (start) start.checked = true;
  control.addEventListener('change', (e) => {
    const v = e.target.value;
    if (v === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', v);
    save('kbe-theme', v === 'auto' ? null : v);
  });
}

/* tooltip: hover, focus or tap; Escape or a tap elsewhere closes it; it stays open while the pointer is on it */
const tip = $('#tip');
let owner = null;
function place(el) {
  const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  let y = r.top - h - 6;
  if (y < 64) y = r.bottom + 6;
  tip.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + 8))}px`;
  tip.style.top = `${y}px`;
}
function showTip(el) { owner = el; tip.textContent = el.dataset.tip; tip.hidden = false; el.setAttribute('aria-describedby', 'tip'); place(el); }
function hideTip() { owner?.removeAttribute('aria-describedby'); owner = null; tip.hidden = true; }
const tipOf = (t) => t.closest?.('[data-tip]');
document.addEventListener('focusin', (e) => { const el = tipOf(e.target); if (el) showTip(el); else if (owner && e.target !== tip) hideTip(); });
document.addEventListener('pointerover', (e) => { if (e.pointerType !== 'mouse') return; const el = tipOf(e.target); if (el) showTip(el); });
document.addEventListener('pointerout', (e) => {
  if (e.pointerType !== 'mouse') return;
  const el = tipOf(e.target);
  if (el && !(e.relatedTarget && (e.relatedTarget === tip || el.contains(e.relatedTarget)))) hideTip();
});
tip.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hideTip(); });
document.addEventListener('click', (e) => { const el = tipOf(e.target); if (el) showTip(el); else if (e.target !== tip) hideTip(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
window.addEventListener('scroll', () => { if (!owner) return; if (owner === document.activeElement) place(owner); else hideTip(); }, { passive: true });

/* line chart: one tab stop; arrow keys move between years; a tap picks the nearest year */
for (const chart of $$('[data-trend]')) {
  const points = $$('.p', chart);
  let at = points.length - 1;
  const clear = () => { points.forEach((p) => p.classList.remove('on')); tip.hidden = true; };
  const mark = (i) => {
    points.forEach((p) => p.classList.remove('on'));
    at = i;
    points[i].classList.add('on');
    tip.textContent = points[i].dataset.t;
    tip.hidden = false;
    const r = points[i].getBoundingClientRect();
    tip.style.left = `${Math.max(8, Math.min(window.innerWidth - tip.offsetWidth - 8, r.left - 40))}px`;
    tip.style.top = `${Math.max(64, r.top - tip.offsetHeight - 10)}px`;
  };
  chart.addEventListener('focus', () => mark(at));
  chart.addEventListener('blur', clear);
  chart.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); mark(Math.max(0, at - 1)); }
    if (e.key === 'ArrowRight') { e.preventDefault(); mark(Math.min(points.length - 1, at + 1)); }
    if (e.key === 'Escape') clear();
  });
  chart.addEventListener('pointerdown', (e) => {
    const box = chart.getBoundingClientRect(), x = (e.clientX - box.left) / box.width * 360;
    let best = 0, dist = Infinity;
    points.forEach((p, i) => { const d = Math.abs(Number(p.getAttribute('cx')) - x); if (d < dist) { dist = d; best = i; } });
    setTimeout(() => mark(best), 0);
  });
}

/* sortable tables: numbers read from data-sort; the order toggles, and the header says which way it runs */
for (const table of $$('table[data-sortable]')) {
  const heads = $$('thead th', table), body = table.tBodies[0];
  heads.forEach((th, col) => {
    $('button', th)?.addEventListener('click', () => {
      const up = th.getAttribute('aria-sort') !== 'ascending';
      heads.forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', up ? 'ascending' : 'descending');
      const value = (row) => { const c = row.cells[col]; return c.dataset.sort ?? c.textContent; };
      const rows = [...body.rows].sort((a, b) => {
        const x = value(a), y = value(b), n = Number(x) - Number(y);
        return (Number.isNaN(n) ? String(x).localeCompare(String(y)) : n) * (up ? 1 : -1);
      });
      body.append(...rows);
    });
  });
}

/* a newer document may have appeared since this page was built */
const today = new Date().toISOString().slice(0, 10);
for (const note of $$('[data-stale-after]')) if (note.dataset.staleAfter < today) note.hidden = false;

/* a countdown in days, never hours, worked out from the date in Nairobi */
for (const el of $$('[data-days-until]')) {
  const here = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' });
  const days = Math.round((Date.parse(el.dataset.daysUntil) - Date.parse(here)) / 864e5);
  if (days > 0) el.textContent = el.dataset.text.replace('{n}', days);
}

/* My county */
const chip = $('[data-chip]');
function readCounty() { try { return JSON.parse(saved('kbe-county')); } catch { return null; } }
function showChip(c) {
  if (!chip || !c) return;
  chip.href = `${chip.dataset.base}${c.s}/`;
  chip.setAttribute('aria-label', chip.dataset.label.replace('{name}', c.n));
  chip.removeAttribute('data-empty');
  $('[data-county-name]', chip).textContent = c.n;
}
function markRows(c) {
  for (const row of $$('[data-county-row]')) {
    const mine = Boolean(c) && row.dataset.countyRow === c.s;
    row.classList.toggle('is-mine', mine);
    const tag = $('[data-mine-tag]', row);
    if (tag) tag.hidden = !mine;
  }
}
const county = readCounty();
showChip(county);
markRows(county);

const card = $('[data-county-card]');
if (card) {
  const D = JSON.parse($('[data-county-data]', card).textContent);
  const input = $('[data-county-input]', card), mc = $('[data-mc]', card), link = $('[data-mc-link]', card), title = $('[data-mc-title]', card);
  const line = (cls, text) => { const p = document.createElement('p'); p.className = cls; p.textContent = text; return p; };
  const fill = (row) => {
    title.textContent = D.named.replace('{name}', row.n);
    mc.replaceChildren(line('mc-num', row.m), line('mc-line', `${D.share}, ${row.c}`), line('mc-line', row.d));
    mc.hidden = false;
    link.href = `${D.base}${row.s}/`;
    link.hidden = false;
  };
  const choose = () => {
    const row = D.rows.find((r) => r.n.toLowerCase() === input.value.trim().toLowerCase());
    if (!row) return;
    input.value = row.n;
    fill(row);
    const c = { s: row.s, n: row.n };
    save('kbe-county', JSON.stringify(c));
    showChip(c);
    markRows(c);
  };
  input.addEventListener('input', choose);
  input.addEventListener('change', choose);
  const first = county && D.rows.find((r) => r.s === county.s);
  if (first) { input.value = first.n; fill(first); }
}

/* the county page's "Make this my county", and printing a sheet */
document.addEventListener('click', (e) => {
  const mine = e.target.closest?.('[data-set-county]');
  if (mine) {
    const c = JSON.parse(mine.dataset.setCounty);
    save('kbe-county', JSON.stringify(c));
    showChip(c);
    markRows(c);
    say(mine.dataset.done);
  }
  if (e.target.closest?.('[data-print]')) window.print();
});

/* compare: the choice lives in the link, so it can be shared */
const compare = $('[data-compare]');
if (compare) {
  const D = JSON.parse($('[data-compare-data]', compare).textContent);
  const picks = $$('[data-compare-pick]', compare), table = $('[data-compare-table]', compare);
  const cell = (tag, text, scope) => { const c = document.createElement(tag); c.textContent = text; if (scope) c.scope = scope; return c; };
  const draw = () => {
    const rows = [...new Set(picks.map((p) => p.value).filter(Boolean))].map((s) => D.rows.find((r) => r.s === s));
    table.hidden = !rows.length;
    const head = document.createElement('tr');
    head.append(cell('th', D.measure, 'col'));
    for (const r of rows) {
      const th = cell('th', '', 'col'), a = document.createElement('a');
      a.href = `${D.base}${r.s}/`;
      a.textContent = r.n;
      th.append(a);
      head.append(th);
    }
    table.tHead.replaceChildren(head);
    table.tBodies[0].replaceChildren(...D.measures.map((m, i) => {
      const tr = document.createElement('tr');
      tr.append(cell('th', m, 'row'), ...rows.map((r) => { const td = cell('td', r.v[i]); td.className = 'num'; return td; }));
      return tr;
    }));
    history.replaceState(null, '', rows.length ? `?c=${rows.map((r) => r.s).join(',')}` : location.pathname);
  };
  const choose = (list) => { picks.forEach((p, i) => { p.value = D.rows.some((r) => r.s === list[i]) ? list[i] : ''; }); draw(); };
  picks.forEach((p) => p.addEventListener('change', draw));
  $('[data-compare-set]', compare).addEventListener('click', (e) => choose(e.currentTarget.dataset.compareSet.split(',')));
  choose((new URLSearchParams(location.search).get('c') ?? '').split(',').slice(0, 4));
}

/* search: one small file, read in the browser, so nothing typed leaves the phone */
const search = $('[data-search]');
if (search) {
  const form = $('form', search), input = $('input', search), list = $('[data-search-results]', search), count = $('[data-search-count]', search);
  const types = JSON.parse(search.dataset.types), order = ['county', 'sector', 'vote', 'programme', 'explainer'];
  let items = null;
  const run = () => {
    if (!items) return;
    const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) { list.replaceChildren(); count.textContent = ''; return; }
    const hits = items.filter((i) => words.every((w) => `${i[0]} ${i[3]}`.toLowerCase().includes(w)))
      .sort((a, b) => order.indexOf(a[2]) - order.indexOf(b[2]));
    count.textContent = !hits.length ? search.dataset.none : hits.length === 1 ? search.dataset.one : search.dataset.count.replace('{n}', hits.length);
    list.replaceChildren(...hits.slice(0, 40).map((i) => {
      const li = document.createElement('li'), a = document.createElement('a'), type = document.createElement('span');
      a.href = i[1];
      a.textContent = i[0];
      type.className = 'tag';
      type.textContent = types[i[2]];
      li.append(a, ' ', type);
      return li;
    }));
  };
  input.value = new URLSearchParams(location.search).get('q') ?? '';
  input.addEventListener('input', run);
  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  fetch(search.dataset.index).then((r) => r.json()).then((d) => { items = d; run(); }, () => {});
}

/* corrections: name the figure the reader came from; the id is only shown, never sent */
const asked = $('[data-asked-figure]'), figureId = new URLSearchParams(location.search).get('figure');
if (asked && figureId && /^[a-z0-9.-]{3,160}$/.test(figureId)) { asked.textContent = asked.dataset.text.replace('{id}', figureId); asked.hidden = false; }
