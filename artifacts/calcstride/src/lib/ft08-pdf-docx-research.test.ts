import assert from 'node:assert/strict';
import test from 'node:test';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const SENTINEL = 'FigureNest FT-08 editable DOCX reopenability sentinel';
const PDF_LINES = [
  'FigureNest FT-08 selectable PDF first paragraph',
  'Second editable paragraph with punctuation: 10% + (test).',
];
const DOCX_UNICODE = 'Unicode survives DOCX generation: café € ✓';

async function createDocxFromParagraphs(paragraphs: string[]) {
  const document = new Document({
    sections: [
      {
        children: paragraphs.map((text) => new Paragraph(text)),
      },
    ],
  });

  return Packer.toBuffer(document);
}

test('FT-08 candidate generates a reopenable DOCX package without a server converter', async () => {
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: SENTINEL, bold: true })],
          }),
          new Paragraph('Second editable paragraph'),
          new Paragraph(DOCX_UNICODE),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(document);

  assert.ok(buffer.byteLength > 0);
  assert.equal(buffer[0], 0x50, 'DOCX must be a ZIP/OOXML package');
  assert.equal(buffer[1], 0x4b, 'DOCX must be a ZIP/OOXML package');

  const reopened = await mammoth.extractRawText({ buffer });
  assert.match(reopened.value, new RegExp(SENTINEL));
  assert.match(reopened.value, /Second editable paragraph/);
  assert.match(reopened.value, new RegExp(DOCX_UNICODE));
});

test('FT-08 text-first spike carries selectable PDF text into a reopenable editable DOCX in deterministic order', async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([612, 792]);

  page.drawText(PDF_LINES[0], { x: 72, y: 700, size: 12, font });
  page.drawText(PDF_LINES[1], { x: 72, y: 660, size: 12, font });

  const pdfBytes = await pdf.save();
  const loadingTask = getDocument({ data: pdfBytes });
  const parsedPdf = await loadingTask.promise;

  try {
    assert.equal(parsedPdf.numPages, 1);
    const parsedPage = await parsedPdf.getPage(1);
    const textContent = await parsedPage.getTextContent();
    const extracted = textContent.items
      .filter((item): item is Extract<(typeof textContent.items)[number], { str: string }> => 'str' in item)
      .map((item) => item.str.trim())
      .filter(Boolean);

    assert.deepEqual(extracted, PDF_LINES, 'ordinary selectable text must retain deterministic content order');

    const docxBuffer = await createDocxFromParagraphs(extracted);
    assert.ok(docxBuffer.byteLength > 0);
    assert.equal(docxBuffer[0], 0x50);
    assert.equal(docxBuffer[1], 0x4b);

    const reopened = await mammoth.extractRawText({ buffer: docxBuffer });
    const normalized = reopened.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    assert.deepEqual(normalized, PDF_LINES, 'reopened DOCX must preserve the extracted paragraph order');
  } finally {
    await loadingTask.destroy();
  }
});
