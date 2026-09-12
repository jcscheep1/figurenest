import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  FT10_XLSX_PDF_LIMITS,
  ft10ExpectedPageCount,
  readFt10BoundedRows,
  renderFt10RowsToSearchablePdf,
} from './ft10-xlsx-pdf';

function workbookBytes(rows: unknown[][]): Uint8Array {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Research');
  return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer);
}

test('FT-10 direct text rendering creates a reopenable searchable PDF without evaluating formulas', async () => {
  const rows: unknown[][] = [['id', 'label', 'formula-looking']];
  for (let index = 1; index <= 30; index += 1) {
    rows.push([String(index).padStart(3, '0'), `Row ${index}`, index === 2 ? '=2+2' : `value-${index}`]);
  }

  const xlsx = workbookBytes(rows);
  const boundedRows = readFt10BoundedRows(xlsx, XLSX);
  assert.equal(boundedRows.length, 31);
  assert.equal(boundedRows[2][2], '=2+2');
  assert.equal(ft10ExpectedPageCount(boundedRows.length), 2);

  const pdfBytes = renderFt10RowsToSearchablePdf(boundedRows);
  assert.ok(pdfBytes.byteLength > 500);
  assert.ok(pdfBytes.byteLength <= FT10_XLSX_PDF_LIMITS.maxOutputBytes);

  const loadingTask = getDocument({ data: pdfBytes, disableWorker: true });
  const reopened = await loadingTask.promise;
  try {
    assert.equal(reopened.numPages, 2);
    const text: string[] = [];
    for (let pageNumber = 1; pageNumber <= reopened.numPages; pageNumber += 1) {
      const page = await reopened.getPage(pageNumber);
      const content = await page.getTextContent();
      for (const item of content.items) if ('str' in item) text.push(item.str);
    }
    const searchableText = text.join(' ');
    assert.match(searchableText, /Row 2/);
    assert.match(searchableText, /=2\+2/);
    assert.match(searchableText, /Row 30/);
  } finally {
    await loadingTask.destroy();
  }
});

test('FT-10 workbook bounds accept exact column ceiling and reject wider sheets before rendering', () => {
  const atColumnLimit = [Array.from({ length: FT10_XLSX_PDF_LIMITS.maxColumns }, (_, index) => `column-${index + 1}`)];
  assert.equal(readFt10BoundedRows(workbookBytes(atColumnLimit), XLSX)[0].length, FT10_XLSX_PDF_LIMITS.maxColumns);

  const tooWide = [Array.from({ length: FT10_XLSX_PDF_LIMITS.maxColumns + 1 }, (_, index) => `column-${index + 1}`)];
  assert.throws(() => readFt10BoundedRows(workbookBytes(tooWide), XLSX), /column limit exceeded/i);
});

test('FT-10 workbook bounds enforce exact row and populated-range cell ceilings', () => {
  const atRowLimit = Array.from({ length: FT10_XLSX_PDF_LIMITS.maxRows }, (_, index) => [`row-${index + 1}`]);
  assert.equal(readFt10BoundedRows(workbookBytes(atRowLimit), XLSX).length, FT10_XLSX_PDF_LIMITS.maxRows);

  const tooManyRows = Array.from({ length: FT10_XLSX_PDF_LIMITS.maxRows + 1 }, (_, index) => [`row-${index + 1}`]);
  assert.throws(() => readFt10BoundedRows(workbookBytes(tooManyRows), XLSX), /row limit exceeded/i);

  const rowsAtCellLimit = FT10_XLSX_PDF_LIMITS.maxCells / FT10_XLSX_PDF_LIMITS.maxColumns;
  assert.equal(Number.isInteger(rowsAtCellLimit), true);
  const atCellLimit = Array.from({ length: rowsAtCellLimit }, (_, rowIndex) =>
    Array.from({ length: FT10_XLSX_PDF_LIMITS.maxColumns }, (_, columnIndex) => `r${rowIndex + 1}c${columnIndex + 1}`),
  );
  assert.equal(readFt10BoundedRows(workbookBytes(atCellLimit), XLSX).length, rowsAtCellLimit);

  const overCellLimit = Array.from({ length: rowsAtCellLimit + 1 }, (_, rowIndex) =>
    Array.from({ length: FT10_XLSX_PDF_LIMITS.maxColumns }, (_, columnIndex) => `r${rowIndex + 1}c${columnIndex + 1}`),
  );
  assert.throws(() => readFt10BoundedRows(workbookBytes(overCellLimit), XLSX), /cell limit exceeded/i);
});

test('FT-10 renderer rejects malformed XLSX before parsing and fails closed on page ceilings', () => {
  assert.throws(() => readFt10BoundedRows(new TextEncoder().encode('not an xlsx archive'), XLSX), /local safety validation/i);

  const exactPageBoundary = Array.from({ length: FT10_XLSX_PDF_LIMITS.rowsPerPage * FT10_XLSX_PDF_LIMITS.maxPages }, (_, index) => [`row-${index}`]);
  assert.equal(ft10ExpectedPageCount(exactPageBoundary.length), FT10_XLSX_PDF_LIMITS.maxPages);

  const tooManyRows = Array.from({ length: exactPageBoundary.length + 1 }, (_, index) => [`row-${index}`]);
  assert.throws(() => renderFt10RowsToSearchablePdf(tooManyRows), /page limit exceeded/i);
});
