import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour } from './phase-four';
import { normalizePhaseFourInputs, phaseFourFieldStep } from './phase-four-inputs';

const calculatePublicAnnuity = (values: string[]) =>
  calculatePhaseFour('annuity', normalizePhaseFourInputs('annuity', values));

test('Annuity accepts terms that resolve to whole monthly payout periods', () => {
  const result = calculatePublicAnnuity(['100000', '5', '20.5', 'monthly']);
  assert.equal(result.error, undefined);
  assert.match(result.primary, /per monthly$/);
});

test('Annuity rejects terms that create fractional monthly payout periods', () => {
  const result = calculatePublicAnnuity(['100000', '5', '20.01', 'monthly']);
  assert.match(result.error ?? '', /valid range/i);
});

test('Annuity annual mode requires whole annual payout periods', () => {
  const valid = calculatePublicAnnuity(['100000', '5', '20', 'annual']);
  assert.equal(valid.error, undefined);

  const invalid = calculatePublicAnnuity(['100000', '5', '20.5', 'annual']);
  assert.match(invalid.error ?? '', /valid range/i);
});

test('Annuity years input steps in whole-month increments', () => {
  assert.equal(phaseFourFieldStep('annuity', 2, 'any'), '0.08333333333333333');
});
