import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Download, FileImage, Trash2, X } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import {
  FILE_INPUT_LIMITS,
  FILE_RESOURCE_LIMITS,
  FileToolError,
  ObjectUrlRegistry,
  assertFileResourceLimit,
  readBlobArrayBuffer,
  validateLocalFile,
  type FileDeviceClass,
  type FileJobStatus,
} from '@/lib/file-tools-foundation';
import {
  IMAGE_TO_PDF_RULES,
  buildImagePdf,
  imageToPdfLimitMessage,
  type ImagePdfPageMode,
  type ImagePdfSource,
} from '@/lib/image-to-pdf-core';
import { fileToolDefinitions } from '@/lib/file-tools-catalog';
import { getRelatedTools } from '@/lib/related-tools';
import '@/styles/file-tools.css';
import '@/styles/image-to-pdf.css';

type UiImagePdfSource = ImagePdfSource & {
  name: string;
  size: number;
  previewUrl: string;
};

const definition = fileToolDefinitions['image-to-pdf'];

function currentDeviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

function errorMessage(error: unknown): string {
  if (error instanceof FileToolError) return error.message;
  return 'The selected images could not be processed locally. Try different JPG or PNG files.';
}

async function imageDimensions(url: string): Promise<{ width: number; height: number }> {
  const image = new Image();
  image.src = url;
  await image.decode();
  return { width: image.naturalWidth, height: image.naturalHeight };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function copiedBlobBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function ImageToPdfPage() {
  const [images, setImages] = useState<UiImagePdfSource[]>([]);
  const [pageMode, setPageMode] = useState<ImagePdfPageMode>('a4-auto');
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<UiImagePdfSource[]>([]);
  const validationAbortRef = useRef<AbortController | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);
  const urlRegistryRef = useRef(new ObjectUrlRegistry());
  const deviceClass = currentDeviceClass();
  const relatedTools = useMemo(() => getRelatedTools('image-to-pdf', 3), []);
  const totalBytes = images.reduce((sum, image) => sum + image.size, 0);

  const setImageState = (next: UiImagePdfSource[]) => {
    imagesRef.current = next;
    setImages(next);
  };

  const releaseImage = (image: UiImagePdfSource) => {
    image.bytes.fill(0);
    urlRegistryRef.current.release(image.previewUrl);
  };

  const clearAllImages = () => {
    for (const image of imagesRef.current) releaseImage(image);
    setImageState([]);
  };

  useEffect(() => () => {
    validationAbortRef.current?.abort();
    exportAbortRef.current?.abort();
    for (const image of imagesRef.current) image.bytes.fill(0);
    imagesRef.current = [];
    urlRegistryRef.current.clear();
  }, []);

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    validationAbortRef.current?.abort();
    const controller = new AbortController();
    validationAbortRef.current = controller;
    setStatus('validating');
    setError('');
    setProgress('Checking images…');
    const pending: UiImagePdfSource[] = [];
    try {
      const files = Array.from(fileList);
      if (imagesRef.current.length + files.length > FILE_RESOURCE_LIMITS.pdfPages) {
        throw new FileToolError('resource-limit', `A PDF can contain up to ${FILE_RESOURCE_LIMITS.pdfPages} images in this tool.`);
      }
      let aggregateBytes = imagesRef.current.reduce((sum, image) => sum + image.size, 0);
      for (let index = 0; index < files.length; index += 1) {
        if (controller.signal.aborted) throw new FileToolError('cancelled', 'Image loading was cancelled.');
        const file = files[index];
        setProgress(`Checking image ${index + 1} of ${files.length}…`);
        const validation = await validateLocalFile(file, IMAGE_TO_PDF_RULES, deviceClass, controller.signal);
        aggregateBytes += file.size;
        if (aggregateBytes > FILE_INPUT_LIMITS[deviceClass]) {
          throw new FileToolError('oversized', `The selected images together exceed the ${Math.round(FILE_INPUT_LIMITS[deviceClass] / 1024 / 1024)} MB ${deviceClass} input limit.`);
        }
        const buffer = await readBlobArrayBuffer(file, controller.signal);
        const bytes = new Uint8Array(buffer);
        let previewUrl: string | null = null;
        try {
          previewUrl = urlRegistryRef.current.create(new Blob([buffer], { type: validation.ruleId === 'png' ? 'image/png' : 'image/jpeg' }));
          const dimensions = await imageDimensions(previewUrl);
          assertFileResourceLimit('imagePixels', dimensions.width * dimensions.height);
          pending.push({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            mime: validation.ruleId === 'png' ? 'image/png' : 'image/jpeg',
            bytes,
            width: dimensions.width,
            height: dimensions.height,
            previewUrl,
          });
          previewUrl = null;
        } catch (caught) {
          if (previewUrl) urlRegistryRef.current.release(previewUrl);
          bytes.fill(0);
          throw caught;
        }
      }
      setImageState([...imagesRef.current, ...pending]);
      setStatus('ready');
      setProgress('');
      setAnnouncement(`${pending.length} ${pending.length === 1 ? 'image' : 'images'} added. ${imagesRef.current.length} total.`);
    } catch (caught) {
      for (const image of pending) releaseImage(image);
      setStatus(controller.signal.aborted ? 'cancelled' : 'failed');
      setError(controller.signal.aborted ? 'Image loading cancelled.' : errorMessage(caught));
      setProgress('');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
      if (validationAbortRef.current === controller) validationAbortRef.current = null;
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= imagesRef.current.length) return;
    const next = [...imagesRef.current];
    [next[index], next[target]] = [next[target], next[index]];
    setImageState(next);
    setAnnouncement(`Image moved to position ${target + 1}.`);
  };

  const removeImage = (index: number) => {
    const next = [...imagesRef.current];
    const [removed] = next.splice(index, 1);
    if (removed) releaseImage(removed);
    setImageState(next);
    setStatus(next.length ? 'ready' : 'idle');
    setError('');
    setAnnouncement(removed ? `${removed.name} removed.` : '');
  };

  const reset = () => {
    validationAbortRef.current?.abort();
    exportAbortRef.current?.abort();
    validationAbortRef.current = null;
    exportAbortRef.current = null;
    clearAllImages();
    setPageMode('a4-auto');
    setStatus('idle');
    setError('');
    setProgress('');
    setAnnouncement('Image to PDF workspace reset.');
  };

  const exportPdf = async () => {
    if (!imagesRef.current.length || exportAbortRef.current) return;
    const controller = new AbortController();
    exportAbortRef.current = controller;
    setStatus('processing');
    setError('');
    setProgress('Building PDF locally…');
    let output: Uint8Array | null = null;
    try {
      output = await buildImagePdf(imagesRef.current, pageMode, () => controller.signal.aborted);
      if (controller.signal.aborted) throw new FileToolError('cancelled', 'PDF creation was cancelled.');
      const blob = new Blob([copiedBlobBuffer(output)], { type: 'application/pdf' });
      const url = urlRegistryRef.current.create(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'figurenest-images.pdf';
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => urlRegistryRef.current.release(url), 0);
      setStatus('ready');
      setProgress('');
      setAnnouncement(`PDF downloaded with ${imagesRef.current.length} pages in the displayed image order.`);
    } catch (caught) {
      setStatus(controller.signal.aborted ? 'cancelled' : 'failed');
      setError(controller.signal.aborted ? 'PDF creation cancelled.' : errorMessage(caught));
      setProgress('');
    } finally {
      output?.fill(0);
      if (exportAbortRef.current === controller) exportAbortRef.current = null;
    }
  };

  return <Shell>
    <Seo path={definition.href} />
    <div className="file-tool-page" data-testid="page-image-to-pdf">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span className="mono" aria-current="page">/ IMAGE TO PDF</span>
      </nav>

      <header className="file-tool-hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> PRIVATE BROWSER TOOL</div>
        <h1>{definition.h1}<span>.</span></h1>
        <p>{definition.description}</p>
        <div className="file-privacy-card" role="note">
          <Check size={18} aria-hidden="true" />
          <div><strong>Your images stay on this device</strong><span>{definition.privacySummary}</span></div>
        </div>
      </header>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      <section className="image-pdf-panel" aria-label="Image to PDF workspace">
        <div className="image-pdf-controls">
          <label className="image-pdf-file-button">
            Add JPG/PNG images
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              multiple
              disabled={status === 'processing' || status === 'validating'}
              onChange={(event) => void addFiles(event.target.files)}
            />
          </label>
          <label>Page layout
            <select value={pageMode} onChange={(event) => setPageMode(event.target.value as ImagePdfPageMode)} disabled={status === 'processing'}>
              <option value="a4-auto">A4 · auto orientation</option>
              <option value="image">Fit page to image</option>
            </select>
          </label>
          {status === 'validating' ? <button type="button" onClick={() => validationAbortRef.current?.abort()}><X size={15} aria-hidden="true" /> Cancel loading</button> : null}
          <span className="image-pdf-summary">{images.length} images · {formatBytes(totalBytes)} total</span>
        </div>

        {error ? <p className="file-tool-error" role="alert">{error}</p> : null}
        {progress ? <p className="file-limit-note" role="status">{progress}</p> : null}

        {images.length ? <ol className="image-pdf-list" aria-label="PDF page image order">
          {images.map((image, index) => <li key={image.id} className="image-pdf-item">
            <img className="image-pdf-thumb" src={image.previewUrl} alt={`Preview of ${image.name}`} />
            <div className="image-pdf-meta">
              <strong>{index + 1}. {image.name}</strong>
              <small>{image.width} × {image.height} px · {formatBytes(image.size)} · {image.mime === 'image/png' ? 'PNG' : 'JPG'}</small>
            </div>
            <div className="image-pdf-actions">
              <button type="button" disabled={index === 0 || status === 'processing'} onClick={() => moveImage(index, -1)} aria-label={`Move ${image.name} earlier`}>Move up</button>
              <button type="button" disabled={index === images.length - 1 || status === 'processing'} onClick={() => moveImage(index, 1)} aria-label={`Move ${image.name} later`}>Move down</button>
              <button type="button" className="danger-action" disabled={status === 'processing'} onClick={() => removeImage(index)} aria-label={`Remove ${image.name}`}><Trash2 size={15} aria-hidden="true" /> Remove</button>
            </div>
          </li>)}
        </ol> : <div className="image-pdf-empty"><FileImage size={28} aria-hidden="true" /><p>Add one or more JPG or PNG images. Their displayed order becomes the PDF page order.</p></div>}

        <div className="image-pdf-export">
          <p>{imageToPdfLimitMessage()} Combined input limit: {Math.round(FILE_INPUT_LIMITS[deviceClass] / 1024 / 1024)} MB on this device class.</p>
          {status === 'processing' ? <button type="button" onClick={() => exportAbortRef.current?.abort()}><X size={15} aria-hidden="true" /> Cancel</button> : null}
          <button type="button" className="primary-export" disabled={!images.length || status === 'processing' || status === 'validating'} onClick={() => void exportPdf()}><Download size={17} aria-hidden="true" /> Create PDF</button>
          <button type="button" disabled={!images.length || status === 'processing'} onClick={reset}>Reset</button>
        </div>
      </section>

      <section className="file-tool-content">
        <article className="advanced-content">
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>One local image becomes one PDF page.</h2>
          <p>FigureNest validates each JPG or PNG by extension, reported MIME type and file signature, decodes it locally to enforce the image-pixel limit, keeps the files in the order shown above, then uses the browser-loaded pdf-lib engine to embed each original image into one PDF page. No conversion API receives the image bytes or file names.</p>
          <p><strong>A4 · auto orientation</strong> contains each image inside an A4 portrait or landscape page with a small margin. <strong>Fit page to image</strong> uses the decoded pixel dimensions as PDF points, scaled down only when a page would exceed the PDF page-size guard. Image DPI metadata is not used to infer physical print size.</p>
          <div className="eyebrow">LIMITATIONS</div>
          <h2>Image files are embedded, not recreated.</h2>
          {definition.limitations.map((item) => <p key={item}>{item}</p>)}
        </article>
        <aside className="advanced-faq">
          <div className="eyebrow">FAQ</div>
          <h2>Common questions.</h2>
          {definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
        </aside>
      </section>

      <section className="section-block" aria-labelledby="image-pdf-related-tools">
        <div className="section-heading"><div><div className="eyebrow">RELATED TOOLS</div><h2 id="image-pdf-related-tools">More private PDF tools.</h2></div></div>
        <div className="tool-list-grid">{relatedTools.map((tool) => <Link key={tool.slug} href={tool.href} className="home-article-card"><span className="mono">{tool.category}</span><h3>{tool.name}</h3><p>Open this related FigureNest tool.</p></Link>)}</div>
      </section>
    </div>
  </Shell>;
}
