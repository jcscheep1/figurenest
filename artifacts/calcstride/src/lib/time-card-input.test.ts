import assert from 'node:assert/strict';
import test from 'node:test';
import { parseTimeCardNumber } from './time-card-input';

test('rejects an empty field instead of silently treating it as zero', () => {
  assert.equal(Number.isNaN(parseTimeCardNumber('')), true);
  assert.equal(Number.isNaN(parseTimeCardNumber('   ')), true);
});

test('preserves explicit zero and normal decimal values', () => {
  assert.equal(parseTimeCardNumber('0'), 0);
  assert.equal(parseTimeCardNumber('20'), 20);
  assert.equal(parseTimeCardNumber('1.5'), 1.5);
});
