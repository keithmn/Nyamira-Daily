import { entries } from './content.js';
// Number of the week, newest first
export async function getNumbers() {
  return (await entries('numbers')).sort((a, b) => b.data.week - a.data.week);
}
export const weekOf = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
