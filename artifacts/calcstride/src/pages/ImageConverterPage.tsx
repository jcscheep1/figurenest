import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Download, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { Link } from '@/components/PublicLink';
import {
  FileToolError,
  ObjectUrlRegistry,
  readBlobArrayBuffer,
  validateLocalFile,
  type FileDeviceClass,
  type FileJobStatus,
} from '@/lib/file-tools-foundation';
import {
  IMAGE_CONVERTER_DEFAULT_QUALITY,
  IMAGE_CONVERTER_RULES,
  assertDecodedImageSize,
  buildConvertedImageName,
  clampImageQuality,
  encodedBlobMatchesTargetMime,
  outputMime,
  outputNeedsOpaqueBackground,
  qualityApplies,
  transparencyNotice,
  webpContainsAnimation,
  type ImageConverterOutputFormat,
} from '@/lib/image-converter-core';
import '@/styles/file-tools.css';
import '@/styles/file-tool-buttons.css';

type SourceImage = {
  fileName: string;
  mime: string;
  bytes: Uint8Array;
  previewUrl: string;
  width: number;
  height: number;
};

function currentDeviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

function messageFor(error: unknown): string {
  if (error instanceof FileToolError) return error.message;
  if (error instanceof Error) return error.message;
  return 'The image could not be converted locally.';
}

async function decodeDimensions(url: string): Promise<{ width: number; height: number }> {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  return { width: image.naturalWidth, height: image.naturalHeight };
}

async function canvasBlob(canvas: HTMLCanvasElement, format: ImageConverterOutputFormat, quality: number): Promise<Blob> {
  const mime = outputMime(format);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mime, qualityApplies(format) ? quality : undefined);
  });
  if (!blob || !encodedBlobMatchesTargetMime(blob.type, format)) {
    throw new Error(`${format.toUpperCase()} output is not supported reliably by this browser.`);
  }
  return blob;
}

