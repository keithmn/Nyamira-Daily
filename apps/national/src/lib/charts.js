// Geometry for the charts, kept out of the components so it can be tested. All of it runs at build time.

// Bar widths as a share of the largest value. A real value of zero stays zero; a missing one has no bar at all.
export function barWidths(values) {
  const known = values.filter((v) => v != null);
  const top = known.length ? Math.max(...known) : 0;
  return values.map((v) => (v == null ? null : top ? Number((v / top * 100).toFixed(1)) : 0));
}

// Round steps for one axis, from zero upwards. The axis always starts at zero, so bars and lines are not exaggerated.
export function ticks(max, count = 4) {
  if (!(max > 0)) return [0];
  const rough = max / count, power = 10 ** Math.floor(Math.log10(rough)), step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough);
  const out = [];
  for (let v = 0; v < max + step * 0.999; v += step) out.push(Number(v.toFixed(6)));
  return out;
}

// Where the last value's label goes: above the line, or below it when the line comes down into the last point, so the
// text never sits on the line.
export function endLabelY(points) {
  const known = points.filter(Boolean), last = known.at(-1), before = known.at(-2);
  return before && before.y < last.y ? last.y + 20 : last.y - 10;
}

// A line on the 360-unit phone canvas (DESIGN.md, Charts). Points without a value leave a gap in the line.
export function linePoints(values, { width = 360, height = 200, left = 34, right = 14, top = 14, bottom = 26 } = {}) {
  const known = values.filter((v) => v != null), axis = ticks(Math.max(...known)), maxY = axis.at(-1);
  const x = (i) => left + (values.length > 1 ? i * (width - left - right) / (values.length - 1) : 0);
  const y = (v) => top + (1 - v / maxY) * (height - top - bottom);
  const points = values.map((v, i) => (v == null ? null : { x: Number(x(i).toFixed(1)), y: Number(y(v).toFixed(1)) }));
  const path = points.reduce((d, p, i) => (p ? `${d}${d && points[i - 1] ? 'L' : 'M'}${p.x} ${p.y}` : d), '');
  return { points, path, grid: axis.map((v) => ({ v, y: Number(y(v).toFixed(1)) })), width, height, left, right, base: Number(y(0).toFixed(1)) };
}
