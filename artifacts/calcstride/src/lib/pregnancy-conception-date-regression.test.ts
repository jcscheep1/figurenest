import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseThreeC } from './phase-three-c';

test('pregnancy-conception rejects impossible Gregorian calendar dates', () => {
  for (const lastPeriod of ['2026-02-30', '2025-02-29', '2026-04-31']) {
    const output = calculatePhaseThreeC('pregnancy-conception', [lastPeriod, '28', '5']);
    assert.ok(output.error, `${lastPeriod} must be rejected instead of normalized`);
    assert.deepEqual(output.details, []);
  }
});

test('pregnancy-conception accepts a real leap-day last-period date', () => {
  const output = calculatePhaseThreeC('pregnancy-conception', ['2024-02-29', '28', '5']);
  assert.equal(output.error, undefined);
  assert.equal(output.primary, '2024-03-28');
  assert.equal(output.details[0]?.label, 'Estimated ovulation');
  assert.equal(output.details[0]?.value, '2024-03-14');
});
