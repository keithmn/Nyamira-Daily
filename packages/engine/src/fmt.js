// Number and date formatting for both sites. `ksh`, `num` and `date` are the main site's; the rest write amounts in
// words for the national product, in English or Kiswahili (no regex here: this runs in Astro frontmatter).
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

const UNITS = { KSh: 1, 'KSh m': 1e6, 'KSh bn': 1e9 };
const WORDS = {
  en: { trillion: 'trillion', billion: 'billion', million: 'million' },
  sw: { trillion: 'trilioni', billion: 'bilioni', million: 'milioni' },
};
const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  sw: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
};

export const toShillings = (value, unit) => {
  if (!(unit in UNITS)) throw new Error(`Not a money unit: ${unit}`);
  return value * UNITS[unit];
};

// A document rounded to KSh 0.1bn cannot give two decimals of a billion, so the unit limits the decimals shown. Large
// billions take one decimal in any unit, so one amount reads the same across the stages of a budget.
export function money(value, unit = 'KSh', lang = 'en') {
  const n = toShillings(value, unit), abs = Math.abs(n), w = WORDS[lang];
  if (abs < 1e6) return `KSh ${Math.round(n).toLocaleString('en-KE')}`;
  const [size, word, dp] = abs >= 1e12 ? [1e12, w.trillion, 2] : abs >= 1e9 ? [1e9, w.billion, unit === 'KSh bn' || abs >= 1e11 ? 1 : 2] : [1e6, w.million, 1];
  const shown = (n / size).toFixed(dp);
  return lang === 'sw' ? `KSh ${word} ${shown}` : `KSh ${shown} ${word}`;
}

export const full = (n) => `KSh ${Math.round(n).toLocaleString('en-KE')}`;
export const percent = (n, dp = 1) => `${n.toFixed(dp)}%`;

export function ordinal(n, lang = 'en') {
  if (lang === 'sw') return `ya ${n}`;
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Dates in the registry are full (2026-06-11) or month only (2026-06), as the document gives them.
export function longDate(s, lang = 'en') {
  const [y, m, d] = s.split('-');
  const month = MONTHS[lang][Number(m) - 1];
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`;
}
