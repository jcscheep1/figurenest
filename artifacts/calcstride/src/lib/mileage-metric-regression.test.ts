import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour, phaseFourDefinitions } from './phase-four';

test('Mileage exposes an explicit measurement-system selector', () => {
  const fields = phaseFourDefinitions.mileage.fields;
  assert.equal(fields[0]?.key, 'system');
  assert.equal(fields[0]?.type, 'select');
  assert.deepEqual(fields[0]?.options?.map((option) => option.value), ['imperial', 'metric']);
});

test('Mileage preserves US-customary MPG calculation', () => {
  const result = calculatePhaseFour('mileage', ['imperial', '120', '4']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '30.00 MPG');
});

test('Mileage calculates metric consumption without mixing units', () => {
  const result = calculatePhaseFour('mileage', ['metric', '100', '5']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '5.00 L/100 km');
  assert.ok(result.details.some((detail) => detail.label === 'Kilometres per litre' && detail.value === '20.00 km/L'));
});
