import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSite } from './site-config.js';

test('public builds require a configured site domain', () => {
  assert.throws(() => resolveSite({ build: true, env: {} }), /Set ND_SITE_URL/);
});

test('public builds reject draft-preview mode', () => {
  assert.throws(() => resolveSite({ build: true, env: { ND_SITE_URL: 'https://gusiidaily.org', ND_DRAFTS: '1' } }), /ND_DRAFTS/);
});

test('public builds reject placeholders and non-HTTPS origins', () => {
  assert.throws(() => resolveSite({ build: true, env: { ND_SITE_URL: 'https://gusii-daily.example' } }), /placeholder/);
  assert.throws(() => resolveSite({ build: true, env: { ND_SITE_URL: 'https://preview.example.org' } }), /placeholder/);
  assert.throws(() => resolveSite({ build: true, env: { ND_SITE_URL: 'http://gusiidaily.org' } }), /HTTPS/);
});

test('public builds accept an explicit HTTPS domain', () => {
  assert.equal(
    resolveSite({ build: true, env: { ND_SITE_URL: 'https://gusiidaily.org/' } }),
    'https://gusiidaily.org',
  );
});

test('local preview builds may use localhost but are blocked on recognized production hosts', () => {
  assert.equal(resolveSite({ build: true, env: { ND_PREVIEW_BUILD: '1' } }), 'http://localhost:4321');
  assert.throws(() => resolveSite({
    build: true,
    env: { ND_PREVIEW_BUILD: '1', ND_SITE_URL: 'http://localhost:4321', CONTEXT: 'production' },
  }), /not allowed on a production/);
});

test('site URL cannot contain credentials, query strings, or fragments', () => {
  for (const value of ['https://user:pass@gusiidaily.org', 'https://gusiidaily.org/?x=1', 'https://gusiidaily.org/#top']) {
    assert.throws(() => resolveSite({ build: true, env: { ND_SITE_URL: value } }), /without credentials/);
  }
});
