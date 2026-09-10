import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, Check, Download, FileText, Redo2, Trash2, Undo2 } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { LocalFileDropzone } from '@/components/LocalFileDropzone';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import {
  FileToolError,
  ObjectUrlRegistry,
  clearArrayBuffer,
  loadValidatedLocalFile,
  readBlobArrayBuffer,
  validateLocalFile,
  type FileDeviceClass,
  type FileJobStatus,
} from '@/lib/file-tools-foundation';
import {
  MAX_SIGNATURE_IMAGE_BYTES,
  PDF_FILE_RULE,
  SIGNATURE_IMAGE_RULES,
  PdfEditHistory,
  clampEditObjectToPage,
  copiedBuffer,
  createPdfEditObject,
  exportEditedPdf,
  pdfInputLimitMessage,
  pdfRectToViewportBox,
  validatePdfPageCount,
  validateSignatureImageDimensions,
  viewportDeltaToPdfDelta,
  type PdfEditKind,
  type PdfEditObject,
  type PdfPageBounds,
  type PdfPoint,
  type PdfSignatureAsset,
  type PdfViewportTransform,
} from '@/lib/pdf-sign-edit-core';
import { fileToolDefinitions } from '@/lib/file-tools-catalog';
import { getRelatedTools } from '@/lib/related-tools';
import '@/styles/file-tools.css';

type PdfJsPage = {
  getViewport(options: { scale: number }): { width: number; height: number; transform: number[] };
  getWidth?: () => number;
  getHeight?: () => number;
  view: number[];
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: unknown; transform?: number[] }): { promise: Promise<void>; cancel(): void };
  cleanup(): void;
};

type PdfJsDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfJsPage>;
  destroy(): Promise<void>;
};

type PageView = {
  pdfBounds: PdfPageBounds;
  viewportWidth: number;
  viewportHeight: number;
  transform: PdfViewportTransform;
};

type UiSignatureAsset = PdfSignatureAsset & { previewUrl: string };

type DragState = {
  id: string;
  startClient: PdfPoint;
  startObject: PdfEditObject;
};

const definition = fileToolDefinitions['pdf-sign-edit'];

function currentDeviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

function errorMessage(error: unknown): string {
  if (error instanceof FileToolError) return error.message;
  const message = error instanceof Error ? error.message : '';
  if (/password|encrypt/i.test(message)) return 'Password-protected or encrypted PDFs are not supported.';
  return 'The file could not be processed locally. Try another PDF.';
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function updateItem(items: readonly PdfEditObject[], id: string, update: (item: PdfEditObject) => PdfEditObject): PdfEditObject[] {
  return items.map((item) => item.id === id ? update(item) : item);
}

async function imageDimensions(url: string): Promise<{ width: number; height: number }> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return { width: image.naturalWidth, height: image.naturalHeight };
}

