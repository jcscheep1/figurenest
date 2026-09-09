import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('EV Charging Time does not round a positive duration down to zero', () => {
  const result = calculateCore('ev-charging-time', ['0.01', '11']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '<0.01 hours');
  assert.equal(result.details?.[0].value, '<1 min');
});

test('EV Charging Time preserves an actual zero-energy duration as zero', () => {
  const result = calculateCore('ev-charging-time', ['0', '11']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '0 hours');
  assert.equal(result.details?.[0].value, '0 hr 0 min');
});

test('EV Charging Time keeps ordinary duration formatting unchanged', () => {
  const result = calculateCore('ev-charging-time', ['52', '11']);
  assert.equal(result.primary, '4.73 hours');
  assert.equal(result.details?.[0].value, '4 hr 44 min');
});
