import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { LocalFileDropzone } from '@/components/LocalFileDropzone';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import {
  FILE_INPUT_LIMITS,
  clearArrayBuffer,
  readBlobArrayBuffer,
  validateLocalFile,
  type FileDeviceClass,
  type FileJobStatus,
  type FileTypeRule,
} from '@/lib/file-tools-foundation';
import {
  convertCsvToXlsx,
  convertXlsxToCsv,
  inspectXlsx,
  type CsvDelimiter,
  type Ft09WorkbookSummary,
} from '@/lib/ft09-converter';
import '@/styles/file-tools.css';

const CSV_RULE: FileTypeRule = {
  id: 'csv',
  extensions: ['csv'],
  mimeTypes: ['text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel'],
};

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

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function baseName(name: string, extension: RegExp): string {
  return name.replace(extension, '') || 'converted';
}

function Summary({ summary }: { summary: Ft09WorkbookSummary }) {
  return <dl className="file-tool-summary">
    <div><dt>Worksheet</dt><dd>{summary.selectedSheet}</dd></div>
    <div><dt>Rows</dt><dd>{summary.rows.toLocaleString()}</dd></div>
    <div><dt>Columns</dt><dd>{summary.columns.toLocaleString()}</dd></div>
    <div><dt>Populated range</dt><dd>{summary.cells.toLocaleString()} cells</dd></div>
  </dl>;
}

