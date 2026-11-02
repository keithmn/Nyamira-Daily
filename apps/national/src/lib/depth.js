// Debt and revenue, read from the registry. The debt report covers years that have ended and this year's interest is a plan,
// so the two are never joined into one line: each has its own stage, and the page says which is which.
import { sumFigures } from '@kbe/engine/compare';
import { fig } from './figures.js';

const DEBT_YEARS = ['2020-21', '2021-22', '2022-23', '2023-24', '2024-25'];
const debt = (year, key) => fig(`ke.fy${year}.spent.debt.${key}`);

export function debtYears() {
  return DEBT_YEARS.map((year) => ({
    fy: year.replace('-', '/'), year, stock: debt(year, 'stock'), external: debt(year, 'stock-external'), domestic: debt(year, 'stock-domestic'), shareOfGdp: debt(year, 'stock-gdp'),
    interest: debt(year, 'interest'), service: debt(year, 'service'), revenue: debt(year, 'revenue'),
    interestShare: Number((debt(year, 'interest').value / debt(year, 'revenue').value * 100).toFixed(1)),
  }));
}

const TAX_HEADS = [['income-tax', 'tax.income'], ['vat', 'tax.vat'], ['excise', 'tax.excise'], ['import-duty', 'tax.import'], ['other-taxes', 'tax.other']];

export function taxHeads() {
  const list = TAX_HEADS.map(([slug, key]) => ({ key, figure: fig(`statement.revenue.${slug}`) }));
  const total = sumFigures(list.map((t) => t.figure));
  return { total, rows: list.sort((a, b) => b.figure.value - a.figure.value).map((t) => ({ ...t, share: t.figure.value / total * 100 })) };
}

export const revenueYears = () => debtYears().map((y) => ({ fy: y.fy, value: y.revenue.value, figure: y.revenue }));
