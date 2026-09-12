import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  FT10_XLSX_PDF_LIMITS,
  ft10ExpectedPageCount,
  inspectFt10Workbook,
  readFt10BoundedRows,
  renderFt10RowsToSearchablePdf,
} from './ft10-xlsx-pdf';

function workbookBytes(rows: unknown[][], secondSheet = false): Uint8Array {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Printable');
  if (secondSheet) XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['second']]), 'Other');
  return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer);
}

test('FT-10 bounded engine preserves inert formula-looking text and selected-sheet semantics', () => {
  const bytes = workbookBytes([['id', 'value'], ['00123', '=2+2']], true);
  const inspection = inspectFt10Workbook(bytes, XLSX, 'Printable');
  assert.deepEqual(inspection.sheetNames, ['Printable', 'Other']);
  assert.equal(inspection.usedRange, 'A1:B2');
  assert.equal(inspection.rows, 2);
  assert.equal(inspection.columns, 2);

  const rows = readFt10BoundedRows(bytes, XLSX, 'Printable');
  assert.deepEqual(rows, [['id', 'value'], ['00123', '=2+2']]);
  assert.throws(() => readFt10BoundedRows(bytes, XLSX, 'Missing'), /no readable selected worksheet/i);
});

test('FT-10 selected range is clipped to real worksheet data and bounded independently', () => {
  const bytes = workbookBytes([
    ['id', 'name', 'amount'],
    ['001', 'Alpha', 10],
    ['002', 'Beta', 20],
    ['003', 'Gamma', 30],
  ]);

  assert.deepEqual(readFt10BoundedRows(bytes, XLSX, { sheetName: 'Printable', range: 'B2:C3' }), [
    ['Alpha', 10],
    ['Beta', 20],
  ]);
  assert.deepEqual(readFt10BoundedRows(bytes, XLSX, { range: 'A1:Z99' }), [
    ['id', 'name', 'amount'],
    ['001', 'Alpha', 10],
    ['002', 'Beta', 20],
    ['003', 'Gamma', 30],
  ]);
  assert.throws(() => readFt10BoundedRows(bytes, XLSX, { range: 'Z99:Z100' }), /does not overlap/i);
});

test('FT-10 bounded engine enforces final conservative print ceilings', () => {
  const atLimit = Array.from({ length: FT10_XLSX_PDF_LIMITS.maxRows }, (_, index) => [`row-${index + 1}`]);
  assert.equal(readFt10BoundedRows(workbookBytes(atLimit), XLSX).length, FT10_XLSX_PDF_LIMITS.maxRows);

  const tooWide = [Array.from({ length: FT10_XLSX_PDF_LIMITS.maxColumns + 1 }, (_, index) => `c${index + 1}`)];
  assert.throws(() => readFt10BoundedRows(workbookBytes(tooWide), XLSX), /column limit exceeded/i);

  const rowsAtCellLimit = FT10_XLSX_PDF_LIMITS.maxCells / FT10_XLSX_PDF_LIMITS.maxColumns;
  const tooManyCells = Array.from({ length: rowsAtCellLimit + 1 }, (_, rowIndex) =>
    Array.from({ length: FT10_XLSX_PDF_LIMITS.maxColumns }, (_, columnIndex) => `r${rowIndex + 1}c${columnIndex + 1}`),
  );
  assert.throws(() => readFt10BoundedRows(workbookBytes(tooManyCells), XLSX), /cell limit exceeded/i);
});

test('FT-10 bounded engine emits reopenable searchable PDFs for both supported layout choices', async () => {
  const rows = Array.from({ length: 30 }, (_, index) => [`Row ${index + 1}`, index === 1 ? '=2+2' : `value-${index + 1}`]);
  assert.equal(ft10ExpectedPageCount(rows.length), 2);

  for (const options of [
    { orientation: 'portrait' as const, pageSize: 'a4' as const },
    { orientation: 'landscape' as const, pageSize: 'letter' as const },
  ]) {
    const bytes = renderFt10RowsToSearchablePdf(rows, options);
    assert.ok(bytes.byteLength > 500);
    assert.ok(bytes.byteLength <= FT10_XLSX_PDF_LIMITS.maxOutputBytes);

    const loadingTask = getDocument({ data: bytes, disableWorker: true });
    const document = await loadingTask.promise;
    try {
      assert.equal(document.numPages, 2);
      const text: string[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        for (const item of content.items) if ('str' in item) text.push(item.str);
      }
      const searchable = text.join(' ');
      assert.match(searchable, /Row 2/);
      assert.match(searchable, /=2\+2/);
      assert.match(searchable, /Row 30/);
    } finally {
      await loadingTask.destroy();
    }
  }

  const overPageLimit = Array.from({ length: FT10_XLSX_PDF_LIMITS.rowsPerPage * FT10_XLSX_PDF_LIMITS.maxPages + 1 }, (_, index) => [`row-${index}`]);
  assert.throws(() => renderFt10RowsToSearchablePdf(overPageLimit), /page limit exceeded/i);
});
