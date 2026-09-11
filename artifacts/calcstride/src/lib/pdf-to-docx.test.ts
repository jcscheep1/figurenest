import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { Document, Packer, Paragraph } from 'docx';
import {
  pdfToDocxOutputName,
  positionedTextFromPdfItems,
  reconstructPdfTextLines,
} from './pdf-to-docx';

test('FT-08 reconstructs visual rows deterministically instead of trusting content-stream order', async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([612, 792]);

  page.drawText('Qty', { x: 260, y: 700, size: 12, font });
  page.drawText('Item', { x: 72, y: 700, size: 12, font });
  page.drawText('2', { x: 260, y: 670, size: 12, font });
  page.drawText('Bolts', { x: 72, y: 670, size: 12, font });

  const loadingTask = getDocument({ data: await pdf.save() });
  const parsed = await loadingTask.promise;
  try {
    const content = await (await parsed.getPage(1)).getTextContent();
    const positioned = positionedTextFromPdfItems(content.items);
    assert.deepEqual(reconstructPdfTextLines(positioned), ['Item Qty', 'Bolts 2']);
  } finally {
    await loadingTask.destroy();
  }
});

test('FT-08 reconstructed lines produce independently reopenable editable DOCX text', async () => {
  const lines = reconstructPdfTextLines([
    { text: 'FigureNest editable heading', x: 72, y: 700, width: 160, height: 12 },
    { text: 'Second paragraph', x: 72, y: 670, width: 110, height: 12 },
  ]);
  const output = new Document({ sections: [{ children: lines.map((line) => new Paragraph(line)) }] });
  const buffer = await Packer.toBuffer(output);
  const reopened = await mammoth.extractRawText({ buffer });
  assert.deepEqual(
    reopened.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    ['FigureNest editable heading', 'Second paragraph'],
  );
});

test('FT-08 output filename is deterministic and strips unsafe path punctuation', () => {
  assert.equal(pdfToDocxOutputName('Quarterly Report.pdf'), 'Quarterly Report.docx');
  assert.equal(pdfToDocxOutputName('../bad:name?.PDF'), '..-bad-name-.docx');
  assert.equal(pdfToDocxOutputName('   '), 'document.docx');
});
