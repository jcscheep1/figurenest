import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseTwo } from './phase-two-expansion';

const run = (first: string, second: string, third: string) =>
  calculatePhaseTwo('average', [first, second, third]);

test('Average Calculator preserves arithmetic mean and required-input boundaries', () => {
  const reference = run('-2', '4', '10');
  assert.equal(reference.primary, '4');
  assert.equal(reference.details.find((item) => item.label === 'Sum')?.value, '12');

  assert.equal(run('0', '0', '0').primary, '0', 'explicit zeros must remain valid');
  assert.equal(run('1.5', '2.5', '3.5').primary, '2.5', 'decimal inputs must remain supported');
  assert.equal(run('-5', '-10', '-15').primary, '-10', 'signed values must remain supported');

  assert.ok(run('', '2', '3').error, 'blank first value must be rejected');
  assert.ok(run('1', '   ', '3').error, 'whitespace-only second value must be rejected');
  assert.ok(run('1', '2', '').error, 'blank third value must be rejected');
  assert.ok(run('NaN', '2', '3').error, 'NaN must be rejected');
  assert.ok(run('Infinity', '2', '3').error, 'Infinity must be rejected');
  assert.ok(run('1000000000001', '2', '3').error, 'values above the supported numeric bound must be rejected');
});
