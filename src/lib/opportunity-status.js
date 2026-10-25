const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}):(\d{2})\s+EAT)?(?:\s+\([^)]*\))?$/;

export function deadlineAt(value) {
  if (typeof value !== 'string') return null;
  const match = DATE_PREFIX.exec(value.trim());
  if (!match) return null;

  const [, date, hour, minute] = match;
  const [year, month, day] = date.split('-').map(Number);
  const h = hour == null ? 23 : Number(hour);
  const m = minute == null ? 59 : Number(minute);
  const second = hour == null ? 59 : 0;
  const utc = Date.UTC(year, month - 1, day, h - 3, m, second);
  const parsed = new Date(utc);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day ||
    h > 23 ||
    m > 59
  ) return null;
  return parsed;
}

export function opportunityState(item, now = new Date()) {
  if (item.status === 'cancelled' || item.status === 'canceled') return 'cancelled';
  if (item.status === 'closed') return 'closed';
  if (item.status !== 'open') return 'unknown';

  const deadline = deadlineAt(item.closes);
  if (!deadline) return 'deadline_unknown';
  return now.getTime() <= deadline.getTime() ? 'open' : 'closed';
}

export function opportunitiesAt(items, now = new Date()) {
  return items.map((item) => ({ ...item, availability: opportunityState(item, now) }));
}

export function daysUntilDeadline(item, now = new Date()) {
  const deadline = deadlineAt(item.closes);
  if (!deadline) return null;
  const day = (instant) => Math.floor((instant.getTime() + 3 * 60 * 60 * 1000) / 86400000);
  return Math.max(0, day(deadline) - day(now));
}
