import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { preflightXlsxZip } from './xlsx-zip-preflight';

const FT10_RESEARCH_LIMITS = {
  maxRows: 500,
  maxColumns: 25,
  maxCells: 5_000,
  maxPages: 40,
  maxOutputBytes: 2 * 1024 * 1024,
  rowsPerPage: 24,
} as const;

function workbookBytes(rows: unknown[][]): Uint8Array {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), 'Research');
  return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer);
}

function readBoundedRows(bytes: Uint8Array): unknown[][] {
  const zip = preflightXlsxZip(bytes);
  if (!zip.ok) throw new Error(`Workbook failed local safety validation: ${zip.reason}`);

  const workbook = XLSX.read(bytes, { type: 'array', raw: true, cellFormula: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('Workbook has no readable worksheet.');
  const sheet = workbook.Sheets[sheetName];
  const ref = sheet['!ref'];
  if (!ref) return [];

  const range = XLSX.utils.decode_range(ref);
  const rowCount = range.e.r - range.s.r + 1;
  const columnCount = range.e.c - range.s.c + 1;
  const cellCount = rowCount * columnCount;
  if (rowCount > FT10_RESEARCH_LIMITS.maxRows) throw new Error('FT-10 research row limit exceeded.');
  if (columnCount > FT10_RESEARCH_LIMITS.maxColumns) throw new Error('FT-10 research column limit exceeded.');
  if (cellCount > FT10_RESEARCH_LIMITS.maxCells) throw new Error('FT-10 research cell limit exceeded.');

  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' });
}

function expectedPageCount(rowCount: number): number {
  return Math.max(1, Math.ceil(rowCount / FT10_RESEARCH_LIMITS.rowsPerPage));
}

function renderRowsToSearchablePdf(rows: unknown[][]): Uint8Array {
  const pageCount = expectedPageCount(rows.length);
  if (pageCount > FT10_RESEARCH_LIMITS.maxPages) throw new Error('FT-10 research page limit exceeded.');

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) pdf.addPage();
    const start = pageIndex * FT10_RESEARCH_LIMITS.rowsPerPage;
    const pageRows = rows.slice(start, start + FT10_RESEARCH_LIMITS.rowsPerPage);
    let y = 36;
    for (const row of pageRows) {
      const line = row.map((value) => String(value ?? '')).join(' | ');
      pdf.text(line.slice(0, 180), 36, y);
      y += 20;
    }
  }

  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  if (bytes.byteLength > FT10_RESEARCH_LIMITS.maxOutputBytes) throw new Error('FT-10 research PDF output limit exceeded.');
  return bytes;
}

test('FT-10 direct text rendering creates a reopenable searchable PDF without evaluating formulas', async () => {
  const rows: unknown[][] = [['id', 'label', 'formula-looking']];
  for (let index = 1; index <= 30; index += 1) {
    rows.push([String(index).padStart(3, '0'), `Row ${index}`, index === 2 ? '=2+2' : `value-${index}`]);
  }

  const xlsx = workbookBytes(rows);
  const boundedRows = readBoundedRows(xlsx);
  assert.equal(boundedRows.length, 31);
  assert.equal(boundedRows[2][2], '=2+2');
  assert.equal(expectedPageCount(boundedRows.length), 2);

  const pdfBytes = renderRowsToSearchablePdf(boundedRows);
  assert.ok(pdfBytes.byteLength > 500);
  assert.ok(pdfBytes.byteLength <= FT10_RESEARCH_LIMITS.maxOutputBytes);

  const loadingTask = getDocument({ data: pdfBytes, disableWorker: true });
  const reopened = await loadingTask.promise;
  try {
    assert.equal(reopened.numPages, 2);
    const text: string[] = [];
    for (let pageNumber = 1; pageNumber <= reopened.numPages; pageNumber += 1) {
      const page = await reopened.getPage(pageNumber);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if ('str' in item) text.push(item.str);
      }
    }
    const searchableText = text.join(' ');
    assert.match(searchableText, /Row 2/);
    assert.match(searchableText, /=2\+2/);
    assert.match(searchableText, /Row 30/);
  } finally {
    await loadingTask.destroy();
  }
});

test('FT-10 workbook bounds accept the exact column ceiling and reject wider sheets before rendering', () => {
  const atColumnLimit = [Array.from({ length: FT10_RESEARCH_LIMITS.maxColumns }, (_, index) => `column-${index + 1}`)];
  assert.equal(readBoundedRows(workbookBytes(atColumnLimit))[0].length, FT10_RESEARCH_LIMITS.maxColumns);

  const tooWide = [Array.from({ length: FT10_RESEARCH_LIMITS.maxColumns + 1 }, (_, index) => `column-${index + 1}`)];
  assert.throws(() => readBoundedRows(workbookBytes(tooWide)), /column limit exceeded/);
});

test('FT-10 research renderer rejects malformed XLSX before parsing and fails closed on page ceilings', () => {
  assert.throws(() => readBoundedRows(new TextEncoder().encode('not an xlsx archive')), /local safety validation/);

  const exactPageBoundary = Array.from({ length: FT10_RESEARCH_LIMITS.rowsPerPage * FT10_RESEARCH_LIMITS.maxPages }, (_, index) => [`row-${index}`]);
  assert.equal(expectedPageCount(exactPageBoundary.length), FT10_RESEARCH_LIMITS.maxPages);

  const tooManyRows = Array.from({ length: exactPageBoundary.length + 1 }, (_, index) => [`row-${index}`]);
  assert.throws(() => renderRowsToSearchablePdf(tooManyRows), /page limit exceeded/);
});
