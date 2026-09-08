import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRequiredNumber } from './required-number';

test('parseRequiredNumber distinguishes missing input from an intentional zero', () => {
  assert.ok(Number.isNaN(parseRequiredNumber('')));
  assert.ok(Number.isNaN(parseRequiredNumber('   ')));
  assert.equal(parseRequiredNumber('0'), 0);
  assert.equal(parseRequiredNumber('30'), 30);
  assert.equal(parseRequiredNumber('1.5'), 1.5);
});
