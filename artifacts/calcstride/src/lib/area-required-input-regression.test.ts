import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('Area Calculator rejects cleared required dimensions without rejecting an explicit zero', () => {
  const normal = calculateCore('area', ['12', '8']);
  assert.equal(normal.error, undefined);
  assert.equal(normal.primary, '96 m²');

  const blankLength = calculateCore('area', ['', '8']);
  assert.ok(blankLength.error, 'a cleared length must be invalid rather than being coerced to zero');

  const whitespaceWidth = calculateCore('area', ['12', '   ']);
  assert.ok(whitespaceWidth.error, 'a whitespace-only width must be invalid rather than being coerced to zero');

  const explicitZero = calculateCore('area', ['0', '8']);
  assert.equal(explicitZero.error, undefined);
  assert.equal(explicitZero.primary, '0 m²');
});
