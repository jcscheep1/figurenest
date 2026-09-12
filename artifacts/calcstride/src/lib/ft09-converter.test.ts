import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { convertCsvToXlsx, convertXlsxToCsv, FT09_LIMITS, inspectXlsx } from './ft09-converter';

function workbookBytes(rows: unknown[][], sheetName = 'Data'): Uint8Array {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheetName);
  return new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer);
}

test('production CSV to XLSX conversion preserves text and keeps formula-looking input inert', async () => {
  const csv = [
    'id,name,note,payload,negative',
    '00123,Zoë,"hello, world",=2+2,-1',
    '00456,李,"line one\nline two",+SUM(A1:A2),-0.25',
  ].join('\r\n');

  const result = await convertCsvToXlsx(csv, { sheetName: 'Imported' });
  assert.deepEqual(result.summary, {
    sheetNames: ['Imported'],
    selectedSheet: 'Imported',
    rows: 3,
    columns: 5,
    cells: 15,
  });

  const reopened = XLSX.read(new Uint8Array(result.bytes), { type: 'array', raw: true, cellFormula: true });
  assert.deepEqual(reopened.SheetNames, ['Imported']);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(reopened.Sheets.Imported, { header: 1, raw: true, defval: '' });
  assert.deepEqual(rows, [
    ['id', 'name', 'note', 'payload', 'negative'],
    ['00123', 'Zoë', 'hello, world', '=2+2', '-1'],
    ['00456', '李', 'line one\nline two', '+SUM(A1:A2)', '-0.25'],
  ]);
  assert.equal(reopened.Sheets.Imported.D2.f, undefined);
  assert.equal(reopened.Sheets.Imported.D3.f, undefined);
});

test('production XLSX to CSV conversion neutralizes spreadsheet injection and preserves genuine negatives', async () => {
  const bytes = workbookBytes([
    ['payload', 'negative', 'quoted'],
    ['=2+2', -1, 'hello, world'],
    ['+SUM(A1:A2)', -0.25, 'line one\nline two'],
    ['@cmd', -1e6, 'plain'],
    ['-HYPERLINK("https://example.invalid")', -0.5, 'plain'],
  ]);

  const inspected = await inspectXlsx(bytes);
  assert.deepEqual(inspected.sheetNames, ['Data']);

  const result = await convertXlsxToCsv(bytes, 'Data');
  assert.equal(result.summary.selectedSheet, 'Data');
  assert.match(result.csv, /'=2\+2,-1,"hello, world"/);
  assert.match(result.csv, /'\+SUM\(A1:A2\),-0\.25,"line one\nline two"/);
  assert.match(result.csv, /'@cmd,-1000000,plain/);
  assert.match(result.csv, /"'-HYPERLINK\(""https:\/\/example\.invalid""\)",-0\.5,plain/);
});

test('production converter rejects workbook shapes beyond the populated-range limit', async () => {
  const worksheet: XLSX.WorkSheet = { '!ref': `A1:${XLSX.utils.encode_col(FT09_LIMITS.maxColumnsPerSheet)}1` };
  worksheet.A1 = { t: 's', v: 'start' };
  worksheet[XLSX.utils.encode_cell({ r: 0, c: FT09_LIMITS.maxColumnsPerSheet })] = { t: 's', v: 'end' };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Wide');
  const bytes = new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx', compression: true }) as ArrayBuffer);

  await assert.rejects(() => convertXlsxToCsv(bytes), /limited to 1,000 columns/);
});

test('production converter rejects malformed non-XLSX input before SheetJS parsing', async () => {
  const malformed = new TextEncoder().encode('not an xlsx archive');
  await assert.rejects(() => inspectXlsx(malformed), /Workbook failed local safety validation/);
  await assert.rejects(() => convertXlsxToCsv(malformed), /Workbook failed local safety validation/);
});
