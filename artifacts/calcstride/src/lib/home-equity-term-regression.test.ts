import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityOneExpansion } from './priority-one-expansion';

test('Home Equity Loan rejects a zero-length repayment term', () => {
  const result = calculatePriorityOneExpansion('home-equity-loan', ['25000', '6.5', '0']);
  assert.match(result.error ?? '', /term must be greater than zero/i);
});

test('Home Equity Loan rejects terms that do not resolve to whole monthly payments', () => {
  const result = calculatePriorityOneExpansion('home-equity-loan', ['25000', '6.5', '0.1']);
  assert.match(result.error ?? '', /whole number of months/i);
});

test('Home Equity Loan keeps valid whole-month terms', () => {
  const result = calculatePriorityOneExpansion('home-equity-loan', ['25000', '6.5', '0.25']);
  assert.equal(result.error, undefined);
  assert.match(result.primary, /^\$/);
  assert.equal(result.details[0]?.label, 'Total payments');
  assert.equal(result.details[1]?.label, 'Total interest');
});
