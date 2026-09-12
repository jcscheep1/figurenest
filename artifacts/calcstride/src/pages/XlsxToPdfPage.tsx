import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { LocalFileDropzone } from '@/components/LocalFileDropzone';
import {
  FILE_INPUT_LIMITS,
  clearArrayBuffer,
  readBlobArrayBuffer,
  validateLocalFile,
  type FileDeviceClass,
  type FileJobStatus,
  type FileTypeRule,
} from '@/lib/file-tools-foundation';
import { loadFt09SheetJs } from '@/lib/ft09-sheetjs-loader';
import {
  FT10_XLSX_PDF_LIMITS,
  inspectFt10Workbook,
  readFt10BoundedRows,
  renderFt10RowsToSearchablePdf,
  type Ft10Orientation,
  type Ft10PageSize,
  type Ft10WorkbookInspection,
} from '@/lib/ft10-xlsx-pdf';
import '@/styles/file-tools.css';

const XLSX_RULE: FileTypeRule = {
  id: 'xlsx',
  extensions: ['xlsx'],
  mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  magicBytes: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }],
};

function currentDeviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

function sizeLimitLabel(deviceClass: FileDeviceClass): string {
  return `${Math.round(FILE_INPUT_LIMITS[deviceClass] / 1024 / 1024)} MB`;
}

