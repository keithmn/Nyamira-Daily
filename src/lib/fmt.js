// Number formatting helpers (no regex in .astro frontmatter: keeps the compiler happy).
export function ksh(n) {
  if (n == null) return '—';
  if (n >= 1e9) return 'KSh ' + parseFloat((n / 1e9).toFixed(2)) + 'B';
  if (n >= 1e6) return 'KSh ' + parseFloat((n / 1e6).toFixed(1)) + 'M';
  return 'KSh ' + Math.round(n).toLocaleString('en-KE');
}
export function num(n) { return n == null ? '—' : Number(n).toLocaleString('en-KE'); }
export function date(s) {
  if (!s) return '';
  const d = new Date(s.slice(0, 10));
  return isNaN(d) ? s : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
