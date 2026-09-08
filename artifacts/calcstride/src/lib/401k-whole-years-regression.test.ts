import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseFour, phaseFourDefinitions } from './phase-four';

test('401(k) preserves the documented annual-compounding projection', () => {
  const result = calculatePhaseFour('401k', ['25000', '10000', '3000', '6', '20']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$558,391.07');
  assert.deepEqual(result.details, [
    { label: 'Current balance', value: '$25,000.00' },
    { label: 'Employee deposits', value: '$200,000.00' },
    { label: 'Employer deposits', value: '$60,000.00' },
  ]);
});

test('401(k) keeps zero-return annual contributions exact', () => {
  const result = calculatePhaseFour('401k', ['25000', '10000', '3000', '0', '20']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$285,000.00');
});

test('401(k) rejects fractional years because deposits are modeled annually', () => {
  const result = calculatePhaseFour('401k', ['25000', '10000', '3000', '6', '20.5']);
  assert.match(result.error ?? '', /whole number/i);
  assert.equal(result.details.length, 0);
});

test('401(k) years input advertises whole-year stepping', () => {
  const years = phaseFourDefinitions['401k'].fields.find((field) => field.key === 'years');
  assert.equal(years?.step, '1');
});
