const asAtPattern = /^as at (\d{1,2}) ([a-z]{3}) (\d{4})$/i;
const monthNumbers = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function observedOn(record) {
  if (record.observedOn != null) return validDate(record.observedOn) ? record.observedOn : null;

  // This legacy label states an explicit observation date; fiscal-year labels do not.
  const match = asAtPattern.exec(record.fy ?? '');
  if (!match) return null;
  const month = monthNumbers[match[2].toLowerCase()];
  if (!month) return null;
  const day = match[1].padStart(2, '0');
  const date = `${match[3]}-${month}-${day}`;
  return validDate(date) ? date : null;
}

export function pct(status) {
  if (typeof status !== 'string') return null;
  const values = new Set();
  let invalidProgressValue = false;

  for (const clause of status.split(/[;|\n]/)) {
    const percentages = [...clause.matchAll(/(?<![\d.,])([+-]?\d+(?:[.,]\d+)?)\s*%(?!\d)/g)];
    for (const match of percentages) {
      const rawValue = match[1];
      const before = clause.slice(0, match.index);
      const labels = [...before.matchAll(/\b(physical\s+progress|completion|implementation)\b/gi)];
      const label = labels.at(-1);
      if (label) {
        const labelName = label[1].toLowerCase();
        const labelStart = label.index;
        const precedingLabelText = before.slice(0, labelStart);
        const immediatelyBeforeLabel = precedingLabelText.slice(-40);
        const betweenLabelAndValue = before.slice(labelStart + label[0].length);
        if (/\b(?:target|planned|expected|proposed)\b/i.test(immediatelyBeforeLabel)) continue;
        if (/\b(?:target|planned|expected|financial|expenditure|allocation|budget|commitment|paid)\b/i.test(betweenLabelAndValue)) continue;
        if (labelName === 'implementation' && /\bfinancial\b/i.test(immediatelyBeforeLabel)) continue;
      } else {
        if (/\b(?:financial|expenditure|allocation|budget|commitment|paid|target|planned|expected|proposed)\b/i.test(before)) continue;
        const after = clause.slice(match.index + match[0].length);
        if (!/^\s*(?:\([^)]*\)\s*)?(?:[-–—:]\s*)?(?:complete(?:d)?\b|on-going\b|ongoing\b|works?\s+in\s+progress\b)/i.test(after)) continue;
      }

      if (!/^\d+$/.test(rawValue) || Number(rawValue) > 100) {
        invalidProgressValue = true;
        continue;
      }
      values.add(Number(rawValue));
    }
  }

  return !invalidProgressValue && values.size === 1 ? [...values][0] : null;
}

export function statusCountsFor(records, slug) {
  const byProject = new Map();
  let unidentified = 0;

  for (const p of records) {
    if (slug && p.ward !== slug) continue;
    if (p.status == null) continue;
    if (typeof p.projectId !== 'string' || !p.projectId.trim()) {
      unidentified++;
      continue;
    }

    let project = byProject.get(p.projectId);
    if (!project) {
      project = { observations: [], undated: 0 };
      byProject.set(p.projectId, project);
    }

    const value = pct(p.status);
    if (value == null) continue;

    const date = observedOn(p);
    if (!date) {
      project.undated++;
      continue;
    }
    project.observations.push({ date, value, sourceId: p.sourceId, page: p.page });
  }

  const summary = {
    done: 0,
    going: 0,
    none: 0,
    total: 0,
    undated: 0,
    conflicts: 0,
    unreported: 0,
    unidentified,
    observedFrom: null,
    observedThrough: null,
    sources: [],
  };
  const includedDates = [];
  const includedSources = new Map();
  for (const project of byProject.values()) {
    if (project.undated > 0) {
      summary.undated++;
      continue;
    }
    if (project.observations.length === 0) {
      summary.unreported++;
      continue;
    }

    const latestDate = project.observations.reduce(
      (latest, observation) => observation.date > latest ? observation.date : latest,
      project.observations[0].date,
    );
    const latestValues = new Set(
      project.observations.filter((observation) => observation.date === latestDate).map((observation) => observation.value),
    );
    if (latestValues.size !== 1) {
      summary.conflicts++;
      continue;
    }

    const [value] = latestValues;
    if (value === 100) summary.done++;
    else if (value === 0) summary.none++;
    else summary.going++;
    summary.total++;
    includedDates.push(latestDate);
    for (const observation of project.observations) {
      if (observation.date !== latestDate || !observation.sourceId) continue;
      const sourcePages = includedSources.get(observation.sourceId) ?? new Set();
      if (observation.page) sourcePages.add(observation.page);
      includedSources.set(observation.sourceId, sourcePages);
    }
  }
  if (includedDates.length > 0) {
    summary.observedFrom = includedDates.reduce((earliest, date) => date < earliest ? date : earliest);
    summary.observedThrough = includedDates.reduce((latest, date) => date > latest ? date : latest);
  }
  summary.sources = [...includedSources]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceId, pages]) => ({ sourceId, pages: [...pages].sort() }));
  return summary;
}
