import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityOneExpansion } from './priority-one-expansion';

test('Personal Loan keeps the standard 5-year amortization result', () => {
  const result = calculatePriorityOneExpansion('personal-loan', ['25000', '6.5', '5']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '$489.15');
  assert.equal(result.details[0]?.value, '$29,349.22');
  assert.equal(result.details[1]?.value, '$4,349.22');
});

test('Personal Loan rejects a zero-length repayment term', () => {
  const result = calculatePriorityOneExpansion('personal-loan', ['25000', '6.5', '0']);
  assert.match(result.error ?? '', /term must be greater than zero/i);
});

test('Personal Loan rejects terms that do not resolve to whole monthly payments', () => {
  const result = calculatePriorityOneExpansion('personal-loan', ['25000', '6.5', '0.1']);
  assert.match(result.error ?? '', /whole number of months/i);
});

test('Personal Loan accepts a valid three-month term', () => {
  const result = calculatePriorityOneExpansion('personal-loan', ['25000', '6.5', '0.25']);
  assert.equal(result.error, undefined);
  assert.match(result.primary, /^\$/);
});