function dateStamp(): string {
  const now = new Date();
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function PdfSignEditPage() {
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pageView, setPageView] = useState<PageView | null>(null);
  const [objects, setObjects] = useState<PdfEditObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState('Text');
  const [initialsDraft, setInitialsDraft] = useState('');
  const [signatureStrokes, setSignatureStrokes] = useState<PdfPoint[][]>([]);
  const [assets, setAssets] = useState<UiSignatureAsset[]>([]);
  const [exporting, setExporting] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const pdfDocumentRef = useRef<PdfJsDocument | null>(null);
  const originalBufferRef = useRef<ArrayBuffer | null>(null);
  const urlRegistryRef = useRef(new ObjectUrlRegistry());
  const historyRef = useRef(new PdfEditHistory());
  const objectsRef = useRef<PdfEditObject[]>([]);
  const dragRef = useRef<DragState | null>(null);
  const drawingRef = useRef(false);
  const activeStrokeRef = useRef<PdfPoint[]>([]);
  const assetsRef = useRef<UiSignatureAsset[]>([]);
  const loadAbortRef = useRef<AbortController | null>(null);
  const selected = objects.find((item) => item.id === selectedId) ?? null;
  const currentObjects = useMemo(() => objects.filter((item) => item.pageIndex === pageIndex), [objects, pageIndex]);
  const deviceClass = currentDeviceClass();
  const relatedTools = useMemo(() => getRelatedTools('pdf-sign-edit', 3), []);

  const setObjectPreview = (next: PdfEditObject[]) => {
    objectsRef.current = next;
    setObjects(next);
  };

  const commitObjects = (next: PdfEditObject[], message?: string) => {
    const committed = historyRef.current.commit(next);
    setObjectPreview(committed);
    if (message) setAnnouncement(message);
  };

  const destroyDocument = async () => {
    const document = pdfDocumentRef.current;
    pdfDocumentRef.current = null;
    if (document) await document.destroy().catch(() => undefined);
  };

  const resetDocument = () => {
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    void destroyDocument();
    clearArrayBuffer(originalBufferRef.current);
    originalBufferRef.current = null;
    for (const asset of assetsRef.current) asset.bytes.fill(0);
    assetsRef.current = [];
    urlRegistryRef.current.clear();
    setAssets([]);
    setStatus('idle');
    setError('');
    setFileName('');
    setPageCount(0);
    setPageIndex(0);
    setZoom(1);
    setPageView(null);
    setObjectPreview(historyRef.current.reset());
    setSelectedId(null);
    setSignatureStrokes([]);
    setAnnouncement('Editor reset.');
  };

  useEffect(() => () => {
    loadAbortRef.current?.abort();
    void destroyDocument();
    clearArrayBuffer(originalBufferRef.current);
    originalBufferRef.current = null;
    for (const asset of assetsRef.current) asset.bytes.fill(0);
    assetsRef.current = [];
    urlRegistryRef.current.clear();
  }, []);

  useEffect(() => {
    const document = pdfDocumentRef.current;
    const canvas = canvasRef.current;
    if (!document || !canvas || pageCount === 0) return;
    let cancelled = false;
    let renderTask: ReturnType<PdfJsPage['render']> | null = null;

    void document.getPage(pageIndex + 1).then(async (page) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale: zoom });
      const transform = viewport.transform;
      if (transform.length !== 6) throw new FileToolError('malformed', 'Unexpected PDF viewport transform.');
      const rawWidth = Math.abs(page.view[2] - page.view[0]);
      const rawHeight = Math.abs(page.view[3] - page.view[1]);
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new FileToolError('malformed', 'Canvas rendering is unavailable in this browser.');
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.ceil(viewport.width * ratio));
      canvas.height = Math.max(1, Math.ceil(viewport.height * ratio));
      canvas.style.width = `${Math.ceil(viewport.width)}px`;
      canvas.style.height = `${Math.ceil(viewport.height)}px`;
      setPageView({
        pdfBounds: { width: rawWidth, height: rawHeight },
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        transform: transform as unknown as PdfViewportTransform,
      });
      renderTask = page.render({
        canvasContext: context,
        viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
      });
      await renderTask.promise;
      page.cleanup();
    }).catch((caught) => {
      if (!cancelled) setError(errorMessage(caught));
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pageCount, pageIndex, zoom]);

  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(320, Math.round(canvas.clientWidth || 520));
    const height = 160;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const stroke of signatureStrokes) {
      if (stroke.length < 2) continue;
      context.beginPath();
      context.moveTo(stroke[0].x * width, stroke[0].y * height);
      for (const point of stroke.slice(1)) context.lineTo(point.x * width, point.y * height);
      context.stroke();
    }
  }, [signatureStrokes]);

  const loadPdf = async (file: File) => {
    resetDocument();
    const controller = new AbortController();
    loadAbortRef.current = controller;
    setFileName(file.name);
    setStatus('validating');
    try {
      const { buffer } = await loadValidatedLocalFile(file, [PDF_FILE_RULE], deviceClass, controller.signal);
      if (controller.signal.aborted) return;
      originalBufferRef.current = buffer;
      setStatus('processing');
      const [{ getDocument, GlobalWorkerOptions }, workerModule] = await Promise.all([
        import('pdfjs-dist'),
        import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      ]);
      GlobalWorkerOptions.workerSrc = workerModule.default;
      const loadingTask = getDocument({
        data: new Uint8Array(copiedBuffer(buffer)),
        useWorkerFetch: false,
        disableAutoFetch: true,
        disableStream: true,
      });
      const document = await loadingTask.promise as unknown as PdfJsDocument;
      if (controller.signal.aborted) {
        await document.destroy();
        return;
      }
      validatePdfPageCount(document.numPages);
      pdfDocumentRef.current = document;
      setPageCount(document.numPages);
      setPageIndex(0);
      setStatus('ready');
      setAnnouncement(`PDF ready. ${document.numPages} ${document.numPages === 1 ? 'page' : 'pages'}.`);
    } catch (caught) {
      clearArrayBuffer(originalBufferRef.current);
      originalBufferRef.current = null;
      setStatus(controller.signal.aborted ? 'cancelled' : 'failed');
      setError(controller.signal.aborted ? 'PDF loading cancelled.' : errorMessage(caught));
    } finally {
      if (loadAbortRef.current === controller) loadAbortRef.current = null;
    }
  };

  const cancelLoad = () => {
    loadAbortRef.current?.abort();
    setStatus('cancelled');
    setAnnouncement('PDF loading cancelled.');
  };

  const addObject = (kind: PdfEditKind, options: Parameters<typeof createPdfEditObject>[4] = {}) => {
    if (!pageView) return;
    const item = createPdfEditObject(kind, pageIndex, pageView.pdfBounds, createId(kind), options);
    commitObjects([...objectsRef.current, item], `${kind === 'check' ? 'Checkmark' : 'Item'} added.`);
    setSelectedId(item.id);
  };

  const addText = () => {
    const value = textDraft.trim();
    if (!value) return;
    addObject('text', { value });
  };

  const addInitials = () => {
    const value = initialsDraft.trim().slice(0, 12);
    if (!value) return;
    addObject('initials', { value });
  };

  const removeSelected = () => {
    if (!selectedId) return;
    commitObjects(objectsRef.current.filter((item) => item.id !== selectedId), 'Item removed.');
    setSelectedId(null);
  };

  const nudgeSelected = (dx: number, dy: number) => {
    if (!selected || !pageView) return;
    commitObjects(updateItem(objectsRef.current, selected.id, (item) => clampEditObjectToPage({ ...item, x: item.x + dx, y: item.y + dy }, pageView.pdfBounds)));
  };

  const resizeSelected = (factor: number) => {
    if (!selected || !pageView) return;
    commitObjects(updateItem(objectsRef.current, selected.id, (item) => clampEditObjectToPage({
      ...item,
      width: item.width * factor,
      height: item.height * factor,
    }, pageView.pdfBounds)));
  };

  const updateSelectedText = (value: string) => {
    if (!selected || !['text', 'initials', 'date'].includes(selected.kind)) return;
    const next = updateItem(objectsRef.current, selected.id, (item) => ({ ...item, value }));
    commitObjects(next);
  };

  const undo = () => {
    const next = historyRef.current.undo();
    setObjectPreview(next);
    if (selectedId && !next.some((item) => item.id === selectedId)) setSelectedId(null);
    setAnnouncement('Undid last edit.');
  };

  const redo = () => {
    const next = historyRef.current.redo();
    setObjectPreview(next);
    setAnnouncement('Redid edit.');
  };

  const pointerDownObject = (event: ReactPointerEvent<HTMLButtonElement>, item: PdfEditObject) => {
    if (!pageView) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(item.id);
    dragRef.current = {
      id: item.id,
      startClient: { x: event.clientX, y: event.clientY },
      startObject: { ...item },
    };
  };

  const pointerMoveObject = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.currentTarget.dataset.objectId || !pageView) return;
    const viewportDelta = { x: event.clientX - drag.startClient.x, y: event.clientY - drag.startClient.y };
    const pdfDelta = viewportDeltaToPdfDelta(pageView.transform, viewportDelta);
    const next = updateItem(historyRef.current.value, drag.id, () => clampEditObjectToPage({
      ...drag.startObject,
      x: drag.startObject.x + pdfDelta.x,
      y: drag.startObject.y + pdfDelta.y,
    }, pageView.pdfBounds));
    setObjectPreview(next);
  };

  const pointerUpObject = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.currentTarget.dataset.objectId) return;
    dragRef.current = null;
    const committed = historyRef.current.commit(objectsRef.current);
    setObjectPreview(committed);
    setAnnouncement('Item moved.');
  };

  const objectKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, item: PdfEditObject) => {
    const amount = event.shiftKey ? 10 : 1;
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      setSelectedId(item.id);
      commitObjects(objectsRef.current.filter((candidate) => candidate.id !== item.id), 'Item removed.');
      setSelectedId(null);
      return;
    }
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-amount, 0], ArrowRight: [amount, 0], ArrowUp: [0, amount], ArrowDown: [0, -amount],
    };
    const delta = directions[event.key];
    if (!delta || !pageView) return;
    event.preventDefault();
    setSelectedId(item.id);
    commitObjects(updateItem(objectsRef.current, item.id, (candidate) => clampEditObjectToPage({
      ...candidate, x: candidate.x + delta[0], y: candidate.y + delta[1],
    }, pageView.pdfBounds)));
  };

  const signaturePoint = (event: ReactPointerEvent<HTMLCanvasElement>): PdfPoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  };

  const beginSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = signaturePoint(event);
    activeStrokeRef.current = [point];
    const context = event.currentTarget.getContext('2d');
    if (context) {
      context.beginPath();
      context.moveTo(point.x * event.currentTarget.clientWidth, point.y * event.currentTarget.clientHeight);
    }
  };

  const continueSignature = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = signaturePoint(event);
    activeStrokeRef.current = [...activeStrokeRef.current, point];
    const context = event.currentTarget.getContext('2d');
    if (context) {
      context.lineTo(point.x * event.currentTarget.clientWidth, point.y * event.currentTarget.clientHeight);
      context.stroke();
    }
  };

  const endSignature = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const completed = activeStrokeRef.current.map((point) => ({ ...point }));
    if (completed.length >= 2) setSignatureStrokes((current) => [...current, completed]);
    activeStrokeRef.current = [];
  };

  const addDrawnSignature = () => {
    const strokes = signatureStrokes.filter((stroke) => stroke.length >= 2);
    if (!strokes.length) return;
    addObject('signature-draw', { strokes });
  };

  const uploadSignature = async (file: File | undefined) => {
    if (!file || !pageView) return;
    setError('');
    let previewUrl: string | null = null;
    let bytes: Uint8Array | null = null;
    try {
      if (file.size > MAX_SIGNATURE_IMAGE_BYTES) throw new FileToolError('oversized', 'Signature images are limited to 10 MB.');
      const validation = await validateLocalFile(file, SIGNATURE_IMAGE_RULES, deviceClass);
      const buffer = await readBlobArrayBuffer(file);
      bytes = new Uint8Array(buffer);
      previewUrl = urlRegistryRef.current.create(new Blob([buffer], { type: file.type || (validation.ruleId === 'png' ? 'image/png' : 'image/jpeg') }));
      const dimensions = await imageDimensions(previewUrl);
      validateSignatureImageDimensions(dimensions.width, dimensions.height);
      const asset: UiSignatureAsset = {
        id: createId('signature-asset'),
        mime: validation.ruleId === 'png' ? 'image/png' : 'image/jpeg',
        bytes,
        previewUrl,
      };
      assetsRef.current = [...assetsRef.current, asset];
      setAssets(assetsRef.current);
      addObject('signature-image', { assetId: asset.id });
      previewUrl = null;
      bytes = null;
      if (signatureInputRef.current) signatureInputRef.current.value = '';
    } catch (caught) {
      if (previewUrl) urlRegistryRef.current.release(previewUrl);
      bytes?.fill(0);
      if (signatureInputRef.current) signatureInputRef.current.value = '';
      setError(errorMessage(caught));
    }
  };

  const exportPdf = async () => {
    const original = originalBufferRef.current;
    if (!original || exporting) return;
    setExporting(true);
    setError('');
    setStatus('processing');
    try {
      const output = await exportEditedPdf(copiedBuffer(original), objectsRef.current, assets);
      const outputBuffer = output.slice().buffer as ArrayBuffer;
      const url = urlRegistryRef.current.create(new Blob([outputBuffer], { type: 'application/pdf' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'figurenest-edited.pdf';
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => urlRegistryRef.current.release(url), 0);
      setStatus('ready');
      setAnnouncement('Edited PDF downloaded.');
    } catch (caught) {
      setStatus('failed');
      setError(errorMessage(caught));
    } finally {
      setExporting(false);
    }
  };

  return <Shell>
    <Seo path={definition.href} />
    <main className="file-tool-page" data-testid="page-pdf-sign-edit">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span className="mono" aria-current="page">/ PDF SIGN &amp; EDIT</span>
      </nav>

      <header className="file-tool-hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> PRIVATE BROWSER TOOL</div>
        <h1>{definition.h1}<span>.</span></h1>
        <p>{definition.description}</p>
        <div className="file-privacy-card" role="note">
          <Check size={18} aria-hidden="true" />
          <div><strong>Your files stay on this device</strong><span>{definition.privacySummary} Normal page and consent-controlled analytics requests never include file names or document contents.</span></div>
        </div>
      </header>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      {pageCount === 0 ? <section className="file-upload-panel">
        <LocalFileDropzone
          accept="application/pdf,.pdf"
          status={status}
          fileName={fileName}
          error={error}
          onSelect={(file) => void loadPdf(file)}
          onCancel={cancelLoad}
          onReset={resetDocument}
        />
        <p className="file-limit-note">{pdfInputLimitMessage(deviceClass)} Password-protected PDFs are rejected locally.</p>
      </section> : <section className="pdf-editor-shell" aria-label="PDF editor">
        <div className="pdf-editor-toolbar" role="toolbar" aria-label="PDF editing tools">
          <label>Text <input value={textDraft} onChange={(event) => setTextDraft(event.target.value)} maxLength={120} /></label>
          <button type="button" onClick={addText}>Add text</button>
          <label>Initials <input value={initialsDraft} onChange={(event) => setInitialsDraft(event.target.value)} maxLength={12} /></label>
          <button type="button" onClick={addInitials} disabled={!initialsDraft.trim()}>Add initials</button>
          <button type="button" onClick={() => addObject('date', { value: dateStamp() })}>Add date</button>
          <button type="button" onClick={() => addObject('check')}>Add check</button>
          <button type="button" onClick={undo} disabled={!historyRef.current.canUndo}><Undo2 size={16} aria-hidden="true" /> Undo</button>
          <button type="button" onClick={redo} disabled={!historyRef.current.canRedo}><Redo2 size={16} aria-hidden="true" /> Redo</button>
        </div>

        <div className="pdf-workspace-grid">
          <aside className="pdf-signature-panel" aria-label="Signature tools">
            <h2>Signature</h2>
            <p>Draw with a mouse, pen or touch.</p>
            <canvas
              ref={signatureCanvasRef}
              className="signature-pad"
              aria-label="Draw signature"
              role="img"
              onPointerDown={beginSignature}
              onPointerMove={continueSignature}
              onPointerUp={endSignature}
              onPointerCancel={endSignature}
            />
            <div className="signature-actions">
              <button type="button" onClick={() => setSignatureStrokes([])}>Clear</button>
              <button type="button" onClick={addDrawnSignature} disabled={!signatureStrokes.some((stroke) => stroke.length >= 2)}>Add drawn signature</button>
            </div>
            <div className="signature-upload">
              <label htmlFor="signature-image">Or upload PNG/JPEG</label>
              <input ref={signatureInputRef} id="signature-image" type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => void uploadSignature(event.target.files?.item(0) ?? undefined)} />
              <small>Up to 10 MB and 40 megapixels.</small>
            </div>

            {selected ? <section className="selected-edit-panel" aria-label="Selected item controls">
              <h2>Selected item</h2>
              <p className="mono">{selected.kind.toUpperCase()}</p>
              {['text', 'initials', 'date'].includes(selected.kind) ? <label>Text <input value={selected.value ?? ''} onChange={(event) => updateSelectedText(event.target.value)} /></label> : null}
              <div className="nudge-grid" aria-label="Move selected item">
                <button type="button" onClick={() => nudgeSelected(0, 5)} aria-label="Move up">↑</button>
                <button type="button" onClick={() => nudgeSelected(-5, 0)} aria-label="Move left">←</button>
                <button type="button" onClick={() => nudgeSelected(5, 0)} aria-label="Move right">→</button>
                <button type="button" onClick={() => nudgeSelected(0, -5)} aria-label="Move down">↓</button>
              </div>
              <div className="size-actions"><button type="button" onClick={() => resizeSelected(0.9)}>Smaller</button><button type="button" onClick={() => resizeSelected(1.1)}>Larger</button></div>
              <button type="button" className="danger-action" onClick={removeSelected}><Trash2 size={15} aria-hidden="true" /> Delete item</button>
            </section> : null}
          </aside>

          <div className="pdf-stage-column">
            <div className="pdf-page-controls">
              <button type="button" disabled={pageIndex === 0} onClick={() => { setPageIndex((value) => Math.max(0, value - 1)); setSelectedId(null); }}>Previous</button>
              <span className="mono">PAGE {pageIndex + 1} / {pageCount}</span>
              <button type="button" disabled={pageIndex >= pageCount - 1} onClick={() => { setPageIndex((value) => Math.min(pageCount - 1, value + 1)); setSelectedId(null); }}>Next</button>
              <label>Zoom <select value={zoom} onChange={(event) => setZoom(Number(event.target.value))}><option value={0.75}>75%</option><option value={1}>100%</option><option value={1.25}>125%</option><option value={1.5}>150%</option><option value={2}>200%</option></select></label>
            </div>
            {error ? <p className="file-tool-error" role="alert">{error}</p> : null}
            <div className="pdf-stage-scroll">
              <div className="pdf-page-stage" style={pageView ? { width: pageView.viewportWidth, height: pageView.viewportHeight } : undefined}>
                <canvas ref={canvasRef} className="pdf-page-canvas" aria-label={`PDF page ${pageIndex + 1}`} />
                {pageView ? <div className="pdf-object-layer" aria-label={`Editable items on page ${pageIndex + 1}`}>
                  {currentObjects.map((item) => {
                    const box = pdfRectToViewportBox(pageView.transform, item);
                    const asset = item.assetId ? assets.find((candidate) => candidate.id === item.assetId) : undefined;
                    return <button
                      key={item.id}
                      type="button"
                      className={`pdf-edit-object ${selectedId === item.id ? 'is-selected' : ''}`}
                      style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
                      data-object-id={item.id}
                      aria-label={`${item.kind.replace('-', ' ')}. Drag to move. Use arrow keys to move, Shift plus arrow for larger steps, Delete to remove.`}
                      onPointerDown={(event) => pointerDownObject(event, item)}
                      onPointerMove={pointerMoveObject}
                      onPointerUp={pointerUpObject}
                      onPointerCancel={() => { dragRef.current = null; setObjectPreview(historyRef.current.value); }}
                      onKeyDown={(event) => objectKeyDown(event, item)}
                    >
                      {item.kind === 'check' ? <span className="pdf-check-mark">✓</span>
                        : item.kind === 'signature-draw' ? <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{item.strokes?.map((stroke, index) => <polyline key={index} points={stroke.map((point) => `${point.x * 100},${point.y * 100}`).join(' ')} />)}</svg>
                        : item.kind === 'signature-image' && asset ? <img src={asset.previewUrl} alt="" />
                        : <span>{item.value}</span>}
                    </button>;
                  })}
                </div> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="pdf-export-bar">
          <div><FileText size={18} aria-hidden="true" /><span><strong>{fileName}</strong><small>{pageCount} pages · {objects.length} added items</small></span></div>
          <button type="button" className="primary-export" disabled={exporting} onClick={() => void exportPdf()}><Download size={17} aria-hidden="true" /> {exporting ? 'Preparing PDF…' : 'Download edited PDF'}</button>
          <button type="button" onClick={resetDocument}>Choose another PDF</button>
        </div>
      </section>}

      <section className="file-tool-content">
        <article>
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>Fill and sign without sending the document away.</h2>
          <p>Select a PDF, place the fill-and-sign items you need, then export a flattened edited copy. Object positions are stored in PDF page coordinates rather than screen pixels, so changing preview zoom does not change where a mark is written into the downloaded file.</p>
          <p>FigureNest uses PDF.js only to render the local preview and pdf-lib to write the exported copy. Processing engines are bundled with the site and loaded only when this tool is opened. The editor does not use a cloud conversion API.</p>
          <div className="eyebrow">LIMITATIONS</div>
          <h2>What this first release does not promise.</h2>
          {definition.limitations.map((item) => <p key={item}>{item}</p>)}
        </article>
        <aside className="advanced-faq">
          <div className="eyebrow">FAQ</div>
          <h2>Common questions.</h2>
          {definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
        </aside>
      </section>

      <section className="section-block" aria-labelledby="pdf-related-tools">
        <div className="section-heading"><div><div className="eyebrow">RELATED TOOLS</div><h2 id="pdf-related-tools">Useful image and sizing tools.</h2></div></div>
        <div className="tool-list-grid">{relatedTools.map((tool) => <Link key={tool.slug} href={tool.href} className="home-article-card"><span className="mono">{tool.category}</span><h3>{tool.name}</h3><p>Open this related FigureNest tool.</p></Link>)}</div>
      </section>
    </main>
  </Shell>;
}
