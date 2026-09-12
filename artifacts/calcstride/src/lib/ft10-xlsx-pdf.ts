import type * as XlsxModule from 'xlsx';
import { jsPDF } from 'jspdf';
import { preflightXlsxZip } from './xlsx-zip-preflight';

export const FT10_XLSX_PDF_LIMITS = {
  maxRows: 500,
  maxColumns: 25,
  maxCells: 5_000,
  maxPages: 40,
  maxOutputBytes: 2 * 1024 * 1024,
  rowsPerPage: 24,
} as const;

export type XlsxModuleApi = typeof XlsxModule;

export function readFt10BoundedRows(bytes: Uint8Array, XLSX: XlsxModuleApi, sheetName?: string): unknown[][] {
  const zip = preflightXlsxZip(bytes);
  if (!zip.ok) throw new Error(`Workbook failed local safety validation: ${zip.reason}`);

  const workbook = XLSX.read(bytes, { type: 'array', raw: true, cellFormula: false });
  const selectedSheetName = sheetName ?? workbook.SheetNames[0];
  if (!selectedSheetName || !workbook.SheetNames.includes(selectedSheetName)) {
    throw new Error('Workbook has no readable selected worksheet.');
  }

  const sheet = workbook.Sheets[selectedSheetName];
  const ref = sheet['!ref'];
  if (!ref) return [];

  const range = XLSX.utils.decode_range(ref);
  const rowCount = range.e.r - range.s.r + 1;
  const columnCount = range.e.c - range.s.c + 1;
  const cellCount = rowCount * columnCount;

  if (rowCount > FT10_XLSX_PDF_LIMITS.maxRows) throw new Error('XLSX to PDF row limit exceeded.');
  if (columnCount > FT10_XLSX_PDF_LIMITS.maxColumns) throw new Error('XLSX to PDF column limit exceeded.');
  if (cellCount > FT10_XLSX_PDF_LIMITS.maxCells) throw new Error('XLSX to PDF cell limit exceeded.');

  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' });
}

export function ft10ExpectedPageCount(rowCount: number): number {
  return Math.max(1, Math.ceil(rowCount / FT10_XLSX_PDF_LIMITS.rowsPerPage));
}

export function renderFt10RowsToSearchablePdf(rows: unknown[][]): Uint8Array {
  const pageCount = ft10ExpectedPageCount(rows.length);
  if (pageCount > FT10_XLSX_PDF_LIMITS.maxPages) throw new Error('XLSX to PDF page limit exceeded.');

  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait', compress: true });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) pdf.addPage();
    const start = pageIndex * FT10_XLSX_PDF_LIMITS.rowsPerPage;
    const pageRows = rows.slice(start, start + FT10_XLSX_PDF_LIMITS.rowsPerPage);
    let y = 36;

    for (const row of pageRows) {
      const line = row.map((value) => String(value ?? '')).join(' | ');
      pdf.text(line.slice(0, 180), 36, y);
      y += 20;
    }
  }

  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  if (bytes.byteLength > FT10_XLSX_PDF_LIMITS.maxOutputBytes) throw new Error('XLSX to PDF output limit exceeded.');
  return bytes;
}
