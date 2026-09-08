import assert from 'node:assert/strict';
import test from 'node:test';
import { calculatePhaseThreeB } from './phase-three-b';

test('matrix determinant and inverse ignore unused Matrix B inputs', () => {
  const determinant = calculatePhaseThreeB('matrix', [
    'determinant',
    '2',
    '2',
    '',
    '',
    '1,2\n3,4',
    '',
  ]);
  assert.equal(determinant.error, undefined);
  assert.equal(determinant.primary, '-2');

  const inverse = calculatePhaseThreeB('matrix', [
    'inverse',
    '2',
    '2',
    'not-used',
    'not-used',
    '1,2\n3,4',
    'not-used',
  ]);
  assert.equal(inverse.error, undefined);
  assert.equal(inverse.primary, '[-2, 1]\n[1.5, -0.5]');
});

test('matrix two-matrix operations still require valid Matrix B inputs', () => {
  assert.ok(calculatePhaseThreeB('matrix', [
    'add',
    '2',
    '2',
    '',
    '',
    '1,2\n3,4',
    '',
  ]).error);
});
