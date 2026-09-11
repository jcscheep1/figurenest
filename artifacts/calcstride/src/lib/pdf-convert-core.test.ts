import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assembleExtractedPdfText,
  createStoredZip,
  parsePdfPageSelection,
  safePdfBaseName,
  textItemsToPlainText,
} from './pdf-convert-core';

test('parsePdfPageSelection handles all, ranges, duplicates and ordering', () => {
  assert.deepEqual(parsePdfPageSelection('all', 4), [1, 2, 3, 4]);
  assert.deepEqual(parsePdfPageSelection('3,1-2,2', 4), [1, 2, 3]);
  assert.throws(() => parsePdfPageSelection('0,2', 4), /between 1 and 4/);
  assert.throws(() => parsePdfPageSelection('4-2', 4), /between 1 and 4/);
  assert.throws(() => parsePdfPageSelection('hello', 4), /page numbers/);
});

test('safePdfBaseName removes the extension and unsafe filename characters', () => {
  assert.equal(safePdfBaseName('Quarterly report (final).PDF'), 'Quarterly-report-final');
  assert.equal(safePdfBaseName('...pdf'), '..');
});

test('textItemsToPlainText preserves explicit PDF text line endings', () => {
  assert.equal(textItemsToPlainText([
    { str: 'Hello' },
    { str: 'world', hasEOL: true },
    { str: 'Next' },
    { str: 'line' },
  ]), 'Hello world\nNext line');
});

test('assembleExtractedPdfText keeps deterministic page separators and empty-page markers', () => {
  assert.equal(assembleExtractedPdfText([
    { pageNumber: 1, text: 'Alpha' },
    { pageNumber: 3, text: '' },
  ]), '--- Page 1 ---\nAlpha\n\n--- Page 3 ---\n[No extractable text on this page]');
});

test('createStoredZip emits a valid ZIP envelope with both filenames', () => {
  const zip = createStoredZip([
    { name: 'page-1.png', data: new Uint8Array([1, 2, 3]) },
    { name: 'page-2.png', data: new Uint8Array([4, 5]) },
  ]);
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  assert.equal(view.getUint32(0, true), 0x04034b50);
  assert.equal(view.getUint32(zip.length - 22, true), 0x06054b50);
  const text = new TextDecoder().decode(zip);
  assert.match(text, /page-1\.png/);
  assert.match(text, /page-2\.png/);
});
