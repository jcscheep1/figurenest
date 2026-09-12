export type ExportRow = { label: string; value: string };
export type CalculatorExportSnapshot = {
  title: string;
  url: string;
  generatedAt: string;
  inputs: ExportRow[];
  results: ExportRow[];
  notes?: string[];
};
export type ExportScope = 'full' | 'results';

const spreadsheetSafe = (value: string) => /^[=+\-@]/.test(value.trim()) ? `'${value}` : value;
const csvCell = (value: string) => `"${spreadsheetSafe(value).replaceAll('"', '""')}"`;
const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export function exportRows(snapshot: CalculatorExportSnapshot, scope: ExportScope): ExportRow[] {
  const rows: ExportRow[] = [
    { label: 'Calculator', value: snapshot.title },
    { label: 'Generated', value: snapshot.generatedAt },
    { label: 'Source', value: snapshot.url },
  ];
  if (scope === 'full') {
    rows.push({ label: '', value: '' }, { label: 'INPUTS', value: '' }, ...snapshot.inputs);
  }
  rows.push({ label: '', value: '' }, { label: 'RESULTS', value: '' }, ...snapshot.results);
  if (snapshot.notes?.length) {
    rows.push({ label: '', value: '' }, { label: 'NOTES', value: '' }, ...snapshot.notes.map((note, index) => ({ label: `Note ${index + 1}`, value: note })));
  }
  return rows;
}

export function buildCalculatorCsv(snapshot: CalculatorExportSnapshot, scope: ExportScope): string {
  return ['Field,Value', ...exportRows(snapshot, scope).map((row) => `${csvCell(row.label)},${csvCell(row.value)}`)].join('\r\n');
}

export function buildCalculatorExcelHtml(snapshot: CalculatorExportSnapshot, scope: ExportScope): string {
  const rows = exportRows(snapshot, scope).map((row) => `<tr><td>${escapeHtml(spreadsheetSafe(row.label))}</td><td>${escapeHtml(spreadsheetSafe(row.value))}</td></tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif}table{border-collapse:collapse;width:100%}td{border:1px solid #bbb;padding:8px;vertical-align:top}td:first-child{font-weight:600;width:35%}</style></head><body><table>${rows}</table></body></html>`;
}

export function buildCalculatorPrintHtml(snapshot: CalculatorExportSnapshot, scope: ExportScope): string {
  const inputs = scope === 'full' && snapshot.inputs.length
    ? `<h2>Inputs</h2><table>${snapshot.inputs.map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`).join('')}</table>` : '';
  const results = `<h2>Results</h2><table>${snapshot.results.map((row) => `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`).join('')}</table>`;
  const notes = snapshot.notes?.length ? `<h2>Notes</h2>${snapshot.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')}` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(snapshot.title)} - FigureNest</title><style>@page{margin:16mm}body{font:14px/1.5 Arial,sans-serif;color:#0f172a;max-width:820px;margin:auto}h1{font-size:26px;margin:0 0 6px}h2{font-size:17px;margin:24px 0 8px}.meta{color:#475569;font-size:12px;margin-bottom:22px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:9px;text-align:left;vertical-align:top}th{width:42%;background:#f8fafc}.brand{font-weight:700;color:#0f172a;margin-bottom:18px}.note{margin-top:28px;color:#64748b;font-size:11px}@media print{button{display:none}}</style></head><body><div class="brand">FigureNest</div><h1>${escapeHtml(snapshot.title)}</h1><div class="meta">Generated ${escapeHtml(snapshot.generatedAt)}<br>${escapeHtml(snapshot.url)}</div>${inputs}${results}${notes}<p class="note">Exported from FigureNest. Verify important financial, health, construction, electrical, legal, tax, or other safety-critical decisions against current authoritative information and qualified professional advice where appropriate.</p><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),150));<\/script></body></html>`;
}

export function safeExportFilename(title: string): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-+$/g, '');
  return slug || 'figurenest-calculation';
}
