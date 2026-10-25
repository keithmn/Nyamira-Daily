import { ksh } from './fmt.js';

export function amountStatus(amount) {
  if (amount == null) return 'unavailable';
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    throw new TypeError('Project amount must be a non-negative finite number or unavailable');
  }
  return amount === 0 ? 'reported_zero' : 'reported_amount';
}

export function amountLabel(amount) {
  return amountStatus(amount) === 'unavailable' ? 'Amount not reported' : ksh(amount);
}

export function sumAmounts(amounts) {
  const statuses = amounts.map(amountStatus);
  if (statuses.length === 0 || statuses.includes('unavailable')) return null;
  return amounts.reduce((sum, amount) => sum + amount, 0);
}
