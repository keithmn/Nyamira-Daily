// Real figures for the component library only. Spending history is not in the national registry yet, so the charts that
// need it read Nyamira Daily's checked Controller of Budget data. No product page imports this file.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (name) => JSON.parse(readFileSync(join(__KBE_MAIN_DATA__, name), 'utf8'));

export function nyamiraYears() {
  const { years } = read('money.json');
  return years.map((y) => ({ fy: y.fy, budget: y.budget * 1e6, spent: y.spent * 1e6, share: y.spent / y.budget * 100, devShare: y.devAbs, src: y.src }));
}

export const allCountyDevelopment = () => read('compare.json').national.devAbsorptionPct;

export const cobDoc = (url) => ({ title: 'Controller of Budget annual reports (Nyamira section)', url, archive: null });
