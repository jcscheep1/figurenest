import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedDocxPreviewResourceUrl } from './docx-to-pdf-spike';

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
