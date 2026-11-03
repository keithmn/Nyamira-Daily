// Works out what a data release changes (build brief 4.6). A changed figure needs a reason written by a person:
// the log is automatic, the public wording is not (decision #44).
export function diffValues(previous, current) {
  const added = Object.keys(current).filter((id) => !(id in previous)).sort();
  const removed = Object.keys(previous).filter((id) => !(id in current)).sort().map((id) => ({ id, old: previous[id] }));
  const changed = Object.keys(current).filter((id) => id in previous && previous[id] !== current[id]).sort()
    .map((id) => ({ id, old: previous[id], new: current[id] }));
  return { added, removed, changed };
}

export function correctionEntries({ changed, removed }, reasons, date) {
  const entries = [...changed, ...removed.map((r) => ({ ...r, new: null }))];
  const missing = entries.filter((c) => !reasons[c.id]?.trim()).map((c) => c.id);
  if (missing.length) throw new Error(`These figures need a reason in data/national/reasons.json: ${missing.join(', ')}`);
  return entries.map((c) => ({ date, id: c.id, old: c.old, new: c.new, reason: reasons[c.id] }));
}

// Ids are never reused: an id dropped by an earlier release cannot come back meaning something else.
export function reusedIds(history, current) {
  const latest = history.at(-1) ?? {};
  return Object.keys(current).filter((id) => !(id in latest) && history.some((values) => id in values)).sort();
}

export const valuesOf = (figures) => Object.fromEntries([...figures.values()].map((f) => [f.id, f.value]).sort(([a], [b]) => (a < b ? -1 : 1)));
