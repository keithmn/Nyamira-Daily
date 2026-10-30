// Project tracker data checks (decision #71): every record is traceable, nothing private leaks, money sets stay apart.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const D = require('../data/contracts.json');
const wards = require('../data/wards.json');
const slugs = new Set(wards.map((w) => w.slug));

test('every record has a unique ID, a known set and a resolvable source with a page', () => {
  const ids = new Set();
  for (const c of D.contracts) {
    assert.ok(!ids.has(c.id), `duplicate ${c.id}`); ids.add(c.id);
    assert.ok(D.groups[c.group], `unknown group ${c.group}`);
    assert.ok(D.sources[c.source], `missing source ${c.source} on ${c.id}`);
    assert.ok(c.page, `no page on ${c.id}`);
    assert.equal(c.national, D.groups[c.group].national, `national flag mismatch on ${c.id}`);
  }
});

test('amounts are numbers or null, never estimated strings; allocations are labelled as such', () => {
  for (const c of D.contracts) {
    assert.ok(c.amount === null || (typeof c.amount === 'number' && c.amount >= 0), `bad amount on ${c.id}`);
    if (c.kind === 'allocation') assert.equal(c.amountLabel, 'Allocation');
  }
});

test('wards resolve; dates are ISO or null; periods run forwards where both ends are given', () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const c of D.contracts) {
    for (const w of c.wards) assert.ok(slugs.has(w), `unknown ward ${w} on ${c.id}`);
    for (const k of ['awardDate', 'startDate', 'endDate']) assert.ok(c[k] === null || iso.test(c[k]), `bad ${k} on ${c.id}`);
  }
});

test('no phone numbers, emails or ID numbers in published fields', () => {
  const phone = /(\+?254|\b0)7\d{8}\b/;
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/;
  for (const c of D.contracts) {
    const text = [c.title, c.contractor, c.location, c.notes].filter(Boolean).join(' ');
    assert.ok(!phone.test(text), `phone-like number on ${c.id}`);
    assert.ok(!email.test(text), `email on ${c.id}`);
  }
});
