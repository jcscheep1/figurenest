import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('Image Scaling preserves the normal aspect-ratio result', () => {
  const result = calculateCore('image-scaling', ['2400', '1600', '1200']);
  assert.equal(result.error, undefined);
  assert.equal(result.primary, '800 px tall');
});

test('Image Scaling rejects cleared required dimensions instead of returning a plausible zero result', () => {
  for (const inputs of [
    ['', '1600', '1200'],
    ['2400', '', '1200'],
    ['2400', '1600', ''],
    ['2400', '   ', '1200'],
  ]) {
    const result = calculateCore('image-scaling', inputs);
    assert.ok(result.error, `expected an error for ${JSON.stringify(inputs)}, got ${result.primary}`);
  }
});

test('Image Scaling still distinguishes explicit zero from a cleared field', () => {
  const zeroHeight = calculateCore('image-scaling', ['2400', '0', '1200']);
  assert.equal(zeroHeight.error, undefined);
  assert.equal(zeroHeight.primary, '0 px tall');

  const zeroTargetWidth = calculateCore('image-scaling', ['2400', '1600', '0']);
  assert.equal(zeroTargetWidth.error, undefined);
  assert.equal(zeroTargetWidth.primary, '0 px tall');
});
