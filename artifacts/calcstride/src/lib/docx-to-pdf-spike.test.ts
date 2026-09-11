import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePdfPageSlices, isAllowedDocxPreviewResourceUrl } from './docx-to-pdf-spike';

test('allows only embedded raster image data URLs for generated DOCX preview resources', () => {
  assert.equal(isAllowedDocxPreviewResourceUrl('data:image/png;base64,AAAA'), true);
  assert.equal(isAllowedDocxPreviewResourceUrl('data:image/jpeg;base64,AAAA'), true);
  assert.equal(isAllowedDocxPreviewResourceUrl('data:image/webp;base64,AAAA'), true);
  assert.equal(isAllowedDocxPreviewResourceUrl('https://example.com/pixel.png'), false);
  assert.equal(isAllowedDocxPreviewResourceUrl('//example.com/pixel.png'), false);
  assert.equal(isAllowedDocxPreviewResourceUrl('blob:https://example.com/123'), false);
  assert.equal(isAllowedDocxPreviewResourceUrl('data:text/html;base64,AAAA'), false);
  assert.equal(isAllowedDocxPreviewResourceUrl('javascript:alert(1)'), false);
  assert.equal(isAllowedDocxPreviewResourceUrl(''), false);
});

test('calculates stable PDF page offsets without dropping a trailing partial page', () => {
  assert.deepEqual(calculatePdfPageSlices(500, 800), [{ pageIndex: 0, offsetY: 0 }]);
  assert.deepEqual(calculatePdfPageSlices(1600, 800), [
    { pageIndex: 0, offsetY: 0 },
    { pageIndex: 1, offsetY: 800 },
  ]);
  assert.deepEqual(calculatePdfPageSlices(1600.1, 800), [
    { pageIndex: 0, offsetY: 0 },
    { pageIndex: 1, offsetY: 800 },
    { pageIndex: 2, offsetY: 1600 },
  ]);
});

test('rejects invalid PDF pagination dimensions before export', () => {
  for (const [imageHeight, pageHeight] of [[0, 800], [-1, 800], [800, 0], [800, Number.POSITIVE_INFINITY]]) {
    assert.throws(() => calculatePdfPageSlices(imageHeight, pageHeight), /positive finite dimensions/);
  }
});
