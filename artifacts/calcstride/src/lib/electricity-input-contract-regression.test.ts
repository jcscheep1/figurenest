import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseThreeA, phaseThreeADefinitions } from './phase-three-a';
import { phaseThreeAFieldStep } from './phase-three-a-field-contracts';

test('Electricity exposes a whole-number HTML step for day count', () => {
  const days = phaseThreeADefinitions.electricity.fields.find((field) => field.key === 'days');
  assert.ok(days);
  assert.equal(phaseThreeAFieldStep('electricity', 'days', days.step), '1');
});

test('Electricity still accepts its standard 30-day scenario', () => {
  const result = calculatePhaseThreeA('electricity', ['1500', 'W', '4', '30', '0.20'], 'USD');
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '180 kWh');
  assert.match(result.details[0]?.value ?? '', /36\.00/);
});

test('Electricity rejects fractional day counts rather than silently rounding them', () => {
  const result = calculatePhaseThreeA('electricity', ['1500', 'W', '4', '30.5', '0.20'], 'USD');
  assert.match(result.error ?? '', /whole day count/i);
});

test('Phase Three A keeps normal decimal stepping for other numeric fields', () => {
  assert.equal(phaseThreeAFieldStep('electricity', 'hours', 'any'), 'any');
  assert.equal(phaseThreeAFieldStep('density', 'mass', 'any'), 'any');
});
