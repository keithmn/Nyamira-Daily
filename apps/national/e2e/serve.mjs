// Serves dist with the headers the build wrote, so the tests run under the real content security policy.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.csv': 'text/csv; charset=utf-8', '.woff2': 'font/woff2', '.txt': 'text/plain' };

function globalHeaders() {
  const lines = readFileSync(join(dist, '_headers'), 'utf8').split('\n');
  const start = lines.indexOf('/*'), out = {};
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('  ')) break;
    const at = line.indexOf(':');
    out[line.slice(2, at)] = line.slice(at + 1).trim();
  }
  return out;
}

createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  let file = join(dist, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  const found = existsSync(file);
  if (!found) file = join(dist, '404.html');
  res.writeHead(found ? 200 : 404, { 'content-type': types[extname(file)] ?? 'application/octet-stream', ...globalHeaders() });
  res.end(readFileSync(file));
}).listen(4310, '127.0.0.1');
