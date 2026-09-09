import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseThreeA } from './phase-three-a';
import { phaseThreeAFieldLabel } from './phase-three-a-field-labels';

const label = (mode: string, key: 'first' | 'second') =>
  phaseThreeAFieldLabel('ohms-law', key, key === 'first' ? 'First known value' : 'Second known value', [mode, '2', '6']);

test('Ohm’s Law labels identify the actual known quantities for every operation', () => {
  assert.equal(label('voltage', 'first'), 'Current (A)');
  assert.equal(label('voltage', 'second'), 'Resistance (Ω)');
  assert.equal(label('current', 'first'), 'Voltage (V)');
  assert.equal(label('current', 'second'), 'Resistance (Ω)');
  assert.equal(label('resistance', 'first'), 'Voltage (V)');
  assert.equal(label('resistance', 'second'), 'Current (A)');
  assert.equal(label('power', 'first'), 'Voltage (V)');
  assert.equal(label('power', 'second'), 'Current (A)');
});

test('Ohm’s Law keeps non-Ohm fields and unknown modes on their declared labels', () => {
  assert.equal(phaseThreeAFieldLabel('electricity', 'power', 'Appliance power', ['1500']), 'Appliance power');
  assert.equal(label('unexpected', 'first'), 'First known value');
});

test('Ohm’s Law calculates all four supported relationships', () => {
  assert.equal(calculatePhaseThreeA('ohms-law', ['voltage', '2', '6']).primary, '12 V');
  assert.equal(calculatePhaseThreeA('ohms-law', ['current', '12', '6']).primary, '2 A');
  assert.equal(calculatePhaseThreeA('ohms-law', ['resistance', '12', '2']).primary, '6 Ω');
  assert.equal(calculatePhaseThreeA('ohms-law', ['power', '12', '2']).primary, '24 W');
});

test('Ohm’s Law rejects zero divisors but accepts zero in multiplication relationships', () => {
  assert.match(calculatePhaseThreeA('ohms-law', ['current', '12', '0']).error ?? '', /divisor/i);
  assert.match(calculatePhaseThreeA('ohms-law', ['resistance', '12', '0']).error ?? '', /divisor/i);
  assert.equal(calculatePhaseThreeA('ohms-law', ['voltage', '0', '6']).primary, '0 V');
  assert.equal(calculatePhaseThreeA('ohms-law', ['power', '12', '0']).primary, '0 W');
});
