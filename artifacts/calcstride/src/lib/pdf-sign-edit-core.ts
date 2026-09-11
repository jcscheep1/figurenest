import {
  FILE_RESOURCE_LIMITS,
  FileToolError,
  assertFileResourceLimit,
  type FileTypeRule,
} from './file-tools-foundation';

export const PDF_FILE_RULE: FileTypeRule = {
  id: 'pdf',
  extensions: ['pdf'],
  mimeTypes: ['application/pdf'],
  magicBytes: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }],
};

export const SIGNATURE_IMAGE_RULES: readonly FileTypeRule[] = [
  {
    id: 'png',
    extensions: ['png'],
    mimeTypes: ['image/png'],
    magicBytes: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  {
    id: 'jpeg',
    extensions: ['jpg', 'jpeg'],
    mimeTypes: ['image/jpeg'],
    magicBytes: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  },
];

export const MAX_SIGNATURE_IMAGE_BYTES = 10 * 1024 * 1024;

export type PdfPoint = { x: number; y: number };
export type PdfViewportTransform = readonly [number, number, number, number, number, number];
export type PdfPageBounds = { width: number; height: number };
export type PdfEditKind = 'text' | 'initials' | 'date' | 'check' | 'signature-draw' | 'signature-image';

export type PdfEditObject = {
  id: string;
  pageIndex: number;
  kind: PdfEditKind;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  fontSize?: number;
  strokes?: PdfPoint[][];
  assetId?: string;
};

export type PdfSignatureAsset = {
  id: string;
  mime: 'image/png' | 'image/jpeg';
  bytes: Uint8Array;
};

export type PdfViewportBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export async function withPdfPageCleanup<T extends { cleanup(): unknown }>(
  pagePromise: Promise<T>,
  isCancelled: () => boolean,
  render: (page: T) => Promise<void>,
): Promise<void> {
  let page: T | null = null;
  try {
    page = await pagePromise;
    if (isCancelled()) return;
    await render(page);
  } finally {
    page?.cleanup();
  }
}

function clonePoint(point: PdfPoint): PdfPoint {
  return { x: point.x, y: point.y };
}

export function cloneEditObject(item: PdfEditObject): PdfEditObject {
  return {
    ...item,
    strokes: item.strokes?.map((stroke) => stroke.map(clonePoint)),
  };
}

export function cloneEditObjects(items: readonly PdfEditObject[]): PdfEditObject[] {
  return items.map(cloneEditObject);
}

export class PdfEditHistory {
  private past: PdfEditObject[][] = [];
  private present: PdfEditObject[];
  private future: PdfEditObject[][] = [];

  constructor(initial: readonly PdfEditObject[] = []) {
    this.present = cloneEditObjects(initial);
  }

  get value(): PdfEditObject[] {
    return cloneEditObjects(this.present);
  }

  get canUndo(): boolean {
    return this.past.length > 0;
  }

  get canRedo(): boolean {
    return this.future.length > 0;
  }

  commit(next: readonly PdfEditObject[]): PdfEditObject[] {
    this.past.push(cloneEditObjects(this.present));
    this.present = cloneEditObjects(next);
    this.future = [];
    return this.value;
  }

  undo(): PdfEditObject[] {
    const previous = this.past.pop();
    if (!previous) return this.value;
    this.future.push(cloneEditObjects(this.present));
    this.present = previous;
    return this.value;
  }

  redo(): PdfEditObject[] {
    const next = this.future.pop();
    if (!next) return this.value;
    this.past.push(cloneEditObjects(this.present));
    this.present = next;
    return this.value;
  }

  reset(next: readonly PdfEditObject[] = []): PdfEditObject[] {
    this.past = [];
    this.present = cloneEditObjects(next);
    this.future = [];
    return this.value;
  }
}

export function applyViewportTransform(transform: PdfViewportTransform, point: PdfPoint): PdfPoint {
  const [a, b, c, d, e, f] = transform;
  return {
    x: a * point.x + c * point.y + e,
    y: b * point.x + d * point.y + f,
  };
}

export function invertViewportTransform(transform: PdfViewportTransform): PdfViewportTransform {
  const [a, b, c, d, e, f] = transform;
  const determinant = a * d - b * c;
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) {
    throw new FileToolError('malformed', 'The PDF page viewport transform is not invertible.');
  }
  return [
    d / determinant,
    -b / determinant,
    -c / determinant,
    a / determinant,
    (c * f - d * e) / determinant,
    (b * e - a * f) / determinant,
  ];
}

export function viewportPointToPdf(transform: PdfViewportTransform, point: PdfPoint): PdfPoint {
  return applyViewportTransform(invertViewportTransform(transform), point);
}

