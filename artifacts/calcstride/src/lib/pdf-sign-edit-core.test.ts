import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { FileToolError } from './file-tools-foundation';
import {
  PDF_FILE_RULE,
  PdfEditHistory,
  applyViewportTransform,
  clampEditObjectToPage,
  createPdfEditObject,
  exportEditedPdf,
  invertViewportTransform,
  pdfRectToViewportBox,
  validatePdfPageCount,
  validateSignatureImageDimensions,
  viewportDeltaToPdfDelta,
  viewportPointToPdf,
  type PdfEditObject,
} from './pdf-sign-edit-core';

async function onePagePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage([300, 400]);
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

test('FT-02 PDF rule requires a real PDF signature', () => {
  assert.deepEqual(PDF_FILE_RULE.extensions, ['pdf']);
  assert.deepEqual(PDF_FILE_RULE.mimeTypes, ['application/pdf']);
  assert.deepEqual(PDF_FILE_RULE.magicBytes?.[0]?.bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
});

test('FT-02 coordinate transforms remain stable across zoom and PDF.js-style Y inversion', () => {
  const transform = [2, 0, 0, -2, 0, 800] as const;
  const pdfPoint = { x: 40, y: 60 };
  const viewport = applyViewportTransform(transform, pdfPoint);
  assert.deepEqual(viewport, { x: 80, y: 680 });
  const inverse = invertViewportTransform(transform);
  assert.deepEqual(applyViewportTransform(inverse, viewport), pdfPoint);
  assert.deepEqual(viewportPointToPdf(transform, viewport), pdfPoint);
  assert.deepEqual(viewportDeltaToPdfDelta(transform, { x: 20, y: -10 }), { x: 10, y: 5 });

  const box = pdfRectToViewportBox(transform, { x: 40, y: 60, width: 100, height: 30 });
  assert.deepEqual(box, { left: 80, top: 620, width: 200, height: 60 });
});

test('FT-02 edit objects clamp to page bounds and use useful defaults', () => {
  const bounds = { width: 300, height: 400 };
  const text = createPdfEditObject('text', 0, bounds, 'text-1', { value: 'Approved' });
  assert.equal(text.width, 180);
  assert.equal(text.height, 32);
  assert.equal(text.fontSize, 16);
  assert.equal(text.x, 60);
  assert.equal(text.y, 184);

  const escaped = clampEditObjectToPage({ ...text, x: -50, y: 390, width: 500 }, bounds);
  assert.equal(escaped.x, 0);
  assert.equal(escaped.y, 368);
  assert.equal(escaped.width, 300);
});

test('FT-02 history supports immutable commit, undo, redo and redo invalidation', () => {
  const history = new PdfEditHistory();
  const first: PdfEditObject = {
    id: 'a', pageIndex: 0, kind: 'check', x: 1, y: 2, width: 20, height: 20,
  };
  history.commit([first]);
  assert.equal(history.canUndo, true);
  const exposed = history.value;
  exposed[0].x = 999;
  assert.equal(history.value[0].x, 1);

  assert.deepEqual(history.undo(), []);
  assert.equal(history.canRedo, true);
  assert.equal(history.redo()[0].id, 'a');
  history.undo();
  history.commit([{ ...first, id: 'b' }]);
  assert.equal(history.canRedo, false);
  assert.equal(history.value[0].id, 'b');
});

test('FT-02 resource guards enforce PDF page and signature image limits', () => {
  assert.doesNotThrow(() => validatePdfPageCount(100));
  assert.throws(
    () => validatePdfPageCount(101),
    (error: unknown) => error instanceof FileToolError && error.code === 'resource-limit',
  );
  assert.doesNotThrow(() => validateSignatureImageDimensions(4000, 4000));
  assert.throws(
    () => validateSignatureImageDimensions(8000, 6000),
    (error: unknown) => error instanceof FileToolError && error.code === 'resource-limit',
  );
});

test('FT-02 exports typed text, date, check and drawn signature into a reopenable PDF', async () => {
  const original = await onePagePdf();
  const edits: PdfEditObject[] = [
    { id: 'text', pageIndex: 0, kind: 'text', x: 20, y: 320, width: 160, height: 30, value: 'Approved locally', fontSize: 14 },
    { id: 'date', pageIndex: 0, kind: 'date', x: 20, y: 280, width: 100, height: 28, value: '2026-09-10', fontSize: 12 },
    { id: 'check', pageIndex: 0, kind: 'check', x: 20, y: 240, width: 24, height: 24 },
    {
      id: 'drawn', pageIndex: 0, kind: 'signature-draw', x: 20, y: 140, width: 150, height: 60,
      strokes: [[{ x: 0.05, y: 0.7 }, { x: 0.3, y: 0.2 }, { x: 0.55, y: 0.65 }, { x: 0.9, y: 0.25 }]],
    },
  ];
  const output = await exportEditedPdf(original, edits, []);
  assert.ok(output.byteLength > original.byteLength);
  const reopened = await PDFDocument.load(output);
  assert.equal(reopened.getPageCount(), 1);
  assert.equal(reopened.getPage(0).getWidth(), 300);
  assert.equal(reopened.getPage(0).getHeight(), 400);
});

test('FT-02 rejects malformed edits instead of exporting ambiguous output', async () => {
  const original = await onePagePdf();
  await assert.rejects(
    exportEditedPdf(original, [{ id: 'bad', pageIndex: 2, kind: 'check', x: 0, y: 0, width: 20, height: 20 }], []),
    (error: unknown) => error instanceof FileToolError && error.code === 'malformed',
  );
  await assert.rejects(
    exportEditedPdf(original, [{ id: 'blank', pageIndex: 0, kind: 'text', x: 0, y: 0, width: 40, height: 20, value: '   ' }], []),
    (error: unknown) => error instanceof FileToolError && error.code === 'malformed',
  );
  await assert.rejects(
    exportEditedPdf(original, [{ id: 'stroke', pageIndex: 0, kind: 'signature-draw', x: 0, y: 0, width: 40, height: 20, strokes: [[{ x: 2, y: 0 }, { x: 0, y: 0 }]] }], []),
    (error: unknown) => error instanceof FileToolError && error.code === 'malformed',
  );
});

test('FT-02 core contains no upload, persistence, analytics or runtime CDN calls', () => {
  const source = readFileSync(new URL('./pdf-sign-edit-core.ts', import.meta.url), 'utf8');
  for (const forbidden of [
    'fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'localStorage', 'sessionStorage',
    'indexedDB', 'caches.', 'console.', 'https://', 'http://',
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.match(source, /await import\('pdf-lib'\)/);
});


test('FT-02 cancellation destroys the active PDF.js task and releases retained bytes', () => {
  const source = readFileSync(new URL('../pages/PdfSignEditPage.tsx', import.meta.url), 'utf8');
  assert.match(source, /pdfLoadingTaskRef = useRef<PdfJsLoadingTask \| null>\(null\)/);
  assert.match(source, /await loadingTask\.destroy\(\)\.catch/);
  assert.match(source, /controller\?\.abort\(\);[\s\S]*void destroyLoadingTask\(\);[\s\S]*clearOriginalBuffer\(\);/);
  assert.match(source, /if \(controller\.signal\.aborted\) \{\s*clearArrayBuffer\(buffer\);\s*return;/);
  assert.match(source, /if \(pdfLoadingTaskRef\.current === loadingTask\) pdfLoadingTaskRef\.current = null;/);
  assert.match(source, /if \(loadAbortRef\.current === controller\) \{\s*setStatus/);
});
