import {
  FILE_RESOURCE_LIMITS,
  FileToolError,
  clearArrayBuffer,
  loadValidatedLocalFile,
  type FileDeviceClass,
} from '@/lib/file-tools-foundation';
import { PDF_FILE_RULE, copiedBuffer } from '@/lib/pdf-sign-edit-core';

export type PositionedPdfText = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEol?: boolean;
};

export type PdfToDocxResult = {
  blob: Blob;
  pageCount: number;
  paragraphCount: number;
  warnings: readonly string[];
};

type PdfJsTextItem = {
  str?: string;
  transform?: readonly number[];
  width?: number;
  height?: number;
  hasEOL?: boolean;
};

type PdfJsOperatorList = { fnArray: readonly number[] };
type PdfJsPage = {
  getTextContent(): Promise<{ items: PdfJsTextItem[] }>;
  getOperatorList(): Promise<PdfJsOperatorList>;
  cleanup(): void;
};
type PdfJsDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfJsPage>;
};
type PdfJsLoadingTask = { promise: Promise<PdfJsDocument>; destroy(): Promise<void> };

const LINE_TOLERANCE = 4;

export const PDF_TO_DOCX_WARNINGS = {
  layout: 'PDF text is reconstructed on a best-effort basis. Columns, tables, fonts and exact pagination may differ from the original PDF.',
  images: 'This PDF contains raster imagery. Selectable text is preserved, but image placement is not preserved in this version.',
} as const;

function abortError(): FileToolError {
  return new FileToolError('cancelled', 'PDF to DOCX conversion was cancelled.');
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw abortError();
}

export function positionedTextFromPdfItems(items: readonly PdfJsTextItem[]): PositionedPdfText[] {
  return items.flatMap((item) => {
    const text = item.str?.trim();
    const transform = item.transform;
    if (!text || !transform || transform.length < 6) return [];
    return [{
      text,
      x: Number(transform[4]) || 0,
      y: Number(transform[5]) || 0,
      width: Math.max(0, Number(item.width) || 0),
      height: Math.max(0, Number(item.height) || 0),
      hasEol: Boolean(item.hasEOL),
    }];
  });
}

/**
 * PDF text is positioned drawing content, not semantic paragraphs. Group nearby
 * y coordinates into deterministic visual lines, then order each line left to
 * right. This is intentionally conservative: it produces useful editable text
 * without claiming exact column/table reconstruction.
 */
export function reconstructPdfTextLines(items: readonly PositionedPdfText[], rowTolerance = LINE_TOLERANCE): string[] {
  const rows: PositionedPdfText[][] = [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);

  for (const item of sorted) {
    const row = rows.find((candidate) => Math.abs(candidate[0].y - item.y) <= rowTolerance);
    if (row) row.push(item);
    else rows.push([item]);
  }

  return rows
    .map((row) => row.sort((a, b) => a.x - b.x).map((item) => item.text).join(' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export function pdfToDocxOutputName(fileName: string): string {
  const trimmed = fileName.trim().replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').trim();
  return `${trimmed || 'document'}.docx`;
}

function mapPdfError(error: unknown): Error {
  if (error instanceof FileToolError) return error;
  const name = typeof error === 'object' && error && 'name' in error ? String((error as { name?: unknown }).name ?? '') : '';
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (name === 'PasswordException' || /password|encrypted/i.test(`${name} ${message}`)) {
    return new FileToolError('malformed', 'Password-protected or encrypted PDFs are not supported. Unlock the PDF locally first, then try again.');
  }
  return new FileToolError('malformed', 'The PDF is malformed, unsupported, or could not be read safely in this browser.');
}

export async function convertPdfTextToDocx(
  file: File,
  deviceClass: FileDeviceClass,
  signal?: AbortSignal,
): Promise<PdfToDocxResult> {
  throwIfAborted(signal);
  let inputBuffer: ArrayBuffer | null = null;
  let task: PdfJsLoadingTask | null = null;
  let parsed: PdfJsDocument | null = null;

  try {
    const local = await loadValidatedLocalFile(file, [PDF_FILE_RULE], deviceClass, signal);
    inputBuffer = local.buffer;
    throwIfAborted(signal);

    const [{ getDocument, GlobalWorkerOptions, OPS }, workerModule, docx] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
      import('docx'),
    ]);
    GlobalWorkerOptions.workerSrc = workerModule.default;

    task = getDocument({
      data: new Uint8Array(copiedBuffer(inputBuffer)),
      useWorkerFetch: false,
      disableAutoFetch: true,
      disableStream: true,
    }) as unknown as PdfJsLoadingTask;
    parsed = await task.promise;
    throwIfAborted(signal);

    if (!Number.isInteger(parsed.numPages) || parsed.numPages < 1) {
      throw new FileToolError('malformed', 'The PDF does not contain a readable page.');
    }
    if (parsed.numPages > FILE_RESOURCE_LIMITS.pdfPages) {
      throw new FileToolError('resource-limit', `PDF to DOCX supports up to ${FILE_RESOURCE_LIMITS.pdfPages} pages per file.`);
    }

    const paragraphs: string[] = [];
    let hasRasterImages = false;

    for (let pageNumber = 1; pageNumber <= parsed.numPages; pageNumber += 1) {
      throwIfAborted(signal);
      const page = await parsed.getPage(pageNumber);
      try {
        const [content, operators] = await Promise.all([page.getTextContent(), page.getOperatorList()]);
        const positioned = positionedTextFromPdfItems(content.items);
        const lines = reconstructPdfTextLines(positioned);
        if (lines.length) {
          if (paragraphs.length) paragraphs.push('');
          paragraphs.push(...lines);
        }
        if (operators.fnArray.some((operator) =>
          operator === OPS.paintImageXObject
          || operator === OPS.paintInlineImageXObject
          || operator === OPS.paintImageMaskXObject
        )) hasRasterImages = true;
      } finally {
        page.cleanup();
      }
    }

    if (!paragraphs.some((paragraph) => paragraph.trim())) {
      throw new FileToolError('malformed', 'No selectable text was found. This PDF appears to need OCR, which this browser-only tool does not perform.');
    }

    throwIfAborted(signal);
    const children = paragraphs.map((text) => new docx.Paragraph(text));
    const output = new docx.Document({ sections: [{ children }] });
    const blob = await docx.Packer.toBlob(output);
    throwIfAborted(signal);

    return {
      blob,
      pageCount: parsed.numPages,
      paragraphCount: paragraphs.filter(Boolean).length,
      warnings: [PDF_TO_DOCX_WARNINGS.layout, ...(hasRasterImages ? [PDF_TO_DOCX_WARNINGS.images] : [])],
    };
  } catch (error) {
    if (signal?.aborted) throw abortError();
    throw mapPdfError(error);
  } finally {
    if (task) await task.destroy().catch(() => undefined);
    if (inputBuffer) clearArrayBuffer(inputBuffer);
  }
}
