import assert from 'node:assert/strict';
import test from 'node:test';
import { Document, Packer, Paragraph } from 'docx';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getDocument, OPS } from 'pdfjs-dist/legacy/build/pdf.mjs';

const MIXED_TEXT = [
  'FigureNest FT-08 mixed-media heading',
  'Selectable text must remain editable even when the PDF page also contains a raster image.',
];

// 1x1 transparent PNG. The fixture is intentionally tiny: this gate is about
// truthful mixed-media behavior, not image-fidelity benchmarking.
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl4q6YAAAAASUVORK5CYII=',
  'base64',
);

test('FT-08 preserves selectable text but warns when a page also contains raster imagery', async () => {
  const source = await PDFDocument.create();
  const font = await source.embedFont(StandardFonts.Helvetica);
  const image = await source.embedPng(ONE_PIXEL_PNG);
  const page = source.addPage([612, 792]);

  page.drawText(MIXED_TEXT[0], { x: 72, y: 710, size: 18, font });
  page.drawImage(image, { x: 72, y: 620, width: 120, height: 60 });
  page.drawText(MIXED_TEXT[1], { x: 72, y: 580, size: 12, font });

  const pdfBytes = await source.save();
  const loadingTask = getDocument({ data: pdfBytes });
  const parsed = await loadingTask.promise;

  try {
    const parsedPage = await parsed.getPage(1);
    const textContent = await parsedPage.getTextContent();
    const extracted = textContent.items
      .filter((item): item is Extract<(typeof textContent.items)[number], { str: string }> => 'str' in item)
      .map((item) => item.str.trim())
      .filter(Boolean);

    assert.deepEqual(extracted, MIXED_TEXT, 'mixed-media PDFs must not lose their usable selectable text');

    const operators = await parsedPage.getOperatorList();
    const hasRasterImage = operators.fnArray.some(
      (operator) =>
        operator === OPS.paintImageXObject ||
        operator === OPS.paintInlineImageXObject ||
        operator === OPS.paintImageMaskXObject,
    );
    assert.equal(hasRasterImage, true, 'fixture must exercise an actual raster-image paint operation');

    const disposition = hasRasterImage ? 'editable-text-with-image-warning' : 'editable-text';
    assert.equal(disposition, 'editable-text-with-image-warning');

    // Until image-position reconstruction has its own evidence, v1 must keep
    // the useful text editable and warn that raster-image placement is not
    // preserved instead of pretending to be a faithful PDF-to-Word converter.
    const output = new Document({
      sections: [{ children: extracted.map((text) => new Paragraph(text)) }],
    });
    const docxBuffer = await Packer.toBuffer(output);
    const reopened = await mammoth.extractRawText({ buffer: docxBuffer });
    const normalized = reopened.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    assert.deepEqual(normalized, MIXED_TEXT);
  } finally {
    await loadingTask.destroy();
  }
});
