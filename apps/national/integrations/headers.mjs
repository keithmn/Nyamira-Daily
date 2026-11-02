// Writes dist/_headers for Cloudflare Pages after each build. It hashes every inline script it finds, so a page cannot
// ship an inline script the policy has not allowed (DESIGN.md, "Content security policy").
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function policy(hashes, embed = false) {
  return [
    "default-src 'none'", `script-src 'self' ${hashes.join(' ')}`.trim(), "style-src 'self'", "style-src-attr 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'",
    "connect-src 'self'", "base-uri 'none'", "form-action 'self'", `frame-ancestors ${embed ? '*' : "'none'"}`,
  ].join('; ');
}

export function headersFile(hashes) {
  const common = ['Referrer-Policy: strict-origin-when-cross-origin', 'X-Content-Type-Options: nosniff', 'Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=()'];
  return [
    '/*', ...common.map((h) => `  ${h}`), `  Content-Security-Policy: ${policy(hashes)}`,
    '/embed/*', '  ! Content-Security-Policy', `  Content-Security-Policy: ${policy(hashes, true)}`,
    '/_astro/*', '  Cache-Control: public, max-age=31536000, immutable',
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
        writeFileSync(join(root, '_headers'), headersFile(hashes));
      },
    },
  };
}
