import test from 'node:test';
import assert from 'node:assert/strict';
import { FEET_PER_METRE, normalizeVoltageDropValues } from './voltage-drop-units';

test('Voltage Drop keeps feet unchanged for the legacy calculator contract', () => {
  assert.deepEqual(
    normalizeVoltageDropValues(['10', '100', 'ft', '1.24', 'single']),
    ['10', '100', '1.24', 'single'],
  );
});

test('Voltage Drop converts metres to feet before the legacy formula runs', () => {
  const normalized = normalizeVoltageDropValues(['10', '30.48', 'm', '1.24', 'single']);
  assert.ok(Math.abs(Number(normalized[1]) - 100) < 1e-10);
  assert.deepEqual(normalized, ['10', String(30.48 * FEET_PER_METRE), '1.24', 'single']);
});
