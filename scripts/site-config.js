const reservedHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', 'example.com', 'example.org', 'example.net']);

export function resolveSite({ build, env = process.env }) {
  const productionHost =
    env.CONTEXT === 'production' ||
    env.VERCEL_ENV === 'production' ||
    env.GITHUB_PAGES === 'true' ||
    (env.CF_PAGES === '1' && env.CF_PAGES_BRANCH === 'main');
  const preview = env.ND_PREVIEW_BUILD === '1';

  if (productionHost && preview) {
    throw new Error('ND_PREVIEW_BUILD=1 is not allowed on a production hosting environment.');
  }
  if (build && !preview && env.ND_DRAFTS === '1') {
    throw new Error('ND_DRAFTS=1 is not allowed in a public build.');
  }

  const configured = env.ND_SITE_URL;
  if (build && !preview && !configured) {
    throw new Error('Set ND_SITE_URL to the real public HTTPS domain before building a public site.');
  }

  if (!configured) return 'http://localhost:4321';

  let url;
  try {
    url = new URL(configured);
  } catch {
    throw new Error(`ND_SITE_URL must be an absolute URL; received "${configured}".`);
  }

  const host = url.hostname.toLowerCase();
  const reserved = reservedHosts.has(host) ||
    ['.example', '.invalid', '.test', '.local', '.example.com', '.example.net', '.example.org'].some((suffix) => host.endsWith(suffix));
  if (reserved) {
    if (build && !preview) throw new Error('ND_SITE_URL must not use a placeholder, preview, or local hostname.');
    if (!preview && build) throw new Error('Use ND_PREVIEW_BUILD=1 only for local preview builds.');
  }
  if (build && !preview && url.protocol !== 'https:') {
    throw new Error('Public builds require ND_SITE_URL to use HTTPS.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('ND_SITE_URL must be a site origin or base path without credentials, query, or fragment.');
  }
  return url.toString().replace(/\/$/, '');
}
