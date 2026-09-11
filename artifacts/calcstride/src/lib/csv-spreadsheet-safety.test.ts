import assert from 'node:assert/strict';
import test from 'node:test';
import { quoteCsvCell, spreadsheetSafeCell } from './csv-spreadsheet-safety';

test('neutralizes formula-leading spreadsheet text', () => {
  for (const value of ['=1+1', '+SUM(A1:A2)', '@cmd', '-HYPERLINK("https://example.invalid")']) {
    assert.equal(spreadsheetSafeCell(value), `'${value}`);
  }
});

test('neutralizes formula prefixes hidden behind leading whitespace', () => {
  for (const value of [' =1+1', '\t+SUM(A1:A2)', '  @cmd', '\r\n-HYPERLINK("x")']) {
    assert.equal(spreadsheetSafeCell(value), `'${value}`);
  }
});

test('preserves genuine negative numeric values', () => {
  for (const value of ['-1', '-0.25', '-.5', '-1e6', '-1.2E-3']) {
    assert.equal(spreadsheetSafeCell(value), value);
  }
});

test('does not alter ordinary text, positive numbers, zero, or blanks', () => {
  for (const value of ['', 'hello', '0', '12.5', '00123', ' café ']) {
    assert.equal(spreadsheetSafeCell(value), value);
  }
});

test('quotes CSV delimiters, quotes, and newlines after safety normalization', () => {
  assert.equal(quoteCsvCell('a,b'), '"a,b"');
  assert.equal(quoteCsvCell('say "hi"'), '"say ""hi"""');
  assert.equal(quoteCsvCell('line1\nline2'), '"line1\nline2"');
  assert.equal(quoteCsvCell('=SUM(A1:A2),x'), '"\'=SUM(A1:A2),x"');
});
