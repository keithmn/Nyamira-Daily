// The only way page code may add or compare figures. These functions refuse the sums that mislead readers:
// across stages, years or groupings, and county money with NG-CDF or national money (build brief 4.1).
import { STAGES } from './schema.js';

function need(same, list, what) {
  for (const key of same) {
    const values = new Set(list.map((f) => f[key]));
    if (values.size > 1) throw new Error(`Refusing to ${what} figures with different ${key}: ${[...values].join(', ')}`);
  }
}

export function sumFigures(list) {
  if (!list.length) throw new Error('Nothing to add up');
  need(['fy', 'stage', 'grouping', 'money', 'unit'], list, 'add');
  return list.reduce((a, f) => a + f.value, 0);
}

// Change between two figures. Different years are allowed only like with like: same stage, grouping and money.
export function compareFigures(a, b) {
  need(['stage', 'grouping', 'money', 'unit'], [a, b], 'compare');
  return { from: a.value, to: b.value, change: b.value - a.value, percent: a.value === 0 ? null : (b.value - a.value) / a.value * 100 };
}

// One figure through its stages: the labelled "stage change" view. It never produces a total. Documents print money
// in different units, so those can sit side by side, but no change is worked out between them: a figure rounded to
// KSh 0.1bn minus an exact one is mostly rounding.
const MONEY_UNITS = ['KSh', 'KSh m', 'KSh bn'];
export function stageChange(list) {
  need(['fy', 'grouping', 'money'], list, 'show a stage change for');
  if (!list.every((f) => MONEY_UNITS.includes(f.unit))) need(['unit'], list, 'show a stage change for');
  const stages = list.map((f) => f.stage);
  if (new Set(stages).size !== stages.length) throw new Error('A stage change needs one figure per stage');
  const ordered = [...list].sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage));
  return ordered.map((f, i) => ({ stage: f.stage, value: f.value, unit: f.unit, change: i && ordered[i - 1].unit === f.unit ? f.value - ordered[i - 1].value : null, id: f.id }));
}