export function viewportDeltaToPdfDelta(transform: PdfViewportTransform, delta: PdfPoint): PdfPoint {
  const inverse = invertViewportTransform(transform);
  const origin = applyViewportTransform(inverse, { x: 0, y: 0 });
  const moved = applyViewportTransform(inverse, delta);
  return { x: moved.x - origin.x, y: moved.y - origin.y };
}

export function pdfRectToViewportBox(transform: PdfViewportTransform, item: Pick<PdfEditObject, 'x' | 'y' | 'width' | 'height'>): PdfViewportBox {
  const corners = [
    applyViewportTransform(transform, { x: item.x, y: item.y }),
    applyViewportTransform(transform, { x: item.x + item.width, y: item.y }),
    applyViewportTransform(transform, { x: item.x, y: item.y + item.height }),
    applyViewportTransform(transform, { x: item.x + item.width, y: item.y + item.height }),
  ];
  const xs = corners.map((point) => point.x);
  const ys = corners.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    left,
    top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top,
  };
}

export function clampEditObjectToPage(item: PdfEditObject, bounds: PdfPageBounds): PdfEditObject {
  const minWidth = item.kind === 'check' ? 18 : 32;
  const minHeight = item.kind === 'check' ? 18 : 20;
  const width = Math.min(Math.max(item.width, minWidth), bounds.width);
  const height = Math.min(Math.max(item.height, minHeight), bounds.height);
  return {
    ...item,
    width,
    height,
    x: Math.min(Math.max(item.x, 0), Math.max(0, bounds.width - width)),
    y: Math.min(Math.max(item.y, 0), Math.max(0, bounds.height - height)),
  };
}

export function createPdfEditObject(
  kind: PdfEditKind,
  pageIndex: number,
  bounds: PdfPageBounds,
  id: string,
  options: Partial<Pick<PdfEditObject, 'value' | 'fontSize' | 'strokes' | 'assetId' | 'width' | 'height'>> = {},
): PdfEditObject {
  const defaults: Record<PdfEditKind, { width: number; height: number; fontSize?: number }> = {
    text: { width: 180, height: 32, fontSize: 16 },
    initials: { width: 80, height: 32, fontSize: 16 },
    date: { width: 105, height: 30, fontSize: 14 },
    check: { width: 26, height: 26 },
    'signature-draw': { width: 180, height: 70 },
    'signature-image': { width: 180, height: 70 },
  };
  const shape = defaults[kind];
  const width = options.width ?? shape.width;
  const height = options.height ?? shape.height;
  return clampEditObjectToPage({
    id,
    pageIndex,
    kind,
    width,
    height,
    x: Math.max(0, (bounds.width - width) / 2),
    y: Math.max(0, (bounds.height - height) / 2),
    value: options.value,
    fontSize: options.fontSize ?? shape.fontSize,
    strokes: options.strokes?.map((stroke) => stroke.map(clonePoint)),
    assetId: options.assetId,
  }, bounds);
}

export function validateSignatureImageDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new FileToolError('malformed', 'The signature image dimensions are invalid.');
  }
  assertFileResourceLimit('imagePixels', width * height);
}

export function validatePdfPageCount(pageCount: number): void {
  assertFileResourceLimit('pdfPages', pageCount);
}

function assertNormalizedStrokes(strokes: readonly PdfPoint[][] | undefined): PdfPoint[][] {
  if (!strokes?.length) throw new FileToolError('malformed', 'The drawn signature contains no strokes.');
  return strokes.map((stroke) => {
    if (stroke.length < 2) throw new FileToolError('malformed', 'A drawn signature stroke is incomplete.');
    return stroke.map((point) => {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
        throw new FileToolError('malformed', 'The drawn signature coordinates are invalid.');
      }
      return clonePoint(point);
    });
  });
}

function validateExportObject(item: PdfEditObject, pageCount: number): void {
  if (!Number.isInteger(item.pageIndex) || item.pageIndex < 0 || item.pageIndex >= pageCount) {
    throw new FileToolError('malformed', 'An edit points to a missing PDF page.');
  }
  for (const number of [item.x, item.y, item.width, item.height]) {
    if (!Number.isFinite(number)) throw new FileToolError('malformed', 'An edit contains an invalid coordinate.');
  }
  if (item.width <= 0 || item.height <= 0) throw new FileToolError('malformed', 'An edit has an invalid size.');
  if ((item.kind === 'text' || item.kind === 'initials' || item.kind === 'date') && !item.value?.trim()) {
    throw new FileToolError('malformed', 'A text edit cannot be empty.');
  }
  if (item.kind === 'signature-draw') assertNormalizedStrokes(item.strokes);
  if (item.kind === 'signature-image' && !item.assetId) throw new FileToolError('malformed', 'The signature image is missing.');
}

