import assert from 'node:assert/strict';
import test from 'node:test';
import { preflightXlsxZip, type XlsxZipLimits } from './xlsx-zip-preflight';

type EntrySpec = {
  compressed: number;
  uncompressed: number;
  flags?: number;
  method?: number;
  name?: string;
};

function buildCentralDirectoryZip(entries: EntrySpec[]): Uint8Array {
  const encoder = new TextEncoder();
  const centralParts: Uint8Array[] = [];
  let centralSize = 0;

  for (const [index, entry] of entries.entries()) {
    const name = encoder.encode(entry.name ?? `xl/worksheets/sheet${index + 1}.xml`);
    const part = new Uint8Array(46 + name.length);
    const view = new DataView(part.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, entry.flags ?? 0, true);
    view.setUint16(10, entry.method ?? 8, true);
    view.setUint32(20, entry.compressed, true);
    view.setUint32(24, entry.uncompressed, true);
    view.setUint16(28, name.length, true);
    view.setUint32(42, 0, true);
    part.set(name, 46);
    centralParts.push(part);
    centralSize += part.length;
  }

  const output = new Uint8Array(centralSize + 22);
  let offset = 0;
  for (const part of centralParts) {
    output.set(part, offset);
    offset += part.length;
  }

  const eocd = new DataView(output.buffer, centralSize, 22);
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, 0, true);
  return output;
}

const roomyLimits: XlsxZipLimits = {
  maxEntries: 10,
  maxCompressedBytes: 2_000_000,
  maxUncompressedBytes: 10_000_000,
  maxEntryUncompressedBytes: 8_000_000,
  maxCompressionRatio: 100,
};

test('accepts bounded ordinary OOXML-style central directory metadata without inflating entries', () => {
  const bytes = buildCentralDirectoryZip([
    { compressed: 800, uncompressed: 2_400 },
    { compressed: 500, uncompressed: 1_000, name: 'xl/sharedStrings.xml' },
  ]);
  const result = preflightXlsxZip(bytes, roomyLimits);
  assert.deepEqual(result, { ok: true, entries: 2, compressedBytes: 1_300, uncompressedBytes: 3_400 });
});

test('rejects high compression-ratio entries before a workbook parser can inflate them', () => {
  const bytes = buildCentralDirectoryZip([{ compressed: 100, uncompressed: 50_000 }]);
  const result = preflightXlsxZip(bytes, { ...roomyLimits, maxCompressionRatio: 100 });
  assert.deepEqual(result, { ok: false, reason: 'compression-ratio-limit' });
});

test('rejects aggregate uncompressed bytes even when each entry is individually acceptable', () => {
  const bytes = buildCentralDirectoryZip([
    { compressed: 2_000, uncompressed: 5_000 },
    { compressed: 2_000, uncompressed: 5_000 },
  ]);
  const result = preflightXlsxZip(bytes, { ...roomyLimits, maxUncompressedBytes: 9_000 });
  assert.deepEqual(result, { ok: false, reason: 'uncompressed-content-limit' });
});

test('rejects encrypted, unsupported-compression and over-count archives fail closed', () => {
  assert.deepEqual(
    preflightXlsxZip(buildCentralDirectoryZip([{ compressed: 100, uncompressed: 100, flags: 1 }]), roomyLimits),
    { ok: false, reason: 'encrypted-entry-unsupported' },
  );
  assert.deepEqual(
    preflightXlsxZip(buildCentralDirectoryZip([{ compressed: 100, uncompressed: 100, method: 12 }]), roomyLimits),
    { ok: false, reason: 'compression-method-unsupported' },
  );
  assert.deepEqual(
    preflightXlsxZip(buildCentralDirectoryZip([
      { compressed: 100, uncompressed: 100 },
      { compressed: 100, uncompressed: 100 },
    ]), { ...roomyLimits, maxEntries: 1 }),
    { ok: false, reason: 'entry-count-limit' },
  );
});

test('rejects truncated or non-ZIP input instead of passing partial metadata onward', () => {
  assert.deepEqual(preflightXlsxZip(new Uint8Array([1, 2, 3]), roomyLimits), { ok: false, reason: 'zip-too-small' });
  const broken = buildCentralDirectoryZip([{ compressed: 100, uncompressed: 100 }]).slice(0, -5);
  assert.equal(preflightXlsxZip(broken, roomyLimits).ok, false);
});
