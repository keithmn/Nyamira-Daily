// The memorandum builder: rebuilds the text as the reader types. Nothing is sent, and nothing is kept once the page closes.
import { memorandum } from '../lib/memo.js';

const root = document.querySelector('[data-memo-builder]');
if (root) {
  const D = JSON.parse(root.querySelector('[data-memo-data]').textContent);
  const form = root.querySelector('[data-memo-form]'), out = root.querySelector('[data-memo]'), copy = root.querySelector('[data-memo-copy]');
  const date = new Date().toLocaleDateString(D.lang === 'sw' ? 'sw-KE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' });
  function build() {
    const topic = D.topics.find((x) => x.id === form.topic.value) ?? D.topics[0];
    const text = memorandum({ topic, from: form.from.value, date, ask: form.ask.value, w: D.w });
    out.textContent = text;
    copy.dataset.copy = text;
  }
  form.addEventListener('input', build);
  form.addEventListener('change', build);
  build();
}
