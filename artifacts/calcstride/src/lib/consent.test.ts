import assert from 'node:assert/strict';
import test from 'node:test';
import { CONSENT_MAX_AGE_DAYS, createStoredConsent, parseStoredConsent } from './consent';

test('accepts a current analytics-only consent record', () => {
  const now = 1_700_000_000_000;
  const saved = JSON.stringify({
    analytics: true,
    expiresAt: now + CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  });
  assert.deepEqual(parseStoredConsent(saved, now), {
    essential: true,
    analytics: true,
    advertising: false,
  });
});

test('safely rejects expired, overlong, and malformed consent records', () => {
  const now = 1_700_000_000_000;
  assert.equal(parseStoredConsent(JSON.stringify({ analytics: true, expiresAt: now }), now), null);
  assert.equal(parseStoredConsent(JSON.stringify({ analytics: true, expiresAt: now + 181 * 24 * 60 * 60 * 1000 }), now), null);
  assert.equal(parseStoredConsent('%not-json', now), null);
  assert.equal(parseStoredConsent(JSON.stringify({ analytics: true, advertising: false, expiresAt: now + 1000 }), now), null);
});

test('stores only the analytics choice and expiration', () => {
  const stored = createStoredConsent({ essential: true, analytics: true, advertising: false }, 1_700_000_000_000);
  assert.deepEqual(Object.keys(stored).sort(), ['analytics', 'expiresAt']);
  assert.equal(stored.analytics, true);
});