// Corrections intake opens only when this Cloudflare Pages project has its database and keys (decision #102). The three
// public settings are read at build time, with the same names as the main site's; the form and Turnstile's script appear
// only when all three are set, so a half-configured build never shows a form that cannot save.
export function intakeSettings(env = import.meta.env ?? {}) {
  const retentionDays = Number(env.PUBLIC_CORRECTION_RETENTION_DAYS);
  const siteKey = env.PUBLIC_TURNSTILE_SITE_KEY || '';
  const open = env.PUBLIC_CORRECTION_INTAKE_ENABLED === 'true' && Boolean(siteKey) && Number.isInteger(retentionDays) && retentionDays > 0;
  return { open, siteKey, retentionDays };
}

// The page field the shared service stores: the figure the reader came from, or the page they name
export const reportPage = (figure, page) => (figure ? `/corrections/?figure=${encodeURIComponent(figure)}` : page);
