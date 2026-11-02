// Evaluates a `calc` formula such as "a + b" or "a / b * 100". Letters stand for the inputs, in order.
// A small parser, so figure files can never run code.
export function evaluate(formula, values) {
  const tokens = formula.match(/\s*(\d+(?:\.\d+)?|[a-z]|[-+*/()])/g)?.map((t) => t.trim()) ?? [];
  if (tokens.join('') !== formula.replace(/\s+/g, '')) throw new Error(`Formula has an unknown symbol: ${formula}`);
  let at = 0;
  const peek = () => tokens[at];
  function primary() {
    const t = tokens[at++];
    if (t === '(') { const v = sum(); if (tokens[at++] !== ')') throw new Error(`Unclosed bracket: ${formula}`); return v; }
    if (t === '-') return -primary();
    if (/^\d/.test(t ?? '')) return Number(t);
    if (/^[a-z]$/.test(t ?? '')) {
      const i = t.charCodeAt(0) - 97;
      if (i >= values.length) throw new Error(`Formula uses ${t} but has ${values.length} inputs: ${formula}`);
      return values[i];
    }
    throw new Error(`Cannot read formula: ${formula}`);
  }
  function product() {
    let v = primary();
    while (peek() === '*' || peek() === '/') v = tokens[at++] === '*' ? v * primary() : v / primary();
    return v;
  }
  function sum() {
    let v = product();
    while (peek() === '+' || peek() === '-') v = tokens[at++] === '+' ? v + product() : v - product();
    return v;
  }
  const result = sum();
  if (at !== tokens.length) throw new Error(`Cannot read formula: ${formula}`);
  return result;
}
