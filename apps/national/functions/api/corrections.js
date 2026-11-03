// Corrections intake for the national product (decision #102). It is the main site's service, not a copy: the same rules,
// Turnstile check, rate limit and retention, pointed at this Cloudflare Pages project's own D1 database and keys.
export { onRequest, onRequestPost } from '../../../../functions/api/corrections.js';
