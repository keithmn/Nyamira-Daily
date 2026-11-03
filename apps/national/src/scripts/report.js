// The report form, only on builds where intake is open: fills in the figure the reader came from, then sends the form to
// /api/corrections and says what happened. The reader chooses everything that is sent.
import { reportPage } from '../lib/intake.js';

const form = document.querySelector('[data-report-form]');
if (form) {
  const status = form.querySelector('[data-report-status]'), button = form.querySelector('button[type="submit"]');
  const figure = new URLSearchParams(location.search).get('figure');
  if (figure && /^[a-z0-9.-]{3,160}$/.test(figure)) form.page.value = reportPage(figure, '');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = form.dataset.sending;
    button.disabled = true;
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) { status.textContent = result.error || form.dataset.failed; return; }
      form.reset();
      Reflect.get(window, 'turnstile')?.reset?.();
      status.textContent = form.dataset.saved.replace('{ref}', result.reference);
    } catch {
      status.textContent = form.dataset.failed;
    } finally {
      button.disabled = false;
    }
  });
}
