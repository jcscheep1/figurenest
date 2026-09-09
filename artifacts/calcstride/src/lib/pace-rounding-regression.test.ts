import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityOneExpansion } from './priority-one-expansion';

test('Pace Calculator carries rounded 60 seconds into the next minute', () => {
  const normal = calculatePriorityOneExpansion('pace', ['5', '25']);
  assert.equal(normal.error, undefined);
  assert.equal(normal.primary, '5:00 per km');

  const carryBoundary = calculatePriorityOneExpansion('pace', ['5', '24.995']);
  assert.equal(carryBoundary.error, undefined);
  assert.equal(carryBoundary.primary, '5:00 per km');
  assert.doesNotMatch(carryBoundary.primary, /:60\b/);

  const ordinarySeconds = calculatePriorityOneExpansion('pace', ['5', '24.5']);
  assert.equal(ordinarySeconds.primary, '4:54 per km');

  const zeroDistance = calculatePriorityOneExpansion('pace', ['0', '25']);
  assert.match(zeroDistance.error ?? '', /distance must be greater than zero/i);
});
