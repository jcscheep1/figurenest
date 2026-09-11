import test from 'node:test';
import assert from 'node:assert/strict';
import * as mammoth from 'mammoth';
import {
  calculatePdfPageSlices,
  isAllowedDocxPreviewLinkUrl,
  isAllowedDocxPreviewResourceUrl,
} from './docx-to-pdf-spike';
import { DOCX_PUBLICATION_FIXTURES } from './docx-publication-fixtures';
import { inspectDocxPackage } from './docx-package-preflight';

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

test('allows only explicitly approved preview hyperlink protocols', () => {
  assert.equal(isAllowedDocxPreviewLinkUrl('https://example.com'), true);
  assert.equal(isAllowedDocxPreviewLinkUrl('http://example.com'), true);
  assert.equal(isAllowedDocxPreviewLinkUrl('mailto:test@example.com'), true);
  assert.equal(isAllowedDocxPreviewLinkUrl('tel:+352123456'), true);
  assert.equal(isAllowedDocxPreviewLinkUrl('#section-1'), true);
  assert.equal(isAllowedDocxPreviewLinkUrl(' javascript:alert(1)'), false);
  assert.equal(isAllowedDocxPreviewLinkUrl('//example.com'), false);
  assert.equal(isAllowedDocxPreviewLinkUrl('data:text/html;base64,AAAA'), false);
  assert.equal(isAllowedDocxPreviewLinkUrl('blob:https://example.com/id'), false);
  assert.equal(isAllowedDocxPreviewLinkUrl(''), false);
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

test('publication fixtures 1–6 and 8 produce the required semantic HTML with external access disabled', async () => {
  assert.deepEqual(DOCX_PUBLICATION_FIXTURES.map((fixture) => fixture.id), ['1', '2', '3', '4', '5', '6', '8']);

  for (const fixture of DOCX_PUBLICATION_FIXTURES) {
    await inspectDocxPackage(fixture.bytes, 'desktop');
    const result = await mammoth.convertToHtml(
      { buffer: Buffer.from(fixture.bytes) },
      {
        externalFileAccess: false,
        styleMap: ['u => u'],
      },
    );

    for (const expected of fixture.expectedText) {
      assert.match(result.value, new RegExp(expected), `${fixture.id}: ${fixture.name} must preserve ${expected}`);
    }
    for (const expected of fixture.expectedHtml) {
      assert.match(result.value, expected, `${fixture.id}: ${fixture.name} must preserve ${expected}`);
    }
  }
});