export function CsvToXlsxPage() {
  const deviceClass = currentDeviceClass();
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [csvText, setCsvText] = useState('');
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(',');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [summary, setSummary] = useState<Ft09WorkbookSummary | null>(null);
  const [output, setOutput] = useState<ArrayBuffer | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const preview = useMemo(() => csvText.split(/\r?\n/).slice(0, 12).join('\n'), [csvText]);

  const clearOutput = () => {
    clearArrayBuffer(output);
    setOutput(null);
    setSummary(null);
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearOutput();
    setStatus('idle');
    setFileName('');
    setError('');
    setCsvText('');
    setDelimiter(',');
    setSheetName('Sheet1');
  };

  useEffect(() => () => {
    abortRef.current?.abort();
    clearArrayBuffer(output);
  }, [output]);

  const select = async (file: File) => {
    reset();
    setFileName(file.name);
    setStatus('validating');
    const controller = new AbortController();
    abortRef.current = controller;
    let buffer: ArrayBuffer | null = null;
    try {
      await validateLocalFile(file, [CSV_RULE], deviceClass, controller.signal);
      setStatus('processing');
      buffer = await readBlobArrayBuffer(file, controller.signal);
      const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      if (!text.trim()) throw new Error('Choose a CSV file that contains tabular data.');
      setCsvText(text);
      setStatus('ready');
    } catch (caught) {
      if (controller.signal.aborted) setStatus('cancelled');
      else {
        setStatus('failed');
        setError(caught instanceof Error ? caught.message : 'The CSV file could not be read locally.');
      }
    } finally {
      clearArrayBuffer(buffer);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const convert = async () => {
    if (!csvText) return;
    clearOutput();
    setError('');
    setStatus('processing');
    try {
      const result = await convertCsvToXlsx(csvText, { delimiter, sheetName });
      setOutput(result.bytes);
      setSummary(result.summary);
      setStatus('succeeded');
    } catch (caught) {
      setStatus('failed');
      setError(caught instanceof Error ? caught.message : 'The CSV could not be converted locally.');
    }
  };

  const download = () => {
    if (!output) return;
    downloadBlob(
      new Blob([output], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `${baseName(fileName, /\.csv$/i)}.xlsx`,
    );
  };

  return <Shell>
    <Seo path="/file-tools/csv-to-xlsx" />
    <main className="tool-page file-tool-page" data-testid="page-csv-to-xlsx">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span aria-current="page">/ CSV TO XLSX</span>
      </nav>
      <header className="file-tool-hero">
        <p className="eyebrow">Private browser file tool</p>
        <h1>Convert CSV to XLSX</h1>
        <p>Turn a CSV file into an Excel-compatible XLSX workbook locally in your browser.</p>
        <p><strong>Your spreadsheet stays on this device.</strong> File bytes and converted workbook data are not sent to a FigureNest conversion server.</p>
      </header>

      <section className="file-upload-panel" aria-label="Choose CSV file">
        <LocalFileDropzone accept=".csv,text/csv" status={status} fileName={fileName || undefined} error={error || undefined} onSelect={(file) => void select(file)} onCancel={() => abortRef.current?.abort()} onReset={reset} />
        <p className="file-limit-note">Up to {sizeLimitLabel(deviceClass)}. UTF-8 CSV input only; workbook shape limits are enforced before XLSX export.</p>
      </section>

      {csvText ? <section className="docx-preview-step docx-workflow-step" aria-labelledby="csv-options-heading">
        <p className="docx-step-label"><span>2</span> Review options and convert</p>
        <h2 id="csv-options-heading">CSV conversion options</h2>
        <label>Delimiter <select value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiter)}><option value=",">Comma (,)</option><option value=";">Semicolon (;)</option><option value="\t">Tab</option><option value="|">Pipe (|)</option></select></label>
        <label>Worksheet name <input value={sheetName} maxLength={31} onChange={(event) => setSheetName(event.target.value)} /></label>
        <h3>Local preview</h3>
        <pre className="file-tool-preview" aria-label="CSV text preview">{preview}</pre>
        <button className="docx-download-button" type="button" onClick={() => void convert()} disabled={status === 'processing'}>{status === 'processing' ? 'Converting…' : 'Convert to XLSX'}</button>
      </section> : null}

      {output && summary ? <section className="docx-download-ready" aria-live="polite">
        <CheckCircle2 size={25} aria-hidden="true" /><div><h2>Your XLSX is ready</h2><Summary summary={summary} /></div>
        <button type="button" onClick={download}><Download size={18} aria-hidden="true" /> Download XLSX</button>
      </section> : null}
    </main>
  </Shell>;
}

export function XlsxToCsvPage() {
  const deviceClass = currentDeviceClass();
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [summary, setSummary] = useState<Ft09WorkbookSummary | null>(null);
  const [csv, setCsv] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const clearBytes = () => {
    bytes?.fill(0);
    setBytes(null);
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearBytes();
    setStatus('idle');
    setFileName('');
    setError('');
    setSheetNames([]);
    setSelectedSheet('');
    setSummary(null);
    setCsv('');
  };

  useEffect(() => () => bytes?.fill(0), [bytes]);

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
      const inspected = await inspectXlsx(localBytes);
      setBytes(localBytes);
      setSheetNames(inspected.sheetNames);
      setSelectedSheet(inspected.sheetNames[0] ?? '');
      setStatus('ready');
    } catch (caught) {
      if (controller.signal.aborted) setStatus('cancelled');
      else {
        setStatus('failed');
        setError(caught instanceof Error ? caught.message : 'The XLSX file could not be read locally.');
      }
    } finally {
      clearArrayBuffer(buffer);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const convert = async () => {
    if (!bytes || !selectedSheet) return;
    setError('');
    setStatus('processing');
    setCsv('');
    setSummary(null);
    try {
      const result = await convertXlsxToCsv(bytes, selectedSheet);
      setCsv(result.csv);
      setSummary(result.summary);
      setStatus('succeeded');
    } catch (caught) {
      setStatus('failed');
      setError(caught instanceof Error ? caught.message : 'The XLSX workbook could not be converted locally.');
    }
  };

  const download = () => {
    if (!csv) return;
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${baseName(fileName, /\.xlsx$/i)}-${selectedSheet || 'sheet'}.csv`);
  };

  return <Shell>
    <Seo path="/file-tools/xlsx-to-csv" />
    <main className="tool-page file-tool-page" data-testid="page-xlsx-to-csv">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span aria-current="page">/ XLSX TO CSV</span>
      </nav>
      <header className="file-tool-hero">
        <p className="eyebrow">Private browser file tool</p>
        <h1>Convert XLSX to CSV</h1>
        <p>Export one worksheet from an XLSX workbook as injection-safe CSV locally in your browser.</p>
        <p><strong>Your workbook stays on this device.</strong> File bytes, cell values and converted CSV are not sent to a FigureNest conversion server.</p>
      </header>

      <section className="file-upload-panel" aria-label="Choose XLSX file">
        <LocalFileDropzone accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" status={status} fileName={fileName || undefined} error={error || undefined} onSelect={(file) => void select(file)} onCancel={() => abortRef.current?.abort()} onReset={reset} />
        <p className="file-limit-note">Up to {sizeLimitLabel(deviceClass)}, 20 worksheets, 100,000 rows, 1,000 columns and 250,000 populated-range cells per exported sheet. Suspicious ZIP/XLSX packages are rejected locally.</p>
      </section>

      {bytes && sheetNames.length ? <section className="docx-preview-step docx-workflow-step" aria-labelledby="xlsx-options-heading">
        <p className="docx-step-label"><span>2</span> Choose worksheet and convert</p>
        <h2 id="xlsx-options-heading">Worksheet</h2>
        <label>Worksheet <select value={selectedSheet} onChange={(event) => setSelectedSheet(event.target.value)}>{sheetNames.map((name) => <option value={name} key={name}>{name}</option>)}</select></label>
        <button className="docx-download-button" type="button" onClick={() => void convert()} disabled={status === 'processing'}>{status === 'processing' ? 'Converting…' : 'Convert selected sheet to CSV'}</button>
      </section> : null}

      {csv && summary ? <section className="docx-preview-step docx-workflow-step" aria-labelledby="csv-download-heading">
        <div className="docx-preview-heading-row"><div><h2 id="csv-download-heading">Your CSV is ready</h2><Summary summary={summary} /></div><button className="docx-download-button" type="button" onClick={download}><Download size={18} aria-hidden="true" /> Download CSV</button></div>
        <h3>Local preview</h3>
        <pre className="file-tool-preview" aria-label="Converted CSV preview">{csv.slice(0, 5000)}{csv.length > 5000 ? '\n… preview truncated …' : ''}</pre>
      </section> : null}
    </main>
  </Shell>;
}