export function ImageConverterPage() {
  const [source, setSource] = useState<SourceImage | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageConverterOutputFormat>('jpeg');
  const [quality, setQuality] = useState(IMAGE_CONVERTER_DEFAULT_QUALITY);
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultName, setResultName] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<SourceImage | null>(null);
  const urlsRef = useRef(new ObjectUrlRegistry());
  const abortRef = useRef<AbortController | null>(null);

  const clearResult = () => {
    if (resultUrl) urlsRef.current.release(resultUrl);
    setResultUrl('');
    setResultName('');
  };

  const clearSource = () => {
    const current = sourceRef.current;
    if (current) {
      current.bytes.fill(0);
      urlsRef.current.release(current.previewUrl);
    }
    sourceRef.current = null;
    setSource(null);
  };

  useEffect(() => () => {
    abortRef.current?.abort();
    sourceRef.current?.bytes.fill(0);
    sourceRef.current = null;
    urlsRef.current.clear();
  }, []);

  const chooseFile = async (file: File | undefined) => {
    if (!file) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('validating');
    setError('');
    clearResult();

    let bytes: Uint8Array | null = null;
    let previewUrl = '';
    try {
      const validation = await validateLocalFile(file, IMAGE_CONVERTER_RULES, currentDeviceClass(), controller.signal);
      const buffer = await readBlobArrayBuffer(file, controller.signal);
      bytes = new Uint8Array(buffer);
      if (validation.ruleId === 'webp' && webpContainsAnimation(bytes)) {
        throw new FileToolError('unsupported-type', 'Animated WebP is not supported in this converter because Canvas export would keep only a still frame.');
      }

      previewUrl = urlsRef.current.create(new Blob([buffer], { type: file.type || outputMime(validation.ruleId as ImageConverterOutputFormat) }));
      const dimensions = await decodeDimensions(previewUrl);
      assertDecodedImageSize(dimensions.width, dimensions.height);

      clearSource();
      const next: SourceImage = {
        fileName: file.name,
        mime: file.type,
        bytes,
        previewUrl,
        width: dimensions.width,
        height: dimensions.height,
      };
      sourceRef.current = next;
      setSource(next);
      bytes = null;
      previewUrl = '';
      setStatus('ready');
      setAnnouncement(`${file.name} is ready to convert.`);
    } catch (caught) {
      bytes?.fill(0);
      if (previewUrl) urlsRef.current.release(previewUrl);
      setStatus(controller.signal.aborted ? 'cancelled' : 'failed');
      setError(controller.signal.aborted ? 'Image loading was cancelled.' : messageFor(caught));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const convert = async () => {
    const current = sourceRef.current;
    if (!current || status === 'processing') return;
    setStatus('processing');
    setError('');
    clearResult();

    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = current.previewUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = current.width;
      canvas.height = current.height;
      const context = canvas.getContext('2d', { alpha: !outputNeedsOpaqueBackground(outputFormat) });
      if (!context) throw new Error('This browser could not create a local image canvas.');
      if (outputNeedsOpaqueBackground(outputFormat)) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0, current.width, current.height);
      const blob = await canvasBlob(canvas, outputFormat, clampImageQuality(quality));
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 1;
      canvas.height = 1;

      const url = urlsRef.current.create(blob);
      setResultUrl(url);
      setResultName(buildConvertedImageName(current.fileName, outputFormat));
      setStatus('succeeded');
      setAnnouncement(`${current.fileName} converted to ${outputFormat.toUpperCase()} locally.`);
    } catch (caught) {
      setStatus('failed');
      setError(messageFor(caught));
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearResult();
    clearSource();
    setOutputFormat('jpeg');
    setQuality(IMAGE_CONVERTER_DEFAULT_QUALITY);
    setStatus('idle');
    setError('');
    setAnnouncement('Image converter reset.');
  };

  return <Shell>
    <div className="file-tool-page" data-testid="page-image-converter-unpublished">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span className="mono" aria-current="page">/ IMAGE CONVERTER</span>
      </nav>

      <header className="file-tool-hero">
        <div className="eyebrow"><span className="eyebrow-dot" /> PRIVATE BROWSER TOOL</div>
        <h1>Image Converter — Convert PNG, JPG &amp; WebP Online<span>.</span></h1>
        <p>Convert one PNG, JPG/JPEG or still WebP image locally in your browser. Choose the output format and quality, then download the result without uploading the image.</p>
        <div className="file-privacy-card" role="note">
          <Check size={18} aria-hidden="true" />
          <div><strong>Your image stays on this device</strong><span>Conversion uses browser decoding and Canvas export. FigureNest does not send the selected file to a conversion server.</span></div>
        </div>
      </header>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      <section className="file-tool-workspace" aria-label="Image converter workspace">
        <label>
          <strong>Select PNG, JPG or WebP</strong>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            disabled={status === 'validating' || status === 'processing'}
            onChange={(event) => void chooseFile(event.currentTarget.files?.[0])}
          />
        </label>

        {source && <div className="file-tool-summary">
          <ImageIcon size={20} aria-hidden="true" />
          <div><strong>{source.fileName}</strong><span>{source.width} × {source.height}px</span></div>
        </div>}

        <label>
          <strong>Output format</strong>
          <select value={outputFormat} onChange={(event) => { clearResult(); setOutputFormat(event.currentTarget.value as ImageConverterOutputFormat); if (sourceRef.current) setStatus('ready'); }}>
            <option value="jpeg">JPG / JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </label>

        <label>
          <strong>Quality {qualityApplies(outputFormat) ? `${Math.round(quality * 100)}%` : '(not used for PNG)'}</strong>
          <input type="range" min="0.4" max="1" step="0.05" value={quality} disabled={!qualityApplies(outputFormat)} onChange={(event) => { clearResult(); setQuality(clampImageQuality(Number(event.currentTarget.value))); if (sourceRef.current) setStatus('ready'); }} />
        </label>

        <p role="note">{transparencyNotice(outputFormat)} Canvas export may remove EXIF, ICC/color-profile and other metadata. Animated WebP is rejected rather than silently flattened to one frame.</p>

        {error && <div className="file-tool-error" role="alert">{error}</div>}

        <div className="file-tool-actions">
          <button type="button" disabled={!source || status === 'processing' || status === 'validating'} onClick={() => void convert()}>
            Convert image
          </button>
          <a className="file-tool-action-link" href={resultUrl || undefined} download={resultName || undefined} aria-disabled={!resultUrl} tabIndex={resultUrl ? undefined : -1} onClick={(event) => { if (!resultUrl) event.preventDefault(); }}>
            <Download size={17} aria-hidden="true" /> Download result
          </a>
          <button type="button" disabled={!source && !resultUrl} onClick={reset}>
            <RotateCcw size={17} aria-hidden="true" /> Reset
          </button>
        </div>
      </section>
    </div>
  </Shell>;
}
