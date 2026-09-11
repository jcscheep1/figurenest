import {
  FILE_RESOURCE_LIMITS,
  FileToolError,
  assertFileResourceLimit,
  type FileTypeRule,
} from './file-tools-foundation';

export const IMAGE_TO_PDF_RULES: readonly FileTypeRule[] = [
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

export type ImagePdfMime = 'image/png' | 'image/jpeg';
export type ImagePdfPageMode = 'image' | 'a4-auto';

export type ImagePdfSource = {
  id: string;
  mime: ImagePdfMime;
  bytes: Uint8Array;
  width: number;
  height: number;
};

export type ImagePdfLayout = {
  pageWidth: number;
  pageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const A4_PORTRAIT_WIDTH = 595.28;
export const A4_PORTRAIT_HEIGHT = 841.89;
export const IMAGE_PDF_MARGIN = 24;
const MAX_PDF_PAGE_POINTS = 14_400;

export function validateImagePdfSource(source: ImagePdfSource): void {
  if (!source.id.trim()) throw new FileToolError('malformed', 'An image identifier is missing.');
  if (source.mime !== 'image/png' && source.mime !== 'image/jpeg') {
    throw new FileToolError('unsupported-type', 'Only PNG and JPEG images can be added to this PDF.');
  }
  if (!(source.bytes instanceof Uint8Array) || source.bytes.byteLength === 0) {
    throw new FileToolError('empty-file', 'An image contains no readable bytes.');
  }
  if (!Number.isInteger(source.width) || !Number.isInteger(source.height) || source.width < 1 || source.height < 1) {
    throw new FileToolError('malformed', 'An image has invalid decoded dimensions.');
  }
  assertFileResourceLimit('imagePixels', source.width * source.height);
}

export function imagePdfLayout(source: Pick<ImagePdfSource, 'width' | 'height'>, mode: ImagePdfPageMode): ImagePdfLayout {
  if (!Number.isFinite(source.width) || !Number.isFinite(source.height) || source.width <= 0 || source.height <= 0) {
    throw new FileToolError('malformed', 'An image has invalid dimensions.');
  }

  if (mode === 'image') {
    const scale = Math.min(1, MAX_PDF_PAGE_POINTS / Math.max(source.width, source.height));
    return {
      pageWidth: source.width * scale,
      pageHeight: source.height * scale,
      x: 0,
      y: 0,
      width: source.width * scale,
      height: source.height * scale,
    };
  }

  if (mode !== 'a4-auto') throw new FileToolError('malformed', 'The PDF page-size option is invalid.');
  const landscape = source.width > source.height;
  const pageWidth = landscape ? A4_PORTRAIT_HEIGHT : A4_PORTRAIT_WIDTH;
  const pageHeight = landscape ? A4_PORTRAIT_WIDTH : A4_PORTRAIT_HEIGHT;
  const availableWidth = pageWidth - IMAGE_PDF_MARGIN * 2;
  const availableHeight = pageHeight - IMAGE_PDF_MARGIN * 2;
  const scale = Math.min(availableWidth / source.width, availableHeight / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  return {
    pageWidth,
    pageHeight,
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  };
}

export async function buildImagePdf(
  sources: readonly ImagePdfSource[],
  pageMode: ImagePdfPageMode,
  isCancelled: () => boolean = () => false,
): Promise<Uint8Array> {
  if (sources.length < 1) throw new FileToolError('empty-file', 'Add at least one image before creating the PDF.');
  assertFileResourceLimit('pdfPages', sources.length);
  sources.forEach(validateImagePdfSource);

  const { PDFDocument } = await import('pdf-lib');
  const document = await PDFDocument.create();

  for (const source of sources) {
    if (isCancelled()) throw new FileToolError('cancelled', 'PDF creation was cancelled.');
    let embedded;
    try {
      embedded = source.mime === 'image/png'
        ? await document.embedPng(source.bytes)
        : await document.embedJpg(source.bytes);
    } catch {
      throw new FileToolError('malformed', 'One of the selected images could not be embedded in the PDF.');
    }
    const layout = imagePdfLayout(source, pageMode);
    const page = document.addPage([layout.pageWidth, layout.pageHeight]);
    page.drawImage(embedded, {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    });
  }

  if (isCancelled()) throw new FileToolError('cancelled', 'PDF creation was cancelled.');
  return document.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
}

export function imageToPdfLimitMessage(): string {
  return `Up to ${FILE_RESOURCE_LIMITS.pdfPages} images · ${Math.round(FILE_RESOURCE_LIMITS.imagePixels / 1_000_000)} megapixels per decoded image.`;
}
