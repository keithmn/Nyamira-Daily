// Questions to ask about one road, generated only from what its documents say (editorial rules:
// questions, not accusations). Each question carries its documents; questions that need someone
// to look at the road are marked siteVisit ("Needs a site visit").
import { pct } from './project-status.js';
import { amountStatus, amountLabel } from './project-amounts.js';
import { gradeLabel } from './road-conditions.js';

const fyLabel = (fy) => (fy.startsWith('as at') ? fy : `FY${fy}`);
const money = (amount) => (amountStatus(amount) === 'unavailable' ? 'an amount the document does not state' : amountLabel(amount));

// "100% – Completed. Payment made | Contractor: …" → "100% – Completed. Payment made"
export function statusText(status) {
  if (!status) return null;
  return status.split('|')[0].replace(/^expenditure to date as reported;\s*/i, '').replace(/^amount paid to date;\s*/i, '').trim();
}

export function contractorOf(status) {
  const match = status?.match(/Contractor:\s*([^;|]+)/);
  return match ? match[1].trim() : null;
}

export function expenditureOf(status) {
  const match = status?.match(/expenditure to date KSh\s*([\d,]+(?:\.\d+)?)/i);
  return match ? Number(match[1].replaceAll(',', '')) : null;
}

// records: the road's project records, newest first. docOf(record) and findingDoc(finding)
// return { title, url, page } for citing. condition: the latest reviewed condition, or null.
export function roadQuestions({ road, records, findings = [], docOf, findingDoc, condition = null }) {
  const questions = [];
  let completedIn = null;
  const groups = new Map();
  for (const record of records) {
    // One contract reported in several documents (same sum to the shilling) is one question citing
    // all of them; budget lines stay separate allocations.
    const key = record.kind !== 'budgeted' && amountStatus(record.amount) === 'reported_amount'
      ? `money|${Math.round(record.amount)}`
      : `${record.projectId}|${record.sourceId}|${record.fy}`;
    (groups.get(key) ?? groups.set(key, []).get(key)).push(record);
  }

  for (const group of groups.values()) {
    const primary = group.find((r) => r.kind === 'contract') ?? group.find((r) => r.kind === 'budgeted') ?? group[0];
    const status = primary.status ?? group.find((r) => r.status)?.status ?? null;
    const shown = statusText(status);
    const progress = pct(status);
    const docs = [...new Map(group.map((r) => [`${r.sourceId}|${r.page}`, docOf(r)])).values()];
    const when = fyLabel(primary.fy);
    if (primary.kind === 'budgeted') {
      questions.push({ docs, siteVisit: false,
        text: `${money(primary.amount)} was budgeted for this in ${when}. Ask the county's Roads department whether work has started, and who is doing it.` });
    } else if (/terminated/i.test(shown || '')) {
      questions.push({ docs, siteVisit: false,
        text: `The contract for ${when} (${money(primary.amount)}) is reported as "${shown}". Ask who holds the contract now, and what was paid under the first one.` });
    } else if (progress === 100) {
      completedIn ??= { when, docs };
      const awaiting = /await(ing)? payment/i.test(status) ? ', with payment still awaited' : '';
      questions.push({ docs, siteVisit: true,
        text: `Reported complete in the ${when} records (${money(primary.amount)})${awaiting}. The document gives no inspection date. Is the work in good condition today?` });
    } else if (progress != null) {
      const spent = expenditureOf(status) === 0 ? ' Expenditure to date is reported as KSh 0.' : '';
      questions.push({ docs, siteVisit: true,
        text: `Reported ${progress}% done in the ${when} records ("${shown}"); the document gives no date for this figure.${spent} Ask for the current progress and the expected completion date.` });
    } else if (shown) {
      questions.push({ docs, siteVisit: true,
        text: `The ${when} records (${money(primary.amount)}) describe this as "${shown}". Ask what has happened since.` });
    } else {
      questions.push({ docs, siteVisit: false,
        text: `${money(primary.amount)} is recorded for this in ${when}. Ask what work it paid for and whether it is finished.` });
    }
  }

  // A reviewed report of a poor or impassable road: the gap between the records and the road.
  if (condition && ['poor', 'impassable'].includes(condition.grade)) {
    const seen = { title: condition.reports[0].source, page: `report of ${condition.observedOn}` };
    const grade = gradeLabel[condition.grade];
    questions.unshift(completedIn
      ? { docs: [...completedIn.docs, seen], siteVisit: false,
        text: `Reported complete in the ${completedIn.when} records, but a reviewed report from ${condition.observedOn} grades it ${grade}. Ask whether the contractor must repair defects, or when the county will repair it.` }
      : { docs: [seen], siteVisit: false,
        text: `A reviewed report from ${condition.observedOn} grades it ${grade}. Ask the county's Roads department when it will be repaired, and from which budget.` });
  }

  for (const finding of findings) {
    const amount = finding.amountKsh ? ` The finding concerns ${amountLabel(finding.amountKsh)}.` : '';
    questions.push({ docs: [findingDoc(finding)], siteVisit: false,
      text: `The Auditor-General reported "${finding.title}" for FY${finding.fy}.${amount} Ask the county whether it has acted on this finding.` });
  }

  // Money in more than one year is raised only for records an editor confirmed are the same road;
  // one contract reported in two documents is not two allocations.
  if (road.confirmedGroup) {
    const allocations = [...groups.values()].map((g) => g.find((r) => r.kind !== 'spent')).filter(Boolean);
    const years = [...new Set(allocations.map((r) => r.fy))];
    if (years.length > 1) {
      questions.push({ docs: records.map(docOf), siteVisit: false,
        text: `Money for this road appears in ${years.length} years of records (${years.map(fyLabel).join(', ')}). Ask what each allocation paid for.` });
    }
  }
  return questions;
}