export async function exportEditedPdf(
  original: ArrayBuffer,
  edits: readonly PdfEditObject[],
  assets: readonly PdfSignatureAsset[],
): Promise<Uint8Array> {
  const { PDFDocument, PDFName, StandardFonts, rgb } = await import('pdf-lib');
  let document: Awaited<ReturnType<typeof PDFDocument.load>>;
  try {
    document = await PDFDocument.load(original, { ignoreEncryption: false, updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/encrypt|password/i.test(message)) {
      throw new FileToolError('malformed', 'Encrypted or password-protected PDFs are not supported.');
    }
    throw new FileToolError('malformed', 'The PDF could not be opened for local editing.');
  }

  const pages = document.getPages();
  validatePdfPageCount(pages.length);
  for (const item of edits) validateExportObject(item, pages.length);

  // Active document-open and additional-action hooks are not needed by the editor.
  // Removing them prevents the exported copy from launching catalog/page scripts.
  document.catalog.delete(PDFName.of('OpenAction'));
  document.catalog.delete(PDFName.of('AA'));
  for (const page of pages) page.node.delete(PDFName.of('AA'));

  const names = document.catalog.get(PDFName.of('Names'));
  if (names && typeof names === 'object' && 'delete' in names && typeof names.delete === 'function') {
    names.delete(PDFName.of('JavaScript'));
  }

  const font = await document.embedFont(StandardFonts.Helvetica);
  const embeddedAssets = new Map<string, Awaited<ReturnType<typeof document.embedPng>> | Awaited<ReturnType<typeof document.embedJpg>>>();
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  for (const item of edits) {
    const page = pages[item.pageIndex];
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const safe = clampEditObjectToPage(item, { width: pageWidth, height: pageHeight });

    if (safe.kind === 'text' || safe.kind === 'initials' || safe.kind === 'date') {
      const fontSize = Math.min(72, Math.max(8, safe.fontSize ?? 16));
      page.drawText(safe.value!.trim(), {
        x: safe.x + 2,
        y: safe.y + Math.max(2, (safe.height - fontSize) / 2),
        size: fontSize,
        font,
        color: rgb(0.08, 0.1, 0.14),
        maxWidth: Math.max(1, safe.width - 4),
      });
      continue;
    }

    if (safe.kind === 'check') {
      const x1 = safe.x + safe.width * 0.16;
      const y1 = safe.y + safe.height * 0.48;
      const x2 = safe.x + safe.width * 0.40;
      const y2 = safe.y + safe.height * 0.22;
      const x3 = safe.x + safe.width * 0.84;
      const y3 = safe.y + safe.height * 0.78;
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 2.2, color: rgb(0.04, 0.35, 0.22) });
      page.drawLine({ start: { x: x2, y: y2 }, end: { x: x3, y: y3 }, thickness: 2.2, color: rgb(0.04, 0.35, 0.22) });
      continue;
    }

    if (safe.kind === 'signature-draw') {
      const strokes = assertNormalizedStrokes(safe.strokes);
      for (const stroke of strokes) {
        for (let index = 1; index < stroke.length; index += 1) {
          const previous = stroke[index - 1];
          const current = stroke[index];
          page.drawLine({
            start: { x: safe.x + previous.x * safe.width, y: safe.y + (1 - previous.y) * safe.height },
            end: { x: safe.x + current.x * safe.width, y: safe.y + (1 - current.y) * safe.height },
            thickness: 1.8,
            color: rgb(0.05, 0.08, 0.15),
          });
        }
      }
      continue;
    }

    const asset = assetById.get(safe.assetId!);
    if (!asset) throw new FileToolError('malformed', 'The signature image data is unavailable.');
    let embedded = embeddedAssets.get(asset.id);
    if (!embedded) {
      try {
        embedded = asset.mime === 'image/png'
          ? await document.embedPng(asset.bytes)
          : await document.embedJpg(asset.bytes);
      } catch {
        throw new FileToolError('malformed', 'The signature image could not be embedded in the PDF.');
      }
      embeddedAssets.set(asset.id, embedded);
    }
    page.drawImage(embedded, { x: safe.x, y: safe.y, width: safe.width, height: safe.height });
  }

  return document.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
}

export function copiedBuffer(buffer: ArrayBuffer): ArrayBuffer {
  return buffer.slice(0);
}

export function pdfInputLimitMessage(device: 'mobile' | 'desktop'): string {
  const bytes = device === 'mobile' ? 25 * 1024 * 1024 : 75 * 1024 * 1024;
  return `PDF limit: ${Math.round(bytes / 1024 / 1024)} MB on ${device}. Up to ${FILE_RESOURCE_LIMITS.pdfPages} pages.`;
}
