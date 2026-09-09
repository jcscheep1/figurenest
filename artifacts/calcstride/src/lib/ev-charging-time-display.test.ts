import assert from 'node:assert/strict';
import test from 'node:test';
import { formatEvChargingTimeDisplay } from './ev-charging-time-display';
import { calculateCore } from './core-calculators';

test('EV Charging Time preserves positive sub-minute durations in the page display', () => {
  const engine = calculateCore('ev-charging-time', ['0.01', '10']);
  assert.equal(engine.primary, '<0.01 hours');
  assert.equal(engine.details?.[0].value, '<1 min');

  const display = formatEvChargingTimeDisplay(0.01 / 10);
  assert.equal(display.primary, '<0.01 hours');
  assert.equal(display.duration, '<1 min');
});

test('EV Charging Time display keeps ordinary rounded duration output', () => {
  const display = formatEvChargingTimeDisplay(52 / 11);
  assert.equal(display.primary, '4.73 hours');
  assert.equal(display.duration, '4 hr 44 min');
});

test('EV Charging Time display preserves an explicit zero-energy boundary', () => {
  const display = formatEvChargingTimeDisplay(0);
  assert.equal(display.primary, '0 hours');
  assert.equal(display.duration, '0 hr 0 min');
});
