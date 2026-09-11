import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

type PositionedText = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

async function extractPositionedText(pdfBytes: Uint8Array): Promise<PositionedText[]> {
  const loadingTask = getDocument({ data: pdfBytes });
  const parsedPdf = await loadingTask.promise;

  try {
    const page = await parsedPdf.getPage(1);
    const content = await page.getTextContent();

    return content.items
      .filter(
        (item): item is Extract<(typeof content.items)[number], { str: string }> =>
          'str' in item && item.str.trim().length > 0,
      )
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
      }));
  } finally {
    await loadingTask.destroy();
  }
}

function orderTwoColumns(items: PositionedText[], splitX: number): string[] {
  const topToBottom = (a: PositionedText, b: PositionedText) => b.y - a.y || a.x - b.x;
  const left = items.filter((item) => item.x < splitX).sort(topToBottom);
  const right = items.filter((item) => item.x >= splitX).sort(topToBottom);
  return [...left, ...right].map((item) => item.text);
}

function orderTableRows(items: PositionedText[], rowTolerance = 4): string[][] {
  const rows: PositionedText[][] = [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);

  for (const item of sorted) {
    const row = rows.find((candidate) => Math.abs(candidate[0].y - item.y) <= rowTolerance);
    if (row) row.push(item);
    else rows.push([item]);
  }

  return rows.map((row) => row.sort((a, b) => a.x - b.x).map((item) => item.text));
}

test('FT-08 reconstructs deterministic column-first reading order from PDF coordinates', async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([612, 792]);

  // Deliberately interleave the content stream row-by-row. A converter that
  // trusts PDF.js item emission order would read across columns instead of
  // finishing the left column first.
  page.drawText('Left column one', { x: 72, y: 700, size: 12, font });
  page.drawText('Right column one', { x: 330, y: 700, size: 12, font });
  page.drawText('Left column two', { x: 72, y: 670, size: 12, font });
  page.drawText('Right column two', { x: 330, y: 670, size: 12, font });

  const items = await extractPositionedText(await pdf.save());
  assert.deepEqual(
    orderTwoColumns(items, 300),
    ['Left column one', 'Left column two', 'Right column one', 'Right column two'],
    'two-column PDFs need coordinate-aware reconstruction rather than raw content-stream order',
  );
});

test('FT-08 reconstructs a simple table as deterministic row-major cells from PDF coordinates', async () => {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([612, 792]);

  // Insert cells out of reading order to prove geometry, not stream order,
  // controls the recovered table structure.
  page.drawText('Qty', { x: 260, y: 700, size: 12, font });
  page.drawText('Item', { x: 72, y: 700, size: 12, font });
  page.drawText('2', { x: 260, y: 670, size: 12, font });
  page.drawText('Bolts', { x: 72, y: 670, size: 12, font });
  page.drawText('4', { x: 260, y: 640, size: 12, font });
  page.drawText('Washers', { x: 72, y: 640, size: 12, font });

  const items = await extractPositionedText(await pdf.save());
  assert.deepEqual(
    orderTableRows(items),
    [
      ['Item', 'Qty'],
      ['Bolts', '2'],
      ['Washers', '4'],
    ],
    'simple tables need row clustering plus left-to-right cell ordering',
  );
});
