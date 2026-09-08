import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseTwo } from './phase-two-expansion';

test('time-zone rejects a nonexistent local wall time during the spring DST gap', () => {
  const result = calculatePhaseTwo('time-zone', [
    '2026-03-08T02:30',
    'America/New_York',
    'Europe/London',
  ]);

  assert.ok(result.error, '02:30 does not exist in New York on the 2026 spring-forward date');
  assert.match(result.error, /valid|exist|daylight|DST|time/i);
});

test('time-zone converts a valid post-transition local time with the new DST offset', () => {
  const result = calculatePhaseTwo('time-zone', [
    '2026-03-08T03:30',
    'America/New_York',
    'Europe/London',
  ]);

  assert.equal(result.error, undefined);
  assert.match(result.primary, /7:30 AM/);
  assert.equal(result.details?.find((detail) => detail.label === 'UTC instant')?.value, '2026-03-08T07:30:00.000Z');
});

test('time-zone rejects an ambiguous repeated local wall time during the autumn DST fold', () => {
  const result = calculatePhaseTwo('time-zone', [
    '2026-11-01T01:30',
    'America/New_York',
    'Europe/London',
  ]);

  assert.match(result.error ?? '', /ambiguous|repeat|daylight|DST/i);
});
