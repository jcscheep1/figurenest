import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCore } from './core-calculators';

test('DPI/PPI Calculator rejects cleared required inputs without rejecting explicit zero pixels', () => {
  const normal = calculateCore('dpi-ppi', ['2400', '8']);
  assert.equal(normal.error, undefined);
  assert.equal(normal.primary, '300 PPI');

  const blankPixels = calculateCore('dpi-ppi', ['', '8']);
  assert.ok(blankPixels.error, 'a cleared pixel width must be invalid rather than being coerced to zero');

  const whitespacePixels = calculateCore('dpi-ppi', ['   ', '8']);
  assert.ok(whitespacePixels.error, 'a whitespace-only pixel width must be invalid rather than being coerced to zero');

  const blankPrintWidth = calculateCore('dpi-ppi', ['2400', '']);
  assert.ok(blankPrintWidth.error, 'a cleared print width must be invalid rather than relying on zero coercion');

  const explicitZeroPixels = calculateCore('dpi-ppi', ['0', '8']);
  assert.equal(explicitZeroPixels.error, undefined);
  assert.equal(explicitZeroPixels.primary, '0 PPI');
});
