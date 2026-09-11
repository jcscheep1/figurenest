import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Download, FileImage, FileText, X } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { LocalFileDropzone } from '@/components/LocalFileDropzone';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import {
  FILE_RESOURCE_LIMITS,
  FileToolError,
  ObjectUrlRegistry,
  clearArrayBuffer,
  loadValidatedLocalFile,
  type FileDeviceClass,
  type FileJobStatus,
} from '@/lib/file-tools-foundation';
import { PDF_FILE_RULE, copiedBuffer, pdfInputLimitMessage, validatePdfPageCount } from '@/lib/pdf-sign-edit-core';
import {
  assembleExtractedPdfText,
  createStoredZip,
  parsePdfPageSelection,
  safePdfBaseName,
  textItemsToPlainText,
  type ZipEntry,
} from '@/lib/pdf-convert-core';
import { fileToolDefinitions, type FileToolSlug } from '@/lib/file-tools-catalog';
import { getRelatedTools } from '@/lib/related-tools';
import '@/styles/file-tools.css';

type PdfJsTextItem = { str?: string; hasEOL?: boolean };
type PdfJsPage = {
  getViewport(options: { scale: number }): { width: number; height: number };
  getTextContent(): Promise<{ items: PdfJsTextItem[] }>;
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }): { promise: Promise<void>; cancel(): void };
  cleanup(): void;
};
type PdfJsDocument = { numPages: number; getPage(pageNumber: number): Promise<PdfJsPage>; destroy(): Promise<void> };
type PdfJsLoadingTask = { promise: Promise<PdfJsDocument>; destroy(): Promise<void> };

type LoadedPdf = {
  fileName: string;
  pageCount: number;
  document: PdfJsDocument;
};

function currentDeviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

function errorMessage(error: unknown): string {
  if (error instanceof FileToolError) return error.message;
  const message = error instanceof Error ? error.message : '';
  if (/password|encrypt/i.test(message)) return 'Password-protected or encrypted PDFs are not supported.';
  if (/cancel/i.test(message)) return 'Processing was cancelled.';
  return 'The PDF could not be processed locally. Try another PDF.';
}

function toBlob(canvas: HTMLCanvasElement, type: 'image/png' | 'image/jpeg', quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new FileToolError('malformed', 'The browser could not create the image output.')), type, quality);
  });
}

function blobArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function downloadBlob(blob: Blob, name: string, registry: ObjectUrlRegistry): void {
  const url = registry.create(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => registry.release(url), 0);
}

function useLocalPdf() {
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState<LoadedPdf | null>(null);
  const loadingTaskRef = useRef<PdfJsLoadingTask | null>(null);
  const loadAbortRef = useRef<AbortController | null>(null);
  const documentRef = useRef<PdfJsDocument | null>(null);
  const deviceClass = currentDeviceClass();

  const destroyLoadingTask = async () => {
    const task = loadingTaskRef.current;
    loadingTaskRef.current = null;
    if (task) await task.destroy().catch(() => undefined);
  };
  const destroyDocument = async () => {
    const pdf = documentRef.current;
    documentRef.current = null;
    if (pdf) await pdf.destroy().catch(() => undefined);
  };

  const reset = () => {
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    void destroyLoadingTask();
    void destroyDocument();
    setLoaded(null);
    setStatus('idle');
    setError('');
  };

  useEffect(() => () => {
    loadAbortRef.current?.abort();
    void destroyLoadingTask();
    void destroyDocument();
  }, []);

  const load = async (file: File) => {
    reset();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    setStatus('validating');
    setError('');
    let buffer: ArrayBuffer | null = null;
    try {
      const local = await loadValidatedLocalFile(file, [PDF_FILE_RULE], deviceClass, controller.signal);
      buffer = local.buffer;
      if (controller.signal.aborted) return;
      setStatus('processing');
      const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ]);
      GlobalWorkerOptions.workerSrc = workerModule.default;
      const task = getDocument({
        data: new Uint8Array(copiedBuffer(buffer)),
        useWorkerFetch: false,
        disableAutoFetch: true,
        disableStream: true,
      }) as unknown as PdfJsLoadingTask;
      loadingTaskRef.current = task;
      const pdf = await task.promise;
      if (loadingTaskRef.current === task) loadingTaskRef.current = null;
      if (controller.signal.aborted) {
        await pdf.destroy().catch(() => undefined);
        return;
      }
      validatePdfPageCount(pdf.numPages);
      documentRef.current = pdf;
      setLoaded({ fileName: file.name, pageCount: pdf.numPages, document: pdf });
      setStatus('ready');
    } catch (caught) {
      if (!controller.signal.aborted) {
        setStatus('failed');
        setError(errorMessage(caught));
      } else setStatus('cancelled');
    } finally {
      if (buffer) clearArrayBuffer(buffer);
      if (loadAbortRef.current === controller) loadAbortRef.current = null;
    }
  };

  const cancelLoad = () => {
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    void destroyLoadingTask();
    setStatus('cancelled');
    setError('PDF loading cancelled.');
  };

  return { status, setStatus, error, setError, loaded, reset, load, cancelLoad, deviceClass };
}

