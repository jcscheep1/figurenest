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

export const FT10_PAGE_SIZES = ['a4', 'letter'] as const;
export const FT10_ORIENTATIONS = ['portrait', 'landscape'] as const;

export type Ft10PageSize = (typeof FT10_PAGE_SIZES)[number];
export type Ft10Orientation = (typeof FT10_ORIENTATIONS)[number];
export type XlsxModuleApi = typeof XlsxModule;

export interface Ft10WorkbookInspection {
  sheetNames: string[];
  selectedSheet: string;
  usedRange: string | null;
  rows: number;
  columns: number;
  cells: number;
}

export interface Ft10ReadOptions {
  sheetName?: string;
  range?: string;
}

export interface Ft10PdfOptions {
  orientation?: Ft10Orientation;
  pageSize?: Ft10PageSize;
}

function parseBoundedRange(XLSX: XlsxModuleApi, sheetRef: string, requestedRange?: string) {
  const used = XLSX.utils.decode_range(sheetRef);
  if (!requestedRange?.trim()) return used;

  let requested;
  try {
    requested = XLSX.utils.decode_range(requestedRange.trim());
  } catch {
    throw new Error('Enter a valid Excel range such as A1:F40.');
  }

  const clipped = {
    s: { r: Math.max(used.s.r, requested.s.r), c: Math.max(used.s.c, requested.s.c) },
    e: { r: Math.min(used.e.r, requested.e.r), c: Math.min(used.e.c, requested.e.c) },
  };
  if (clipped.e.r < clipped.s.r || clipped.e.c < clipped.s.c) {
    throw new Error('The selected range does not overlap the worksheet data.');
  }
  return clipped;
}

function enforceShapeLimits(range: { s: { r: number; c: number }; e: { r: number; c: number } }): void {
  const rowCount = range.e.r - range.s.r + 1;
  const columnCount = range.e.c - range.s.c + 1;
  const cellCount = rowCount * columnCount;

  if (rowCount > FT10_XLSX_PDF_LIMITS.maxRows) throw new Error('XLSX to PDF row limit exceeded.');
  if (columnCount > FT10_XLSX_PDF_LIMITS.maxColumns) throw new Error('XLSX to PDF column limit exceeded.');
  if (cellCount > FT10_XLSX_PDF_LIMITS.maxCells) throw new Error('XLSX to PDF cell limit exceeded.');
}

function readWorkbook(bytes: Uint8Array, XLSX: XlsxModuleApi) {
  const zip = preflightXlsxZip(bytes);
  if (!zip.ok) throw new Error(`Workbook failed local safety validation: ${zip.reason}`);
  return XLSX.read(bytes, { type: 'array', raw: true, cellFormula: false });
}

export function inspectFt10Workbook(bytes: Uint8Array, XLSX: XlsxModuleApi, sheetName?: string): Ft10WorkbookInspection {
  const workbook = readWorkbook(bytes, XLSX);
  const selectedSheet = sheetName ?? workbook.SheetNames[0];
  if (!selectedSheet || !workbook.SheetNames.includes(selectedSheet)) {
    throw new Error('Workbook has no readable selected worksheet.');
  }

  const ref = workbook.Sheets[selectedSheet]['!ref'];
  if (!ref) return { sheetNames: [...workbook.SheetNames], selectedSheet, usedRange: null, rows: 0, columns: 0, cells: 0 };
  const range = XLSX.utils.decode_range(ref);
  const rows = range.e.r - range.s.r + 1;
  const columns = range.e.c - range.s.c + 1;
  return { sheetNames: [...workbook.SheetNames], selectedSheet, usedRange: ref, rows, columns, cells: rows * columns };
}

export function readFt10BoundedRows(
  bytes: Uint8Array,
  XLSX: XlsxModuleApi,
  sheetOrOptions?: string | Ft10ReadOptions,
): unknown[][] {
  const options: Ft10ReadOptions = typeof sheetOrOptions === 'string' ? { sheetName: sheetOrOptions } : (sheetOrOptions ?? {});
  const workbook = readWorkbook(bytes, XLSX);
  const selectedSheetName = options.sheetName ?? workbook.SheetNames[0];
  if (!selectedSheetName || !workbook.SheetNames.includes(selectedSheetName)) {
    throw new Error('Workbook has no readable selected worksheet.');
  }

  const sheet = workbook.Sheets[selectedSheetName];
  const ref = sheet['!ref'];
  if (!ref) return [];

  const range = parseBoundedRange(XLSX, ref, options.range);
  enforceShapeLimits(range);
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: true,
    defval: '',
    range: XLSX.utils.encode_range(range),
  });
}

export function ft10ExpectedPageCount(rowCount: number): number {
  return Math.max(1, Math.ceil(rowCount / FT10_XLSX_PDF_LIMITS.rowsPerPage));
}

export function renderFt10RowsToSearchablePdf(rows: unknown[][], options: Ft10PdfOptions = {}): Uint8Array {
  const pageCount = ft10ExpectedPageCount(rows.length);
  if (pageCount > FT10_XLSX_PDF_LIMITS.maxPages) throw new Error('XLSX to PDF page limit exceeded.');

  const orientation = options.orientation ?? 'portrait';
  const pageSize = options.pageSize ?? 'a4';
  if (!FT10_ORIENTATIONS.includes(orientation)) throw new Error('Unsupported PDF orientation.');
  if (!FT10_PAGE_SIZES.includes(pageSize)) throw new Error('Unsupported PDF page size.');

  const pdf = new jsPDF({ unit: 'pt', format: pageSize, orientation, compress: true });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const maxWidth = Math.max(100, pageWidth - 72);

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    if (pageIndex > 0) pdf.addPage(pageSize, orientation);
    const start = pageIndex * FT10_XLSX_PDF_LIMITS.rowsPerPage;
    const pageRows = rows.slice(start, start + FT10_XLSX_PDF_LIMITS.rowsPerPage);
    let y = 36;

    for (const row of pageRows) {
      const line = row.map((value) => String(value ?? '')).join(' | ');
      pdf.text(line.slice(0, 240), 36, y, { maxWidth });
      y += 20;
    }
  }

  const bytes = new Uint8Array(pdf.output('arraybuffer'));
  if (bytes.byteLength > FT10_XLSX_PDF_LIMITS.maxOutputBytes) throw new Error('XLSX to PDF output limit exceeded.');
  return bytes;
}
