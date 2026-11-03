// Splitting an amount by spending shares, for Your taxes. Pure, so the built page and the browser run the same code.

// Whole shillings that add back to the amount: each part is rounded down, then the shillings left over go to the parts
// with the largest remainders.
export function splitAmount(amount, shares) {
  const total = shares.reduce((a, s) => a + s, 0);
  const raw = shares.map((s) => amount * s / total), out = raw.map(Math.floor);
  let left = amount - out.reduce((a, v) => a + v, 0);
  for (const [, i] of raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0])) {
    if (left <= 0) break;
    out[i] += 1; left -= 1;
  }
  return out;
}

// What a reader types: "10000", "10,000" or "KSh 10 000". Anything else, zero or over a trillion is not an amount.
export function readAmount(text) {
  const n = Number(String(text).trim().replace(/^ksh\.?/i, '').replace(/[\s,]/g, ''));
  return Number.isFinite(n) && n >= 1 && n <= 1e12 ? Math.round(n) : null;
}

export const shillings = (n) => `KSh ${n.toLocaleString('en-KE')}`;
