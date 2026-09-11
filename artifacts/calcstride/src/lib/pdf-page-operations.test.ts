import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { FileToolError } from './file-tools-foundation';
import { exportEditedPdf, type PdfEditObject } from './pdf-sign-edit-core';
import {
  PdfPagePlanHistory,
  createPdfPagePlan,
  deletePdfPage,
  movePdfPage,
  normalizeQuarterTurn,
  preparePdfPageOperations,
  rotatePdfPage,
  validatePdfPagePlan,
} from './pdf-page-operations';

async function threePagePdf(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage([300, 400]);
  doc.addPage([500, 200]);
  doc.addPage([250, 600]);
  const bytes = await doc.save();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

test('FT-04 page plan supports rotate, reorder, delete and immutable undo/redo', () => {
  const initial = createPdfPagePlan(3);
  assert.deepEqual(initial.map((item) => item.sourcePageIndex), [0, 1, 2]);

  const rotated = rotatePdfPage(initial, 1, 90);
  assert.equal(rotated[1].rotation, 90);
  assert.equal(initial[1].rotation, 0);

  const moved = movePdfPage(rotated, 2, 0);
  assert.deepEqual(moved.map((item) => item.sourcePageIndex), [2, 0, 1]);

  const deleted = deletePdfPage(moved, 2);
  assert.deepEqual(deleted.map((item) => item.sourcePageIndex), [2, 0]);

  const history = new PdfPagePlanHistory(initial);
  history.commit(rotated);
  history.commit(moved);
  assert.deepEqual(history.undo().map((item) => item.sourcePageIndex), [0, 1, 2]);
  assert.equal(history.value[1].rotation, 90);
  assert.deepEqual(history.redo().map((item) => item.sourcePageIndex), [2, 0, 1]);
});

test('FT-04 prevents deleting every page and rejects invalid page plans or rotations', () => {
  assert.throws(
    () => deletePdfPage(createPdfPagePlan(1), 0),
    (error: unknown) => error instanceof FileToolError && error.code === 'resource-limit',
  );
  assert.throws(
    () => validatePdfPagePlan([{ sourcePageIndex: 0, rotation: 0 }, { sourcePageIndex: 0, rotation: 90 }], 3),
    (error: unknown) => error instanceof FileToolError && error.code === 'malformed',
  );
  assert.throws(
    () => validatePdfPagePlan([{ sourcePageIndex: 4, rotation: 0 }], 3),
    (error: unknown) => error instanceof FileToolError && error.code === 'malformed',
  );
  assert.throws(
    () => normalizeQuarterTurn(45),
    (error: unknown) => error instanceof FileToolError && error.code === 'malformed',
  );
  assert.equal(normalizeQuarterTurn(-90), 270);
  assert.equal(normalizeQuarterTurn(450), 90);
});

test('FT-04 export plan preserves page identity for annotations after reorder, rotation and deletion', async () => {
  const original = await threePagePdf();
  const edits: PdfEditObject[] = [
    { id: 'source-0', pageIndex: 0, kind: 'check', x: 20, y: 20, width: 24, height: 24 },
    { id: 'source-1-deleted', pageIndex: 1, kind: 'check', x: 30, y: 30, width: 24, height: 24 },
    { id: 'source-2', pageIndex: 2, kind: 'highlight', x: 40, y: 80, width: 100, height: 24 },
  ];
  const pagePlan = [
    { sourcePageIndex: 2, rotation: 90 as const },
    { sourcePageIndex: 0, rotation: 180 as const },
  ];

  const prepared = await preparePdfPageOperations(original, edits, pagePlan);
  assert.deepEqual(prepared.edits.map((item) => [item.id, item.pageIndex]), [
    ['source-0', 1],
    ['source-2', 0],
  ]);

  const planned = await PDFDocument.load(prepared.buffer);
  assert.equal(planned.getPageCount(), 2);
  assert.equal(planned.getPage(0).getWidth(), 250);
  assert.equal(planned.getPage(0).getHeight(), 600);
  assert.equal(planned.getPage(0).getRotation().angle, 90);
  assert.equal(planned.getPage(1).getWidth(), 300);
  assert.equal(planned.getPage(1).getHeight(), 400);
  assert.equal(planned.getPage(1).getRotation().angle, 180);

  const output = await exportEditedPdf(prepared.buffer, prepared.edits, []);
  const reopened = await PDFDocument.load(output);
  assert.equal(reopened.getPageCount(), 2);
  assert.equal(reopened.getPage(0).getRotation().angle, 90);
  assert.equal(reopened.getPage(1).getRotation().angle, 180);
});

test('FT-04 editor wires preview, controls and export through stable source-page identity', () => {
  const source = readFileSync(new URL('../pages/PdfSignEditPage.tsx', import.meta.url), 'utf8');
  assert.match(source, /document\.getPage\(planItem\.sourcePageIndex \+ 1\)/);
  assert.match(source, /rotation: previewRotation/);
  assert.match(source, /createPdfEditObject\(kind, currentPlanItem\.sourcePageIndex/);
  assert.match(source, /preparePdfPageOperations\(originalCopy, objectsRef\.current, pagePlanRef\.current\)/);
  assert.match(source, /pageCount <= 1/);
  for (const label of ['Rotate left', 'Rotate right', 'Move earlier', 'Move later', 'Undo page', 'Redo page', 'Delete page']) {
    assert.match(source, new RegExp(label));
  }
});
