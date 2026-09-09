import test from 'node:test';
import assert from 'node:assert/strict';
import { priorityOneExpansionDefinitions } from './priority-one-expansion';

test('Personal Loan term input exposes a one-month browser step and positive minimum', () => {
  const term = priorityOneExpansionDefinitions['personal-loan'].fields.find(field => field.key === 'years');
  assert.ok(term);
  assert.equal(term.min, 1 / 12);
  assert.equal(term.step, String(1 / 12));
});

test('Personal Loan amount and rate retain decimal input support', () => {
  const [amount, rate] = priorityOneExpansionDefinitions['personal-loan'].fields;
  assert.equal(amount.step, 'any');
  assert.equal(rate.step, 'any');
});
