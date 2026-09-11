import { inspectDocxPackage } from './docx-package-preflight';
import type { FileDeviceClass } from './file-tools-foundation';

export type DocxConversionResult = {
  html: string;
  messages: readonly string[];
};

export type DocxPdfExportOptions = {
  filename?: string;
  pageFormat?: 'a4' | 'letter';
};

let requestSequence = 0;

export function isAllowedDocxPreviewResourceUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(trimmed);
}

function scrubPreviewResources(container: HTMLElement): void {
  for (const image of container.querySelectorAll('img')) {
    const src = image.getAttribute('src') ?? '';
    if (!isAllowedDocxPreviewResourceUrl(src)) image.removeAttribute('src');
    image.removeAttribute('srcset');
    image.removeAttribute('crossorigin');
  }

  for (const element of container.querySelectorAll<HTMLElement>('*')) {
    element.removeAttribute('style');
    for (const attribute of ['poster', 'background', 'formaction']) element.removeAttribute(attribute);
  }

  for (const anchor of container.querySelectorAll('a')) {
    const href = anchor.getAttribute('href') ?? '';
    if (!/^(?:https?:|mailto:|#)/i.test(href)) anchor.removeAttribute('href');
    anchor.setAttribute('rel', 'noopener noreferrer');
  }
}

export async function sanitizeDocxHtml(html: string): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('DOCX preview sanitization is only available in the browser.');
  }
  const { default: DOMPurify } = await import('dompurify');
  const sanitized = DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'option', 'link', 'meta'],
    FORBID_ATTR: ['style', 'srcset', 'formaction', 'onerror', 'onload'],
  });
  const template = document.createElement('template');
  template.innerHTML = sanitized;
  scrubPreviewResources(template.content.firstElementChild instanceof HTMLElement
    ? template.content.firstElementChild
    : template.content.appendChild(document.createElement('div')));
  return template.innerHTML;
}

function createConversionWorker(): Worker {
  return new Worker(new URL('../workers/docx-to-html.worker.ts', import.meta.url), {
    type: 'module',
    name: 'figurenest-docx-to-html',
  });
}

export async function convertDocxToSanitizedHtml(
  file: File,
  deviceClass: FileDeviceClass,
  signal?: AbortSignal,
): Promise<DocxConversionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  await inspectDocxPackage(bytes, deviceClass);
  if (signal?.aborted) throw new DOMException('DOCX conversion cancelled.', 'AbortError');

  const worker = createConversionWorker();
  const id = ++requestSequence;

  try {
    const raw = await new Promise<{ html: string; messages: string[] }>((resolve, reject) => {
      const abort = () => {
        worker.terminate();
        reject(new DOMException('DOCX conversion cancelled.', 'AbortError'));
      };
      signal?.addEventListener('abort', abort, { once: true });

      worker.onmessage = (event: MessageEvent<{ id: number; ok: boolean; html?: string; messages?: string[]; error?: string }>) => {
        if (event.data.id !== id) return;
        signal?.removeEventListener('abort', abort);
        if (!event.data.ok || typeof event.data.html !== 'string') {
          reject(new Error(event.data.error || 'DOCX conversion failed.'));
          return;
        }
        resolve({ html: event.data.html, messages: event.data.messages ?? [] });
      };
      worker.onerror = (event) => {
        signal?.removeEventListener('abort', abort);
        reject(new Error(event.message || 'DOCX conversion worker failed.'));
      };
      worker.postMessage({ id, arrayBuffer }, [arrayBuffer]);
    });

    return {
      html: await sanitizeDocxHtml(raw.html),
      messages: raw.messages,
    };
  } finally {
    worker.terminate();
  }
}

export async function exportSanitizedPreviewToPdf(
  preview: HTMLElement,
  options: DocxPdfExportOptions = {},
): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(preview, {
    allowTaint: false,
    useCORS: false,
    logging: false,
    backgroundColor: '#ffffff',
    scale: Math.min(Math.max(window.devicePixelRatio || 1, 1), 2),
  });

  const pdf = new jsPDF({ unit: 'pt', format: options.pageFormat ?? 'a4', orientation: 'portrait', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = canvas.height * (imageWidth / canvas.width);
  const imageData = canvas.toDataURL('image/jpeg', 0.92);

  let offsetY = 0;
  let remaining = imageHeight;
  do {
    if (offsetY > 0) pdf.addPage(options.pageFormat ?? 'a4', 'portrait');
    pdf.addImage(imageData, 'JPEG', 0, -offsetY, imageWidth, imageHeight, undefined, 'FAST');
    offsetY += pageHeight;
    remaining -= pageHeight;
  } while (remaining > 0);

  return pdf.output('blob');
}
