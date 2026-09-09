import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePhaseTwo } from './phase-two-expansion';

const run = (experimental: string, accepted: string) =>
  calculatePhaseTwo('percent-error', [experimental, accepted]);

test('Percent Error handles sign, equality, and required-input boundaries', () => {
  assert.equal(run('9.5', '10').primary, '5%');
  assert.equal(run('-9.5', '-10').primary, '5%');
  assert.equal(run('10', '10').primary, '0%');
  assert.equal(run('-12', '10').primary, '220%');

  assert.ok(run('1', '0').error, 'accepted value zero must remain invalid');
  assert.ok(run('', '10').error, 'blank experimental value must be rejected');
  assert.ok(run('10', '   ').error, 'blank accepted value must be rejected');
  assert.ok(run('NaN', '10').error, 'non-finite experimental input must be rejected');
});
