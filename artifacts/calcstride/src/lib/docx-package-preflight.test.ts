import assert from 'node:assert/strict';
import test from 'node:test';
import { FileToolError } from './file-tools-foundation';
import { DOCX_PACKAGE_LIMITS, preflightDocxPackage } from './docx-package-preflight';

type SyntheticEntry = {
  name: string;
  compressedBytes?: number;
  uncompressedBytes?: number;
  method?: 0 | 8;
  flags?: number;
};

function u16(value: number): Buffer {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value >>> 0);
  return buffer;
}

function u32(value: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function syntheticZip(entries: readonly SyntheticEntry[]): Uint8Array {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const compressedBytes = entry.compressedBytes ?? 1;
    const uncompressedBytes = entry.uncompressedBytes ?? compressedBytes;
    const method = entry.method ?? 0;
    const flags = entry.flags ?? 0x0800;
    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(flags), u16(method), u16(0), u16(0), u32(0),
      u32(compressedBytes), u32(uncompressedBytes), u16(name.length), u16(0), name,
    ]);
    local.push(localHeader);

    central.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(flags), u16(method), u16(0), u16(0), u32(0),
      u32(compressedBytes), u32(uncompressedBytes), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(localOffset), name,
    ]));
    localOffset += localHeader.length;
  }

  const localBytes = Buffer.concat(local);
  const centralBytes = Buffer.concat(central);
  const eocd = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralBytes.length), u32(localBytes.length), u16(0),
  ]);
  return new Uint8Array(Buffer.concat([localBytes, centralBytes, eocd]));
}

function baseEntries(extra: readonly SyntheticEntry[] = []): SyntheticEntry[] {
  return [
    { name: '[Content_Types].xml' },
    { name: '_rels/.rels' },
    { name: 'word/document.xml' },
    { name: 'word/_rels/document.xml.rels' },
    ...extra,
  ];
}

function hasCode(code: string) {
  return (error: unknown) => error instanceof FileToolError && error.code === code;
}

test('FT-07 accepts a bounded ordinary DOCX ZIP package', () => {
  const result = preflightDocxPackage(syntheticZip(baseEntries([
    { name: 'word/media/image1.png', compressedBytes: 200, uncompressedBytes: 500 },
  ])), 'desktop');
  assert.equal(result.entries.length, 5);
  assert.equal(result.entries.some((entry) => entry.name === 'word/document.xml'), true);
  assert.equal(result.totalUncompressedBytes, 504);
});

test('FT-07 rejects generic ZIPs that are not DOCX packages', () => {
  assert.throws(
    () => preflightDocxPackage(syntheticZip([{ name: 'notes.txt' }]), 'desktop'),
    hasCode('unsupported-type'),
  );
});

test('FT-07 rejects path traversal, encryption and unsupported compression', () => {
  assert.throws(
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: '../escape.xml' }])), 'desktop'),
    hasCode('malformed'),
  );
  assert.throws(
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: 'word/secret.xml', flags: 0x0801 }])), 'desktop'),
    hasCode('unsupported-type'),
  );
  assert.throws(
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: 'word/odd.bin', method: 8 as 0 | 8 }])).map((value, index, all) => {
      // Replace the first optional payload central-directory method with unsupported method 99.
      if (index > all.length - 22 - 46 && index < all.length - 22) return value;
      return value;
    }), 'desktop'),
    () => false,
  );
});

test('FT-07 rejects macro, ActiveX, embedded-object and custom UI payloads', () => {
  for (const name of ['word/vbaProject.bin', 'word/activeX/activeX1.bin', 'word/embeddings/oleObject1.bin', 'customUI/customUI.xml']) {
    assert.throws(() => preflightDocxPackage(syntheticZip(baseEntries([{ name }])), 'desktop'), hasCode('unsupported-type'), name);
  }
});

test('FT-07 rejects suspicious compression ratios and oversized entries', () => {
  assert.throws(
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: 'word/media/bomb.bin', compressedBytes: 1, uncompressedBytes: DOCX_PACKAGE_LIMITS.maxCompressionRatio + 1 }])), 'desktop'),
    hasCode('resource-limit'),
  );
  assert.throws(
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: 'word/media/huge.bin', compressedBytes: DOCX_PACKAGE_LIMITS.desktopEntryBytes, uncompressedBytes: DOCX_PACKAGE_LIMITS.desktopEntryBytes + 1 }])), 'desktop'),
    hasCode('resource-limit'),
  );
});

test('FT-07 rejects duplicate case-insensitive package entry names', () => {
  assert.throws(
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: 'WORD/DOCUMENT.XML' }])), 'desktop'),
    hasCode('malformed'),
  );
});
