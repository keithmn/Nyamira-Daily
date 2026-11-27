import { entries } from './content.js';

export async function factcheckItems() {
  return (await entries('factchecks')).sort((a, b) => b.data.checkedOn - a.data.checkedOn);
}
export const ratingLabel = { 'true': 'True', 'mostly true': 'Mostly true', 'misleading': 'Misleading', 'false': 'False', 'unproven': 'Unproven' };
export const ratingShape = { 'true': '✓', 'mostly true': '✓', 'misleading': '?', 'false': '✗', 'unproven': '—' };