function downloadPdf(bytes: Uint8Array, fileName: string): void {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName.replace(/\.xlsx$/i, '') || 'spreadsheet'}.pdf`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * FT-10 implementation surface. Deliberately unrouted until publication QA exists.
 * Do not add SEO/catalog/sitemap exposure merely because this component compiles.
 */
export function XlsxToPdfPage() {
  const deviceClass = currentDeviceClass();
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [inspection, setInspection] = useState<Ft10WorkbookInspection | null>(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [range, setRange] = useState('');
  const [orientation, setOrientation] = useState<Ft10Orientation>('portrait');
  const [pageSize, setPageSize] = useState<Ft10PageSize>('a4');
  const [previewRows, setPreviewRows] = useState<unknown[][]>([]);
  const [output, setOutput] = useState<Uint8Array | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const preview = useMemo(
    () => previewRows.slice(0, 12).map((row) => row.map((cell) => String(cell ?? '')).join(' | ')).join('\n'),
    [previewRows],
  );

  const clearBytes = () => {
    bytes?.fill(0);
    output?.fill(0);
    setBytes(null);
    setOutput(null);
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearBytes();
    setStatus('idle');
    setFileName('');
    setError('');
    setInspection(null);
    setSelectedSheet('');
    setRange('');
    setOrientation('portrait');
    setPageSize('a4');
    setPreviewRows([]);
  };

  useEffect(() => () => {
    abortRef.current?.abort();
    bytes?.fill(0);
    output?.fill(0);
  }, [bytes, output]);

  const select = async (file: File) => {
    reset();
    setFileName(file.name);
    setStatus('validating');
    const controller = new AbortController();
    abortRef.current = controller;
    let buffer: ArrayBuffer | null = null;
    try {
      await validateLocalFile(file, [XLSX_RULE], deviceClass, controller.signal);
      setStatus('processing');
      buffer = await readBlobArrayBuffer(file, controller.signal);
      const localBytes = new Uint8Array(buffer.slice(0));
      const XLSX = await loadFt09SheetJs();
      const workbook = inspectFt10Workbook(localBytes, XLSX);
      const rows = readFt10BoundedRows(localBytes, XLSX, workbook.selectedSheet);
      setBytes(localBytes);
      setInspection(workbook);
      setSelectedSheet(workbook.selectedSheet);
      setPreviewRows(rows);
      setStatus('ready');
    } catch (caught) {
      if (controller.signal.aborted) setStatus('cancelled');
      else {
        setStatus('failed');
        setError(caught instanceof Error ? caught.message : 'The XLSX workbook could not be inspected locally.');
      }
    } finally {
      clearArrayBuffer(buffer);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const refreshPreview = async () => {
    if (!bytes || !selectedSheet) return;
    setError('');
    setOutput(null);
    try {
      const XLSX = await loadFt09SheetJs();
      const rows = readFt10BoundedRows(bytes, XLSX, { sheetName: selectedSheet, range });
      setPreviewRows(rows);
      setInspection(inspectFt10Workbook(bytes, XLSX, selectedSheet));
      setStatus('ready');
    } catch (caught) {
      setStatus('failed');
      setError(caught instanceof Error ? caught.message : 'The selected worksheet range is not printable.');
    }
  };

  const convert = async () => {
    if (!bytes || !selectedSheet) return;
    setError('');
    setStatus('processing');
    output?.fill(0);
    setOutput(null);
    try {
      const XLSX = await loadFt09SheetJs();
      const rows = readFt10BoundedRows(bytes, XLSX, { sheetName: selectedSheet, range });
      const pdf = renderFt10RowsToSearchablePdf(rows, { orientation, pageSize });
      setPreviewRows(rows);
      setOutput(pdf);
      setStatus('succeeded');
    } catch (caught) {
      setStatus('failed');
      setError(caught instanceof Error ? caught.message : 'The worksheet could not be converted locally.');
    }
  };

  return <main className="tool-page file-tool-page" data-testid="ft10-unrouted-converter">
    <header className="file-tool-hero">
      <p className="eyebrow">FT-10 unpublished implementation</p>
      <h1>XLSX to PDF</h1>
      <p>Convert one bounded worksheet range into a searchable PDF locally in your browser.</p>
      <p><strong>Your spreadsheet stays on this device.</strong> This implementation does not upload workbook bytes or converted PDF content.</p>
    </header>

    <section className="file-upload-panel" aria-label="Choose XLSX file">
      <LocalFileDropzone
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        status={status}
        fileName={fileName || undefined}
        error={error || undefined}
        onSelect={(file) => void select(file)}
        onCancel={() => abortRef.current?.abort()}
        onReset={reset}
      />
      <p className="file-limit-note">Up to {sizeLimitLabel(deviceClass)} input. Printable output is limited to {FT10_XLSX_PDF_LIMITS.maxRows} rows, {FT10_XLSX_PDF_LIMITS.maxColumns} columns, {FT10_XLSX_PDF_LIMITS.maxCells.toLocaleString()} cells and {FT10_XLSX_PDF_LIMITS.maxPages} PDF pages.</p>
    </section>

    {bytes && inspection ? <section className="docx-preview-step docx-workflow-step" aria-labelledby="ft10-options-heading">
      <p className="docx-step-label"><span>2</span> Choose worksheet and print layout</p>
      <h2 id="ft10-options-heading">XLSX to PDF options</h2>
      <label>Worksheet <select value={selectedSheet} onChange={(event) => { setSelectedSheet(event.target.value); setOutput(null); }}>{inspection.sheetNames.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
      <label>Cell range <input value={range} placeholder={inspection.usedRange ?? 'A1:F40'} onChange={(event) => { setRange(event.target.value); setOutput(null); }} aria-describedby="ft10-range-help" /></label>
      <p id="ft10-range-help" className="file-limit-note">Optional. Use Excel notation such as A1:F40. Blank uses the selected sheet's populated range.</p>
      <label>Orientation <select value={orientation} onChange={(event) => { setOrientation(event.target.value as Ft10Orientation); setOutput(null); }}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
      <label>Page size <select value={pageSize} onChange={(event) => { setPageSize(event.target.value as Ft10PageSize); setOutput(null); }}><option value="a4">A4</option><option value="letter">Letter</option></select></label>
      <div className="docx-preview-heading-row"><button type="button" onClick={() => void refreshPreview()}>Refresh preview</button><button className="docx-download-button" type="button" onClick={() => void convert()} disabled={status === 'processing'}>{status === 'processing' ? 'Converting…' : 'Create PDF'}</button></div>
      <h3>Local text preview</h3>
      <pre className="file-tool-preview" aria-label="Worksheet text preview">{preview || 'No printable cells in this range.'}{previewRows.length > 12 ? '\n… preview truncated …' : ''}</pre>
      <p className="file-limit-note"><strong>Best-effort table rendering:</strong> formulas are not recalculated or executed. Charts, pivots, macros, conditional formatting, Excel print settings and exact workbook styling are not preserved.</p>
    </section> : null}

    {output ? <section className="docx-download-ready" aria-live="polite">
      <CheckCircle2 size={25} aria-hidden="true" />
      <div><h2>Your searchable PDF is ready</h2><p>{previewRows.length.toLocaleString()} rows selected · {(output.byteLength / 1024).toFixed(1)} kB local output</p></div>
      <button type="button" onClick={() => downloadPdf(output, fileName)}><Download size={18} aria-hidden="true" /> Download PDF</button>
    </section> : null}
  </main>;
}
