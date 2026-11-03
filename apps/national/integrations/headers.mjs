// Writes dist/_headers for Cloudflare Pages after each build. It hashes every inline script it finds, so a page cannot
// ship an inline script the policy has not allowed (DESIGN.md, "Content security policy").
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { intakeSettings } from '../src/lib/intake.js';

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out); else if (name.endsWith('.html')) out.push(path);
  }
  return out;
};

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
// Inline scripts that run: a `src` loads a file, and a JSON data block is never executed
export function inlineScripts(html) {
  return [...html.matchAll(SCRIPT)].filter(([, attrs, body]) => !/\bsrc=/.test(attrs) && !/type="application\/json"/.test(attrs) && body.trim()).map(([, , body]) => body);
}
export const hash = (body) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;

// Turnstile, Cloudflare's anti-spam check, is the one outside script the product allows, and only on the corrections page
// of a build where intake is open (decision #102)
const TURNSTILE = 'https://challenges.cloudflare.com';

export function policy(hashes, embed = false, turnstile = false) {
  return [
    "default-src 'none'", ['script-src', "'self'", ...hashes, ...(turnstile ? [TURNSTILE] : [])].join(' '), ...(turnstile ? [`frame-src ${TURNSTILE}`] : []), "style-src 'self'", "style-src-attr 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'",
    "connect-src 'self'", "base-uri 'none'", "form-action 'self'", `frame-ancestors ${embed ? '*' : "'none'"}`,
  ].join('; ');
}

export function headersFile(hashes, { intakeOpen = false } = {}) {
  const common = [
    'Referrer-Policy: strict-origin-when-cross-origin', 'X-Content-Type-Options: nosniff', 'Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'Strict-Transport-Security: max-age=31536000', 'Cross-Origin-Opener-Policy: same-origin',
  ];
  return [
    '/*', ...common.map((h) => `  ${h}`), `  Content-Security-Policy: ${policy(hashes)}`,
    ...['/embed/*', '/sw/embed/*'].flatMap((path) => [path, '  ! Content-Security-Policy', `  Content-Security-Policy: ${policy(hashes, true)}`]),
    ...(intakeOpen ? ['/corrections/*', '/sw/corrections/*'].flatMap((path) => [path, '  ! Content-Security-Policy', `  Content-Security-Policy: ${policy(hashes, false, true)}`]) : []),
    '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable',
    // Open data: any site or tool may read the files, which hold nothing but published figures (build brief 5.13)
    ...['/api/*', '/data/*'].flatMap((path) => [path, '  Access-Control-Allow-Origin: *']),
    // The pictures change with each data release and keep their names, so they are cached for a day, not a year
    '/img/*', '  Cache-Control: public, max-age=86400',
    '',
  ].join('\n');
}

export function headers() {
  return {
    name: 'kbe-headers',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        const hashes = [...new Set(walk(root).flatMap((f) => inlineScripts(readFileSync(f, 'utf8')).map(hash)))].sort();
        writeFileSync(join(root, '_headers'), headersFile(hashes, { intakeOpen: intakeSettings(process.env).open }));
      },
    },
  };
}
