import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

type PdfPreflightResult =
  | { status: 'accepted'; pages: number }
  | { status: 'malformed-or-unsupported' }
  | { status: 'resource-limit'; reason: 'bytes' | 'pages' };

const DEFAULT_LIMITS = {
  maxBytes: 20 * 1024 * 1024,
  maxPages: 200,
};

async function preflightPdfLocally(
  pdfBytes: Uint8Array,
  limits = DEFAULT_LIMITS,
): Promise<PdfPreflightResult> {
  // The byte ceiling must be enforced before PDF.js sees attacker-controlled
  // input so a limit-adjacent file cannot allocate parser state first.
  if (pdfBytes.byteLength > limits.maxBytes) {
    return { status: 'resource-limit', reason: 'bytes' };
  }

  const loadingTask = getDocument({ data: pdfBytes });

  try {
    const parsedPdf = await loadingTask.promise;
    if (parsedPdf.numPages > limits.maxPages) {
      return { status: 'resource-limit', reason: 'pages' };
    }

    return { status: 'accepted', pages: parsedPdf.numPages };
  } catch {
    // Do not expose parser internals or turn malformed/encrypted input into a
    // partially generated DOCX. Password-specific UX remains a later fixture.
    return { status: 'malformed-or-unsupported' };
  } finally {
    await loadingTask.destroy();
  }
}

test('FT-08 rejects oversized PDF bytes before invoking PDF.js', async () => {
  const oversized = new Uint8Array(33);

  assert.deepEqual(
    await preflightPdfLocally(oversized, { maxBytes: 32, maxPages: 10 }),
    { status: 'resource-limit', reason: 'bytes' },
  );
});

test('FT-08 fails closed for malformed/truncated PDF input', async () => {
  const truncatedPdf = new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<< /Type /Catalog');

  assert.deepEqual(await preflightPdfLocally(truncatedPdf), {
    status: 'malformed-or-unsupported',
  });
});

test('FT-08 rejects a parseable PDF above the page ceiling before extraction or DOCX generation', async () => {
  const pdf = await PDFDocument.create();
  for (let page = 0; page < 6; page += 1) pdf.addPage([612, 792]);

  assert.deepEqual(
    await preflightPdfLocally(await pdf.save(), { maxBytes: 1024 * 1024, maxPages: 5 }),
    { status: 'resource-limit', reason: 'pages' },
  );
});

test('FT-08 accepts an ordinary in-limit PDF and records its page count', async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  pdf.addPage([612, 792]);

  assert.deepEqual(
    await preflightPdfLocally(await pdf.save(), { maxBytes: 1024 * 1024, maxPages: 5 }),
    { status: 'accepted', pages: 2 },
  );
});
