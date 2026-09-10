import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('core calculator blank input regression', () => {
  assert.ok(calculateCore('salary', ['60000', '', '52']).error);
  assert.ok(calculateCore('overtime', ['24', '8', '']).error);
  assert.ok(calculateCore('vat', ['100', '']).error);
  assert.ok(calculateCore('area', ['12', '']).error);
  assert.ok(calculateCore('volume', ['4', '3', '']).error);
});
