import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { FileToolError } from './file-tools-foundation';
import {
  A4_PORTRAIT_HEIGHT,
  A4_PORTRAIT_WIDTH,
  IMAGE_TO_PDF_RULES,
  buildImagePdf,
  imagePdfLayout,
  validateImagePdfSource,
  type ImagePdfSource,
} from './image-to-pdf-core';

const ONE_PIXEL_PNG = new Uint8Array(Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z5ZkAAAAASUVORK5CYII=',
  'base64',
));

function pngSource(id: string, width: number, height: number): ImagePdfSource {
  return { id, mime: 'image/png', bytes: ONE_PIXEL_PNG.slice(), width, height };
}

test('FT-05 image rules require PNG/JPEG signatures rather than filename alone', () => {
  assert.deepEqual(IMAGE_TO_PDF_RULES.map((rule) => rule.id), ['png', 'jpeg']);
  assert.deepEqual(IMAGE_TO_PDF_RULES[0].magicBytes?.[0].bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.deepEqual(IMAGE_TO_PDF_RULES[1].magicBytes?.[0].bytes, [0xff, 0xd8, 0xff]);
});

test('FT-05 fit-image pages preserve image aspect and cap extreme PDF page dimensions', () => {
  assert.deepEqual(imagePdfLayout({ width: 1200, height: 800 }, 'image'), {
    pageWidth: 1200, pageHeight: 800, x: 0, y: 0, width: 1200, height: 800,
  });
  const huge = imagePdfLayout({ width: 20_000, height: 10_000 }, 'image');
  assert.equal(huge.pageWidth, 14_400);
  assert.equal(huge.pageHeight, 7_200);
});

test('FT-05 A4 auto chooses orientation and contains image inside the page', () => {
  const portrait = imagePdfLayout({ width: 1000, height: 2000 }, 'a4-auto');
  assert.equal(portrait.pageWidth, A4_PORTRAIT_WIDTH);
  assert.equal(portrait.pageHeight, A4_PORTRAIT_HEIGHT);
  assert.ok(portrait.width <= portrait.pageWidth);
  assert.ok(portrait.height <= portrait.pageHeight);

  const landscape = imagePdfLayout({ width: 2000, height: 1000 }, 'a4-auto');
  assert.equal(landscape.pageWidth, A4_PORTRAIT_HEIGHT);
  assert.equal(landscape.pageHeight, A4_PORTRAIT_WIDTH);
});

test('FT-05 validates decoded pixel and format resource guards', () => {
  assert.doesNotThrow(() => validateImagePdfSource(pngSource('ok', 4000, 4000)));
  assert.throws(
    () => validateImagePdfSource(pngSource('too-big', 8000, 6000)),
    (error: unknown) => error instanceof FileToolError && error.code === 'resource-limit',
  );
  assert.throws(
    () => validateImagePdfSource({ ...pngSource('gif', 100, 100), mime: 'image/gif' as 'image/png' }),
    (error: unknown) => error instanceof FileToolError && error.code === 'unsupported-type',
  );
});

test('FT-05 exports images in exact input order to a reopenable PDF', async () => {
  const output = await buildImagePdf([
    pngSource('portrait-first', 100, 200),
    pngSource('landscape-second', 300, 100),
  ], 'image');
  const reopened = await PDFDocument.load(output);
  assert.equal(reopened.getPageCount(), 2);
  assert.equal(reopened.getPage(0).getWidth(), 100);
  assert.equal(reopened.getPage(0).getHeight(), 200);
  assert.equal(reopened.getPage(1).getWidth(), 300);
  assert.equal(reopened.getPage(1).getHeight(), 100);
});

test('FT-05 cancellation stops PDF creation without returning partial output', async () => {
  let checks = 0;
  await assert.rejects(
    buildImagePdf([pngSource('one', 100, 100), pngSource('two', 100, 100)], 'image', () => ++checks > 1),
    (error: unknown) => error instanceof FileToolError && error.code === 'cancelled',
  );
});

test('FT-05 conversion core has no network, persistence or runtime CDN calls', () => {
  const source = readFileSync(new URL('./image-to-pdf-core.ts', import.meta.url), 'utf8');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'caches.', 'https://', 'http://']) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.match(source, /await import\('pdf-lib'\)/);
});
