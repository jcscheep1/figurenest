import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityOneExpansion, priorityOneExpansionDefinitions } from './priority-one-expansion';

test('Tip Calculator requires a whole positive number of people', () => {
  const normal = calculatePriorityOneExpansion('tip', ['100', '20', '2']);
  assert.equal(normal.error, undefined);
  assert.equal(normal.primary, '$60.00');
  assert.equal(normal.details.find((detail) => detail.label === 'Tip')?.value, '$20.00');
  assert.equal(normal.details.find((detail) => detail.label === 'Total bill')?.value, '$120.00');

  const fractional = calculatePriorityOneExpansion('tip', ['100', '20', '2.5']);
  assert.match(fractional.error ?? '', /whole|integer|people/i);

  const zero = calculatePriorityOneExpansion('tip', ['100', '20', '0']);
  assert.match(zero.error ?? '', /greater than zero|positive/i);
});

test('Tip Calculator exposes a whole-person input step', () => {
  const people = priorityOneExpansionDefinitions.tip.fields.find((field) => field.key === 'people');
  assert.ok(people);
  assert.equal(people.step, '1');
  assert.equal(people.min, 1);
});
