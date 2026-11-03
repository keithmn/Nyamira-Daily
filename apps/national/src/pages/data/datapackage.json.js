// A Frictionless Data package describing every published file, so tools can load them by name
import { site } from '../../site.js';
import { LICENCE, json } from '../../lib/api.js';
import { release } from '../../lib/figures.js';
import { downloads, mediatype, perCounty, perVote } from '../../lib/downloads.js';
import { href } from '../../lib/routes.js';

export function GET({ site: base }) {
  const path = (p) => (base ? new URL(href('en', p), base).href : href('en', p).replace(/^\//, ''));
  return json({
    profile: 'data-package', name: 'kenya-budget-explained', title: `${site.name}: Kenya's national and county budget figures`, version: release,
    licenses: [LICENCE], contributors: [{ title: site.publisher, role: 'publisher' }],
    resources: [...downloads(), ...perVote(), ...perCounty()].map((d) => ({ name: d.name, path: path(d.path), format: d.format, mediatype: mediatype(d.format) })),
  });
}
