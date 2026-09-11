import assert from 'node:assert/strict';
import test from 'node:test';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';

const SENTINEL = 'FigureNest FT-08 editable DOCX reopenability sentinel';

test('FT-08 candidate generates a reopenable DOCX package without a server converter', async () => {
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: SENTINEL, bold: true })],
          }),
          new Paragraph('Second editable paragraph'),
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
});
