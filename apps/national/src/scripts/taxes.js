// Your taxes: splits the typed amount in the browser. Nothing is sent or stored; the amount lives only in the address bar.
import { readAmount, shillings, splitAmount } from '../lib/split.js';
import { whatsappHref } from '../lib/share.js';

const root = document.querySelector('[data-taxes]');
if (root) {
  const D = JSON.parse(root.querySelector('[data-taxes-data]').textContent);
  const form = root.querySelector('[data-taxes-form]'), input = form.querySelector('input'), error = root.querySelector('[data-taxes-error]');
  const fill = (s, v) => Object.entries(v).reduce((a, [k, x]) => a.replace(`{${k}}`, x), s);
  function show(amount) {
    const parts = splitAmount(amount, D.shares);
    root.querySelectorAll('[data-part]').forEach((el, i) => { el.textContent = shillings(parts[i]); });
    root.querySelector('.cf-title').textContent = fill(D.of, { amount: amount.toLocaleString('en-KE') });
    const list = parts.map((p, i) => fill(D.item, { amount: shillings(p), name: D.names[i] })).join(', ');
    const text = fill(D.share, { amount: shillings(amount), list });
    root.querySelector('[data-taxes-text]').textContent = text;
    root.querySelector('[data-taxes-said]').textContent = text;
    root.querySelector('[data-taxes-wa]').href = whatsappHref(text, D.source, `${D.url}?a=${amount}`);
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = readAmount(input.value);
    error.hidden = amount != null;
    input.setAttribute('aria-invalid', String(amount == null));
    if (amount == null) return;
    show(amount);
    history.replaceState(null, '', `?a=${amount}`);
  });
  const start = readAmount(new URLSearchParams(location.search).get('a') ?? '');
  if (start) { input.value = start.toLocaleString('en-KE'); show(start); }
}
