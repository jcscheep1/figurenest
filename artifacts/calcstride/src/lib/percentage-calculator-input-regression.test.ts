import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('percentage calculator validates required numeric inputs', () => {
  assert.deepEqual(calculateCore('percentage', ['25', '80']), { primary: '20' });
  assert.deepEqual(calculateCore('percentage', ['0', '80']), { primary: '0' });
  assert.deepEqual(calculateCore('percentage', ['25', '0']), { primary: '0' });
  assert.ok(calculateCore('percentage', ['', '80']).error);
  assert.ok(calculateCore('percentage', ['25', '']).error);
  assert.ok(calculateCore('percentage', ['Infinity', '80']).error);
  assert.ok(calculateCore('percentage', ['25', '-1']).error);
});