function FileToolHeader({ slug }: { slug: FileToolSlug }) {
  const definition = fileToolDefinitions[slug];
  return <>
    <nav className="calc-breadcrumb" aria-label="Breadcrumb">
      <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
      <Link href="/category/file-tools">PDF &amp; File Tools</Link>
      <span className="mono" aria-current="page">/ {definition.name.toUpperCase()}</span>
    </nav>
    <header className="file-tool-hero">
      <div className="eyebrow"><span className="eyebrow-dot" /> PRIVATE BROWSER TOOL</div>
      <h1>{definition.h1}<span>.</span></h1>
      <p>{definition.description}</p>
      <div className="file-privacy-card" role="note">
        <Check size={18} aria-hidden="true" />
        <div><strong>Your PDF stays on this device</strong><span>{definition.privacySummary}</span></div>
      </div>
    </header>
  </>;
}

function ToolContent({ slug, howItWorks }: { slug: FileToolSlug; howItWorks: string }) {
  const definition = fileToolDefinitions[slug];
  const relatedTools = getRelatedTools(slug, 3);
  return <>
    <section className="file-tool-content">
      <article className="advanced-content">
        <div className="eyebrow">HOW IT WORKS</div>
        <h2>Local processing with explicit limits.</h2>
        <p>{howItWorks}</p>
        <div className="eyebrow">LIMITATIONS</div>
        <h2>Know what the browser can and cannot do.</h2>
        {definition.limitations.map((item) => <p key={item}>{item}</p>)}
      </article>
      <aside className="advanced-faq">
        <div className="eyebrow">FAQ</div>
        <h2>Common questions.</h2>
        {definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
      </aside>
    </section>
    <section className="section-block" aria-labelledby={`${slug}-related-tools`}>
      <div className="section-heading"><div><div className="eyebrow">RELATED TOOLS</div><h2 id={`${slug}-related-tools`}>More private file tools.</h2></div></div>
      <div className="tool-list-grid">{relatedTools.map((tool) => <Link key={tool.slug} href={tool.href} className="home-article-card"><span className="mono">{tool.category}</span><h3>{tool.name}</h3><p>Open this related FigureNest tool.</p></Link>)}</div>
    </section>
  </>;
}

export function PdfToImagePage() {
  const pdf = useLocalPdf();
  const definition = fileToolDefinitions['pdf-to-image'];
  const [selection, setSelection] = useState('all');
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [scale, setScale] = useState(1.5);
  const [quality, setQuality] = useState(0.9);
  const [progress, setProgress] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const processingAbortRef = useRef<AbortController | null>(null);
  const urlRegistryRef = useRef(new ObjectUrlRegistry());
  const maxZipBytes = pdf.deviceClass === 'mobile' ? 60 * 1024 * 1024 : 120 * 1024 * 1024;

  useEffect(() => () => {
    processingAbortRef.current?.abort();
    urlRegistryRef.current.clear();
  }, []);

  const reset = () => {
    processingAbortRef.current?.abort();
    processingAbortRef.current = null;
    pdf.reset();
    setSelection('all');
    setProgress('');
    setAnnouncement('Converter reset.');
  };

  const convert = async () => {
    if (!pdf.loaded || processingAbortRef.current) return;
    const controller = new AbortController();
    processingAbortRef.current = controller;
    pdf.setError('');
    pdf.setStatus('processing');
    setProgress('Preparing pages…');
    const entries: ZipEntry[] = [];
    let totalBytes = 0;
    try {
      const pages = parsePdfPageSelection(selection, pdf.loaded.pageCount);
      if (pages.length > 30) throw new FileToolError('resource-limit', 'Convert up to 30 pages at a time to keep browser memory use predictable.');
      const extension = format === 'jpeg' ? 'jpg' : 'png';
      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const baseName = safePdfBaseName(pdf.loaded.fileName);

      for (let index = 0; index < pages.length; index += 1) {
        if (controller.signal.aborted) throw new FileToolError('cancelled', 'Image conversion was cancelled.');
        const pageNumber = pages[index];
        setProgress(`Rendering page ${index + 1} of ${pages.length}…`);
        const page = await pdf.loaded.document.getPage(pageNumber);
        try {
          const viewport = page.getViewport({ scale });
          const width = Math.max(1, Math.ceil(viewport.width));
          const height = Math.max(1, Math.ceil(viewport.height));
          if (width * height > FILE_RESOURCE_LIMITS.imagePixels) {
            throw new FileToolError('resource-limit', `Page ${pageNumber} exceeds the ${Math.round(FILE_RESOURCE_LIMITS.imagePixels / 1_000_000)} megapixel image limit at this scale.`);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d', { alpha: format === 'png' });
          if (!context) throw new FileToolError('malformed', 'Canvas rendering is unavailable in this browser.');
          if (format === 'jpeg') {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);
          }
          const renderTask = page.render({ canvasContext: context, viewport });
          const cancelRender = () => renderTask.cancel();
          controller.signal.addEventListener('abort', cancelRender, { once: true });
          try { await renderTask.promise; } finally { controller.signal.removeEventListener('abort', cancelRender); }
          const blob = await toBlob(canvas, mime, format === 'jpeg' ? quality : undefined);
          canvas.width = 1;
          canvas.height = 1;
          if (pages.length === 1) {
            downloadBlob(blob, `${baseName}.${extension}`, urlRegistryRef.current);
          } else {
            const bytes = new Uint8Array(await blob.arrayBuffer());
            totalBytes += bytes.byteLength;
            if (totalBytes > maxZipBytes) {
              bytes.fill(0);
              throw new FileToolError('resource-limit', `The selected pages exceed the ${Math.round(maxZipBytes / 1024 / 1024)} MB multi-image output limit. Try fewer pages or a smaller scale.`);
            }
            entries.push({ name: `${baseName}-page-${pageNumber}.${extension}`, data: bytes });
          }
        } finally {
          page.cleanup();
        }
      }

      if (entries.length > 1) {
        setProgress('Packaging images…');
        const zip = createStoredZip(entries);
        downloadBlob(new Blob([blobArrayBuffer(zip)], { type: 'application/zip' }), `${safePdfBaseName(pdf.loaded.fileName)}-${format === 'jpeg' ? 'jpg' : 'png'}.zip`, urlRegistryRef.current);
      }
      entries.forEach((entry) => entry.data.fill(0));
      pdf.setStatus('ready');
      setProgress('');
      setAnnouncement(`${pages.length} ${pages.length === 1 ? 'image' : 'images'} downloaded.`);
    } catch (caught) {
      entries.forEach((entry) => entry.data.fill(0));
      pdf.setStatus(controller.signal.aborted ? 'cancelled' : 'failed');
      pdf.setError(controller.signal.aborted ? 'Image conversion cancelled.' : errorMessage(caught));
      setProgress('');
    } finally {
      if (processingAbortRef.current === controller) processingAbortRef.current = null;
    }
  };

  return <Shell>
    <Seo path={definition.href} />
    <div className="file-tool-page" data-testid="page-pdf-to-image">
      <FileToolHeader slug="pdf-to-image" />
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      {!pdf.loaded ? <section className="file-upload-panel">
        <LocalFileDropzone accept="application/pdf,.pdf" status={pdf.status} fileName="" error={pdf.error} onSelect={(file) => void pdf.load(file)} onCancel={pdf.cancelLoad} onReset={reset} />
        <p className="file-limit-note">{pdfInputLimitMessage(pdf.deviceClass)} Password-protected PDFs are rejected locally.</p>
      </section> : <section className="pdf-editor-shell" aria-label="PDF image converter">
        <div className="pdf-editor-toolbar">
          <label>Pages <input value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="all or 1,3-5" aria-describedby="image-page-help" /></label>
          <span id="image-page-help" className="sr-only">Enter all, a page number, or ranges such as 1,3-5.</span>
          <label>Format <select value={format} onChange={(event) => setFormat(event.target.value as 'png' | 'jpeg')}><option value="png">PNG</option><option value="jpeg">JPG</option></select></label>
          <label>Scale <select value={scale} onChange={(event) => setScale(Number(event.target.value))}><option value={1}>1×</option><option value={1.5}>1.5×</option><option value={2}>2×</option><option value={2.5}>2.5×</option><option value={3}>3×</option></select></label>
          {format === 'jpeg' ? <label>JPG quality <input type="range" min="0.6" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /><span className="mono">{Math.round(quality * 100)}%</span></label> : null}
        </div>
        {pdf.error ? <p className="file-tool-error" role="alert">{pdf.error}</p> : null}
        <div className="pdf-export-bar">
          <div><FileImage size={18} aria-hidden="true" /><span><strong>{pdf.loaded.fileName}</strong><small>{pdf.loaded.pageCount} pages · max 30 pages per conversion</small></span></div>
          <button type="button" className="primary-export" disabled={pdf.status === 'processing'} onClick={() => void convert()}><Download size={17} aria-hidden="true" /> {pdf.status === 'processing' ? progress || 'Converting…' : `Convert to ${format === 'jpeg' ? 'JPG' : 'PNG'}`}</button>
          {pdf.status === 'processing' ? <button type="button" onClick={() => processingAbortRef.current?.abort()}><X size={15} aria-hidden="true" /> Cancel</button> : <button type="button" onClick={reset}>Choose another PDF</button>}
        </div>
      </section>}
      <ToolContent slug="pdf-to-image" howItWorks="FigureNest uses the browser-bundled PDF.js renderer to draw only the selected PDF pages to a local canvas, then encodes each canvas as PNG or JPG. A single page downloads directly; multiple pages are packaged into a ZIP in memory. No conversion API receives the PDF or generated images." />
    </div>
  </Shell>;
}

export function PdfToTextPage() {
  const pdf = useLocalPdf();
  const definition = fileToolDefinitions['pdf-to-text'];
  const [selection, setSelection] = useState('all');
  const [output, setOutput] = useState('');
  const [progress, setProgress] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const processingAbortRef = useRef<AbortController | null>(null);
  const urlRegistryRef = useRef(new ObjectUrlRegistry());
  const characterCount = useMemo(() => output.length, [output]);

  useEffect(() => () => {
    processingAbortRef.current?.abort();
    urlRegistryRef.current.clear();
  }, []);

  const reset = () => {
    processingAbortRef.current?.abort();
    processingAbortRef.current = null;
    pdf.reset();
    setSelection('all');
    setOutput('');
    setProgress('');
    setAnnouncement('Extractor reset.');
  };

  const extract = async () => {
    if (!pdf.loaded || processingAbortRef.current) return;
    const controller = new AbortController();
    processingAbortRef.current = controller;
    pdf.setError('');
    pdf.setStatus('processing');
    setOutput('');
    try {
      const pages = parsePdfPageSelection(selection, pdf.loaded.pageCount);
      const extracted: { pageNumber: number; text: string }[] = [];
      for (let index = 0; index < pages.length; index += 1) {
        if (controller.signal.aborted) throw new FileToolError('cancelled', 'Text extraction was cancelled.');
        const pageNumber = pages[index];
        setProgress(`Reading page ${index + 1} of ${pages.length}…`);
        const page = await pdf.loaded.document.getPage(pageNumber);
        try {
          const content = await page.getTextContent();
          extracted.push({ pageNumber, text: textItemsToPlainText(content.items) });
        } finally {
          page.cleanup();
        }
      }
      const text = assembleExtractedPdfText(extracted);
      setOutput(text);
      pdf.setStatus('ready');
      setProgress('');
      setAnnouncement(`Text extracted from ${pages.length} ${pages.length === 1 ? 'page' : 'pages'}.`);
    } catch (caught) {
      pdf.setStatus(controller.signal.aborted ? 'cancelled' : 'failed');
      pdf.setError(controller.signal.aborted ? 'Text extraction cancelled.' : errorMessage(caught));
      setProgress('');
    } finally {
      if (processingAbortRef.current === controller) processingAbortRef.current = null;
    }
  };

  const downloadText = () => {
    if (!output || !pdf.loaded) return;
    downloadBlob(new Blob([output], { type: 'text/plain;charset=utf-8' }), `${safePdfBaseName(pdf.loaded.fileName)}.txt`, urlRegistryRef.current);
    setAnnouncement('Text file downloaded.');
  };

  return <Shell>
    <Seo path={definition.href} />
    <div className="file-tool-page" data-testid="page-pdf-to-text">
      <FileToolHeader slug="pdf-to-text" />
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      {!pdf.loaded ? <section className="file-upload-panel">
        <LocalFileDropzone accept="application/pdf,.pdf" status={pdf.status} fileName="" error={pdf.error} onSelect={(file) => void pdf.load(file)} onCancel={pdf.cancelLoad} onReset={reset} />
        <p className="file-limit-note">{pdfInputLimitMessage(pdf.deviceClass)} Text extraction only — no OCR. Scanned or image-only PDFs may return little or no text.</p>
      </section> : <section className="pdf-editor-shell" aria-label="PDF text extractor">
        <div className="pdf-editor-toolbar">
          <label>Pages <input value={selection} onChange={(event) => setSelection(event.target.value)} placeholder="all or 1,3-5" aria-describedby="text-page-help" /></label>
          <span id="text-page-help" className="sr-only">Enter all, a page number, or ranges such as 1,3-5.</span>
          <button type="button" className="primary-export" disabled={pdf.status === 'processing'} onClick={() => void extract()}><FileText size={16} aria-hidden="true" /> {pdf.status === 'processing' ? progress || 'Extracting…' : 'Extract text'}</button>
          {pdf.status === 'processing' ? <button type="button" onClick={() => processingAbortRef.current?.abort()}><X size={15} aria-hidden="true" /> Cancel</button> : null}
        </div>
        {pdf.error ? <p className="file-tool-error" role="alert">{pdf.error}</p> : null}
        <div className="pdf-workspace-grid">
          <div className="pdf-stage-column">
            <label htmlFor="pdf-text-output"><strong>Extracted text</strong></label>
            <textarea id="pdf-text-output" value={output} readOnly rows={20} placeholder="Extracted text will appear here." style={{ width: '100%', minHeight: '22rem', marginTop: '0.75rem', padding: '1rem', borderRadius: '0.75rem' }} />
          </div>
        </div>
        <div className="pdf-export-bar">
          <div><FileText size={18} aria-hidden="true" /><span><strong>{pdf.loaded.fileName}</strong><small>{pdf.loaded.pageCount} pages · {characterCount.toLocaleString()} extracted characters · no OCR</small></span></div>
          <button type="button" className="primary-export" disabled={!output} onClick={downloadText}><Download size={17} aria-hidden="true" /> Download TXT</button>
          <button type="button" onClick={reset}>Choose another PDF</button>
        </div>
      </section>}
      <ToolContent slug="pdf-to-text" howItWorks="FigureNest asks PDF.js for the text layer already embedded in each selected page, then assembles a plain-text file with clear page separators. This is deliberately not OCR: image-only scans are not sent to a recognition service and may contain no extractable text." />
    </div>
  </Shell>;
}
