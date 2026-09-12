import { loadFt09SheetJs } from '@/lib/ft09-sheetjs-loader';
import { quoteCsvCell } from '@/lib/csv-spreadsheet-safety';
import { preflightXlsxZip } from '@/lib/xlsx-zip-preflight';

export const FT09_LIMITS = {
  maxSheets: 20,
  maxRowsPerSheet: 100_000,
  maxColumnsPerSheet: 1_000,
  maxCellsPerSheet: 250_000,
} as const;

export type CsvDelimiter = ',' | ';' | '\t' | '|';

export type Ft09WorkbookSummary = {
  sheetNames: string[];
  selectedSheet: string;
  rows: number;
  columns: number;
  cells: number;
};

function countWorksheetShape(ref: string | undefined, decodeRange: (ref: string) => { s: { r: number; c: number }; e: { r: number; c: number } }) {
  if (!ref) return { rows: 0, columns: 0, cells: 0 };
  const range = decodeRange(ref);
  const rows = range.e.r - range.s.r + 1;
  const columns = range.e.c - range.s.c + 1;
  const cells = rows * columns;
  return { rows, columns, cells };
}

function assertWorkbookBounds(
  sheetNames: string[],
  selectedSheet: string,
  ref: string | undefined,
  decodeRange: (ref: string) => { s: { r: number; c: number }; e: { r: number; c: number } },
): Ft09WorkbookSummary {
  if (!sheetNames.length) throw new Error('The workbook does not contain a readable worksheet.');
  if (sheetNames.length > FT09_LIMITS.maxSheets) throw new Error(`Workbooks are limited to ${FT09_LIMITS.maxSheets} sheets.`);
  if (!sheetNames.includes(selectedSheet)) throw new Error('The selected worksheet is not available.');
  const shape = countWorksheetShape(ref, decodeRange);
  if (shape.rows > FT09_LIMITS.maxRowsPerSheet) throw new Error(`Worksheets are limited to ${FT09_LIMITS.maxRowsPerSheet.toLocaleString()} rows.`);
  if (shape.columns > FT09_LIMITS.maxColumnsPerSheet) throw new Error(`Worksheets are limited to ${FT09_LIMITS.maxColumnsPerSheet.toLocaleString()} columns.`);
  if (shape.cells > FT09_LIMITS.maxCellsPerSheet) throw new Error(`Worksheets are limited to ${FT09_LIMITS.maxCellsPerSheet.toLocaleString()} populated-range cells.`);
  return { sheetNames, selectedSheet, ...shape };
}

export async function convertCsvToXlsx(csvText: string, options?: { delimiter?: CsvDelimiter; sheetName?: string }) {
  const XLSX = await loadFt09SheetJs();
  const delimiter = options?.delimiter ?? ',';
  const sheetName = (options?.sheetName?.trim() || 'Sheet1').slice(0, 31);
  if (!csvText.trim()) throw new Error('Choose a CSV file that contains tabular data.');

  // SheetJS parses locally and does not evaluate formula-looking CSV text when raw=true.
  const workbook = XLSX.read(csvText, { type: 'string', raw: true, FS: delimiter, cellFormula: false });
  const sourceName = workbook.SheetNames[0];
  if (!sourceName) throw new Error('The CSV did not produce a readable worksheet.');
  const worksheet = workbook.Sheets[sourceName];
  const summary = assertWorkbookBounds(workbook.SheetNames, sourceName, worksheet['!ref'], XLSX.utils.decode_range);

  // Rebuild from raw values so formula-looking input cannot become formula cells in the XLSX output.
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true, defval: '' });
  const safeWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(safeWorkbook, XLSX.utils.aoa_to_sheet(rows), sheetName);
  const bytes = XLSX.write(safeWorkbook, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer;
  const zip = preflightXlsxZip(new Uint8Array(bytes));
  if (!zip.ok) throw new Error(`Generated workbook failed local safety validation: ${zip.reason}`);

  return { bytes, summary: { ...summary, sheetNames: [sheetName], selectedSheet: sheetName } };
}

export async function inspectXlsx(bytes: Uint8Array): Promise<{ sheetNames: string[] }> {
  const zip = preflightXlsxZip(bytes);
  if (!zip.ok) throw new Error(`Workbook failed local safety validation: ${zip.reason}`);
  const XLSX = await loadFt09SheetJs();
  const workbook = XLSX.read(bytes, { type: 'array', raw: true, cellFormula: false });
  if (!workbook.SheetNames.length) throw new Error('The workbook does not contain a readable worksheet.');
  if (workbook.SheetNames.length > FT09_LIMITS.maxSheets) throw new Error(`Workbooks are limited to ${FT09_LIMITS.maxSheets} sheets.`);
  return { sheetNames: [...workbook.SheetNames] };
}

export async function convertXlsxToCsv(bytes: Uint8Array, selectedSheet?: string) {
  const zip = preflightXlsxZip(bytes);
  if (!zip.ok) throw new Error(`Workbook failed local safety validation: ${zip.reason}`);

  const XLSX = await loadFt09SheetJs();
  // SheetJS reads cached cell values only here; it does not provide or invoke a formula-calculation engine.
  const workbook = XLSX.read(bytes, { type: 'array', raw: true, cellFormula: false });
  const sheetName = selectedSheet && workbook.SheetNames.includes(selectedSheet) ? selectedSheet : workbook.SheetNames[0];
  if (!sheetName) throw new Error('The workbook does not contain a readable worksheet.');
  const worksheet = workbook.Sheets[sheetName];
  const summary = assertWorkbookBounds(workbook.SheetNames, sheetName, worksheet['!ref'], XLSX.utils.decode_range);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, raw: true, defval: '' });

  // Neutralize spreadsheet formula-injection prefixes on every CSV field while preserving genuine negative numbers.
  const csv = rows.map((row) => row.map((value) => quoteCsvCell(value)).join(',')).join('\r\n');
  return { csv, summary };
}
