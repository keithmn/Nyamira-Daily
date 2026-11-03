// The figure and source shapes. These Zod schemas are the single definition of both (build brief 4.1, 4.2).
import { z } from 'astro/zod';

// Budget stages in order. `law` is for the county Acts; `approved` is the Appropriation Act (decision #89).
export const STAGES = ['recommendation', 'bps', 'estimates', 'statement', 'law', 'approved', 'supplementary-1', 'supplementary-2', 'supplementary-3', 'released', 'spent', 'audited'];
export const LEVELS = ['total', 'sector', 'thematic', 'vote', 'programme', 'subprogramme', 'allocation', 'economic', 'taxhead', 'county', 'project', 'debt', 'measure'];
export const LABELS = ['official', 'verified', 'audit', 'unverified'];
export const UNITS = ['KSh', 'KSh m', 'KSh bn', '%', 'count'];
// Whose money. NG-CDF is national money run by constituency committees and is never added to county money.
export const MONEY = ['national', 'county', 'ng-cdf'];
export const CLAUDE = 'claude-code';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const figureId = z.string().regex(/^ke\.fy\d{4}-\d{2}\.[a-z0-9.-]+$/);

export const Figure = z.strictObject({
  id: figureId,
  name: z.string().min(1),
  value: z.number().finite(),
  unit: z.enum(UNITS),
  fy: z.string().regex(/^\d{4}\/\d{2}$/),
  stage: z.enum(STAGES),
  level: z.enum(LEVELS),
  grouping: z.string().min(1), // the way the document cuts the money, such as "ministerial-sector" or "thematic-area"
  money: z.enum(MONEY),
  parent: figureId.nullable().default(null), // children must add up to this figure, within the document's tolerance
  within: figureId.optional(), // sits inside this figure, but the document lists only some of its parts
  parts: z.array(figureId).min(2).optional(), // printed parts that must add up to this figure
  label: z.enum(LABELS),
  source: z.string().min(1),
  page: z.string().min(1),
  pdfPage: z.number().int().positive().nullable(),
  calc: z.strictObject({ formula: z.string().min(1), inputs: z.array(figureId).min(1), round: z.number().int().min(0).max(6) }).optional(),
  checkedOn: isoDate,
  checkedBy: z.string().min(1),
  note: z.string().min(1).optional(),
});

export const Source = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().min(1),
  docType: z.enum(['act', 'budget-document', 'recommendation', 'guide', 'report', 'press']),
  fy: z.string().regex(/^\d{4}\/\d{2}$/),
  stage: z.enum(STAGES),
  date: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
  url: z.url(),
  archive: z.url().nullable(), // Wayback Machine copy; null means none is known yet
  sha256: z.string().regex(/^[0-9a-f]{64}$/).nullable(), // of the copy in data-src/national/pdfs/, not stored in Git (decision #27)
  file: z.string().nullable(),
  pageOffset: z.number().int().nullable(), // printed page = PDF page + pageOffset; null where numbering is not simple
  tolerance: z.partialRecord(z.enum(UNITS), z.number().nonnegative()), // rounding allowed when parts are added up
  nextExpected: z.strictObject({ date: isoDate, what: z.string().min(1) }).nullable(),
  note: z.string().min(1).optional(),
});
