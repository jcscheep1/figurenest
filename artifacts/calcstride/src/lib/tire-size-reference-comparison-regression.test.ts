import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour, phaseFourDefinitions } from './phase-four';

test('tire size compares two complete sidewall sizes instead of requiring a precomputed reference diameter', () => {
  const definition = phaseFourDefinitions['tire-size'];
  assert.deepEqual(definition.fields.map((field) => field.key), [
    'width', 'aspect', 'rim', 'referenceWidth', 'referenceAspect', 'referenceRim',
  ]);

  const same = calculatePhaseFour('tire-size', ['225', '45', '17', '225', '45', '17']);
  assert.equal(same.error, undefined);
  assert.equal(same.primary, '24.97 in diameter');
  assert.ok(same.details.some((detail) => detail.label === 'Reference tire diameter' && detail.value === '24.97 in'));
  assert.ok(same.details.some((detail) => detail.label === 'Diameter / speedometer delta' && detail.value === '0.00%'));
  assert.ok(same.details.some((detail) => detail.label === 'When speedometer indicates 60 mph' && detail.value === 'actual ≈ 60.0 mph'));

  const plusSize = calculatePhaseFour('tire-size', ['235', '40', '18', '225', '45', '17']);
  assert.equal(plusSize.error, undefined);
  assert.equal(plusSize.primary, '25.40 in diameter');
  assert.ok(plusSize.details.some((detail) => detail.label === 'Reference tire diameter' && detail.value === '24.97 in'));
  assert.ok(plusSize.details.some((detail) => detail.label === 'Diameter / speedometer delta' && detail.value === '1.72%'));
  assert.ok(plusSize.details.some((detail) => detail.label === 'When speedometer indicates 60 mph' && detail.value === 'actual ≈ 61.0 mph'));
});
