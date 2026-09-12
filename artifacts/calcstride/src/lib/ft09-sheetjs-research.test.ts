import assert from 'node:assert/strict';
import test from 'node:test';
import * as XLSX from 'xlsx';
import { preflightXlsxZip } from './xlsx-zip-preflight';
import { quoteCsvCell } from './csv-spreadsheet-safety';

function rowsToSafeCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(quoteCsvCell).join(',')).join('\r\n');
}

test('round-trips CSV through XLSX and reopens deterministically', () => {
  const sourceCsv = [
    'id,name,note,amount',
    '00123,Zoë,"hello, world",-12.5',
    '00456,李,"line one\nline two",3.25',
  ].join('\r\n');
  const csvWorkbook = XLSX.read(sourceCsv, { type: 'string', raw: true });
  const sourceRows = XLSX.utils.sheet_to_json<unknown[]>(csvWorkbook.Sheets[csvWorkbook.SheetNames[0]], { header: 1, raw: true, defval: '' });
  assert.deepEqual(sourceRows, [
    ['id', 'name', 'note', 'amount'],
    ['00123', 'Zoë', 'hello, world', '-12.5'],
    ['00456', '李', 'line one\nline two', '3.25'],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sourceRows), 'Data');
  const xlsxBytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', compression: true });
  const zipEvidence = preflightXlsxZip(new Uint8Array(xlsxBytes));
  assert.equal(zipEvidence.ok, true);
  if (!zipEvidence.ok) throw new Error(`Generated XLSX failed preflight: ${zipEvidence.reason}`);
  assert.ok(zipEvidence.entries > 0);
  assert.ok(zipEvidence.uncompressedBytes > 0);
  const reopened = XLSX.read(xlsxBytes, { type: 'buffer', raw: true });
  assert.deepEqual(XLSX.utils.sheet_to_json<unknown[]>(reopened.Sheets.Data, { header: 1, raw: true, defval: '' }), sourceRows);
});

test('keeps formula-looking values as strings and safe CSV neutralizes them', () => {
  const rows = [
    ['payload', 'negative'],
    ['=2+2', '-1'],
    ['+SUM(A1:A2)', '-0.25'],
    ['@cmd', '-1e6'],
    ['-HYPERLINK("https://example.invalid")', '-.5'],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  assert.equal(sheet.A2.t, 's');
  assert.equal(sheet.A2.f, undefined);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Data');
  const xlsxBytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const reopened = XLSX.read(xlsxBytes, { type: 'buffer', raw: true, cellFormula: true });
  assert.equal(reopened.Sheets.Data.A2.f, undefined);
  assert.equal(reopened.Sheets.Data.A2.v, '=2+2');
  const reopenedRows = XLSX.utils.sheet_to_json<unknown[]>(reopened.Sheets.Data, { header: 1, raw: true, defval: '' });
  const csv = rowsToSafeCsv(reopenedRows);
  assert.match(csv, /'=2\+2/);
  assert.match(csv, /'\+SUM\(A1:A2\)/);
  assert.match(csv, /'@cmd/);
  assert.match(csv, /'-HYPERLINK/);
  assert.match(csv, /,-1(?:\r?\n|$)/);
  assert.match(csv, /,-0\.25(?:\r?\n|$)/);
  assert.match(csv, /,-1e6(?:\r?\n|$)/);
  assert.match(csv, /,-\.5(?:\r?\n|$)/);
});
