// Official notices: hearings, calls for comments and dates the Treasury announces, each from a document on an official
// site (data/national/notices.json, decision #103). A notice is upcoming until its last date passes, then closed, and it
// stays on the page as closed for 90 days so a reader can see what they missed and where the next one will be announced.
import { daysBetween } from './calendar.js';

const RECENT_DAYS = 90;
const last = (n) => n.dates.at(-1);

export function noticeState(n, today) {
  if (last(n) >= today) return 'upcoming';
  return daysBetween(last(n), today) <= RECENT_DAYS ? 'closed' : 'old';
}

export const upcoming = (list, today, kinds = ['hearing', 'comments']) => list.filter((n) => kinds.includes(n.kind) && noticeState(n, today) === 'upcoming').sort((a, b) => a.dates[0].localeCompare(b.dates[0]));
export const recentlyClosed = (list, today) => list.filter((n) => n.kind !== 'deadline' && noticeState(n, today) === 'closed').sort((a, b) => last(b).localeCompare(last(a)));

// An announced date for a stage that comes before the law's latest date: the reader should see the earlier one
export function announced(list, stage, today, legalDate) {
  return list.filter((n) => n.kind === 'deadline' && n.stage === stage && noticeState(n, today) === 'upcoming' && n.dates[0] < legalDate)
    .sort((a, b) => a.dates[0].localeCompare(b.dates[0]))[0] ?? null;
}

// The Budget Policy Statement is named after the year its financial year starts in: the one due in November 2026 or
// February 2027 is the 2027 statement, for FY2027/28
export const bpsYear = (date) => Number(date.slice(0, 4)) + (Number(date.slice(5, 7)) >= 7 ? 1 : 0);
