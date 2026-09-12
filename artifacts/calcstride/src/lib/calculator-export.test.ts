import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCalculatorCsv, buildCalculatorExcelHtml, buildCalculatorPrintHtml, safeExportFilename, type CalculatorExportSnapshot } from './calculator-export';

const snapshot: CalculatorExportSnapshot = {
  title: 'Budget Calculator',
  url: 'https://figurenest.com/calculators/finance/budget',
  generatedAt: '2026-09-09 06:00',
  inputs: [{ label: 'Monthly income', value: '€5,000' }],
  results: [{ label: 'Monthly surplus', value: '€1,200' }],
  notes: ['Planning estimate only.'],
};

test('full CSV includes inputs and results while results scope omits inputs', () => {
  const full = buildCalculatorCsv(snapshot, 'full');
  const results = buildCalculatorCsv(snapshot, 'results');
  assert.match(full, /Monthly income/);
  assert.match(full, /Monthly surplus/);
  assert.doesNotMatch(results, /Monthly income/);
  assert.match(results, /Monthly surplus/);
});

test('spreadsheet export neutralizes formula-like cells', () => {
  for (const formula of ['=2+2', '+2+2', '-2+2', '@SUM(A1:A2)', '  =2+2']) {
    const risky = { ...snapshot, results: [{ label: 'Result', value: formula }] };
    assert.ok(buildCalculatorCsv(risky, 'results').includes(`'${formula}`));
  }
});

test('Excel-compatible export neutralizes formula-like cells', () => {
  for (const formula of ['=2+2', '+2+2', '-2+2', '@SUM(A1:A2)', '  =2+2']) {
    const risky = { ...snapshot, results: [{ label: 'Result', value: formula }] };
    const html = buildCalculatorExcelHtml(risky, 'results');
    assert.ok(html.includes(`&#39;${formula}`));
  }
});

test('Excel and print exports escape HTML-sensitive content', () => {
  const risky = { ...snapshot, title: '<Budget>', results: [{ label: 'Result', value: '<script>alert(1)</script>' }] };
  assert.doesNotMatch(buildCalculatorExcelHtml(risky, 'results'), /<script>alert/);
  assert.doesNotMatch(buildCalculatorPrintHtml(risky, 'results'), /<script>alert/);
  assert.match(buildCalculatorPrintHtml(risky, 'results'), /&lt;Budget&gt;/);
});

test('export filename is stable and filesystem-friendly', () => {
  assert.equal(safeExportFilename('Cable & Fuse Size Calculator'), 'cable-fuse-size-calculator');
  assert.equal(safeExportFilename('***'), 'figurenest-calculation');
  const boundaryTitle = `${'a'.repeat(79)} b`;
  const filename = safeExportFilename(boundaryTitle);
  assert.equal(filename.length, 79);
  assert.doesNotMatch(filename, /-$/);
});
