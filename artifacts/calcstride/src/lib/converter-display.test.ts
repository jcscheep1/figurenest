import assert from 'node:assert/strict';
import test from 'node:test';
import { formatConverterResult } from './converter-display';

test('small valid conversions are not rounded to zero', () => {
  assert.equal(formatConverterResult(0.001), '0.001');
  assert.notEqual(formatConverterResult(0.000001), '0');
});

test('extremely small and large conversions remain meaningful', () => {
  assert.match(formatConverterResult(1e-18), /^1e-18$/i);
  assert.match(formatConverterResult(1e15), /^1e\+15$/i);
});

test('normal converter results stay readable', () => {
  assert.equal(formatConverterResult(3.280839895), '3.280839895');
  assert.equal(formatConverterResult(12345.6789), '12,345.6789');
});
