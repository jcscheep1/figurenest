import { useState } from 'react';
import { Download, FileSpreadsheet, Printer, X } from 'lucide-react';
import '@/styles/calculator-export.css';
import { buildCalculatorCsv, buildCalculatorExcelHtml, buildCalculatorPrintHtml, safeExportFilename, type CalculatorExportSnapshot, type ExportRow, type ExportScope } from '@/lib/calculator-export';

type Props = { title: string; href: string };

const clean = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim();

function labelForControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  const label = control.closest('label');
  const span = label?.querySelector(':scope > span');
  return clean(span?.textContent) || clean(control.getAttribute('aria-label')) || clean(control.name) || clean(control.id) || 'Input';
}

function valueForControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string {
  if (control instanceof HTMLSelectElement) return clean(control.selectedOptions[0]?.textContent) || control.value;
  if (control instanceof HTMLInputElement && (control.type === 'checkbox' || control.type === 'radio')) return control.checked ? 'Yes' : 'No';
  return clean(control.value);
}

function uniqueRows(rows: ExportRow[]): ExportRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.label}\u0000${row.value}`;
    if (!row.label || !row.value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function captureSnapshot(title: string, href: string): CalculatorExportSnapshot {
  const main = document.querySelector('main');
  const controls = [...(main?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea') ?? [])]
    .filter((control) => !control.closest('.calculator-export-panel') && !control.disabled && control.type !== 'hidden');
  const inputs = uniqueRows(controls.map((control) => ({ label: labelForControl(control), value: valueForControl(control) })));

  const resultRows: ExportRow[] = [];
  const resultPanels = [...(main?.querySelectorAll<HTMLElement>('.advanced-result, [data-testid^="status-"]') ?? [])];
  for (const panel of resultPanels) {
    const label = clean(panel.querySelector(':scope > span')?.textContent) || 'Result';
    const value = clean(panel.querySelector(':scope > strong')?.textContent) || clean(panel.textContent);
    if (value) resultRows.push({ label, value });
  }
  const breakdownRows = [...(main?.querySelectorAll<HTMLElement>('.advanced-breakdown > div, .decision-expansion-results > div') ?? [])]
    .map((row) => ({ label: clean(row.querySelector('span')?.textContent), value: clean(row.querySelector('strong')?.textContent) }));
  resultRows.push(...breakdownRows);

  const explicitResults = [...(main?.querySelectorAll<HTMLElement>('[data-testid^="result-"]') ?? [])]
    .map((element) => ({ label: 'Result', value: clean(element.textContent) }));
  resultRows.push(...explicitResults);

  const notes = [...(main?.querySelectorAll<HTMLElement>('.decision-expansion-note, .date-method-notes, [role="note"]') ?? [])]
    .map((element) => clean(element.textContent))
    .filter(Boolean);

  return {
    title,
    url: new URL(href, window.location.origin).toString(),
    generatedAt: new Date().toLocaleString(),
    inputs,
    results: uniqueRows(resultRows).length ? uniqueRows(resultRows) : [{ label: 'Result', value: 'No visible result was found. Calculate a result before exporting.' }],
    notes: [...new Set(notes)],
  };
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CalculatorExportActions({ title, href }: Props) {
  const [scope, setScope] = useState<ExportScope>('full');
  const [open, setOpen] = useState(false);
  const snapshot = () => captureSnapshot(title, href);
  const baseName = safeExportFilename(title);

  const exportCsv = () => downloadBlob(`\uFEFF${buildCalculatorCsv(snapshot(), scope)}`, 'text/csv;charset=utf-8', `${baseName}.csv`);
  const exportExcel = () => downloadBlob(buildCalculatorExcelHtml(snapshot(), scope), 'application/vnd.ms-excel;charset=utf-8', `${baseName}.xls`);
  const exportPdf = () => {
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if (!popup) return;
    popup.document.open();
    popup.document.write(buildCalculatorPrintHtml(snapshot(), scope));
    popup.document.close();
  };

  return <div className="calculator-export-floating">
    {open && <section className="calculator-export-panel" aria-label="Export calculation">
      <div className="calculator-export-panel-head">
        <div className="calculator-export-copy"><strong>Export calculation</strong><span>Save the current inputs and results.</span></div>
        <button type="button" className="calculator-export-close" onClick={() => setOpen(false)} aria-label="Close export options"><X size={18} /></button>
      </div>
      <label className="calculator-export-scope">
        <span>Export</span>
        <select value={scope} onChange={(event) => setScope(event.target.value as ExportScope)}>
          <option value="full">Full calculation</option>
          <option value="results">Results only</option>
        </select>
      </label>
      <div className="calculator-export-actions">
        <button type="button" onClick={exportExcel}><FileSpreadsheet size={16} aria-hidden="true" /> Excel</button>
        <button type="button" onClick={exportCsv}><Download size={16} aria-hidden="true" /> CSV</button>
        <button type="button" onClick={exportPdf}><Printer size={16} aria-hidden="true" /> PDF / Print</button>
      </div>
    </section>}
    <button type="button" className="calculator-export-trigger" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label="Export this calculation">
      <Download size={17} aria-hidden="true" /> Export
    </button>
  </div>;
}
