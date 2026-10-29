import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const towns = require('./towns.json');
const osm = require('../../data-src/osm-points.json');
const wards = require('./wards.json');

test('every mapped town or centre traces to its OpenStreetMap feature', () => {
  const byId = new Map(osm.map((p) => [p.props.id, p]));
  const slugs = new Set(wards.map((w) => w.slug));
  const names = new Set();
  for (const place of towns.places) {
    const feature = byId.get(place.osm);
    assert.ok(feature, `${place.name}: ${place.osm} is not in osm-points.json`);
    assert.equal(place.lon, feature.lon);
    assert.equal(place.lat, feature.lat);
    assert.equal(place.name.toLowerCase(), feature.props.name.toLowerCase());
    assert.ok(slugs.has(place.ward), `${place.name}: unknown ward ${place.ward}`);
    assert.ok(['town', 'centre'].includes(place.kind));
    assert.ok(!names.has(place.name), `${place.name} is listed twice`);
    names.add(place.name);
  }
  assert.deepEqual(towns.places.filter((p) => p.kind === 'town').map((p) => p.name), ['Nyamira', 'Kebirigo', 'Keroka']);
  assert.equal(towns.evidence, 'unverified');
});
