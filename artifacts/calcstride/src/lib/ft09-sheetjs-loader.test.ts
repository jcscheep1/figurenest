import assert from 'node:assert/strict';
import test from 'node:test';
import { loadFt09SheetJs } from './ft09-sheetjs-loader';

test('loads SheetJS only through the FT-09 dynamic import boundary', async () => {
  const first = loadFt09SheetJs();
  const second = loadFt09SheetJs();

  assert.equal(first, second, 'the loader should reuse one module promise without retaining workbook data');

  const xlsx = await first;
  assert.equal(typeof xlsx.read, 'function');
  assert.equal(typeof xlsx.write, 'function');
  assert.equal(typeof xlsx.utils.book_new, 'function');
  assert.equal(typeof xlsx.utils.aoa_to_sheet, 'function');
});
