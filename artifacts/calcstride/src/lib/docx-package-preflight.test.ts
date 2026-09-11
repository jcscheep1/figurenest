import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import test from 'node:test';
import { FileToolError } from './file-tools-foundation';
import { DOCX_FILE_RULES, DOCX_PACKAGE_LIMITS, inspectDocxPackage, preflightDocxPackage } from './docx-package-preflight';

type SyntheticEntry = {
  name: string;
  data?: string | Uint8Array;
  compressedBytes?: number;
  uncompressedBytes?: number;
  method?: number;
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
    const source = typeof entry.data === 'string'
      ? Buffer.from(entry.data, 'utf8')
      : entry.data ? Buffer.from(entry.data) : Buffer.from('x');
    const method = entry.method ?? 0;
    const actualPayload = method === 8 ? deflateRawSync(source) : source;
    const compressedBytes = entry.compressedBytes ?? actualPayload.length;
    const uncompressedBytes = entry.uncompressedBytes ?? source.length;
    const flags = entry.flags ?? 0x0800;
    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(flags), u16(method), u16(0), u16(0), u32(0),
      u32(compressedBytes), u32(uncompressedBytes), u16(name.length), u16(0), name,
    ]);
    local.push(localHeader, actualPayload);

    central.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(flags), u16(method), u16(0), u16(0), u32(0),
      u32(compressedBytes), u32(uncompressedBytes), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0),
      u32(localOffset), name,
    ]));
    localOffset += localHeader.length + actualPayload.length;
  }

  const localBytes = Buffer.concat(local);
  const centralBytes = Buffer.concat(central);
  const eocd = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(centralBytes.length), u32(localBytes.length), u16(0),
  ]);
  return new Uint8Array(Buffer.concat([localBytes, centralBytes, eocd]));
}

const NORMAL_CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8"?><Types><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
const ROOT_RELS = `<?xml version="1.0"?><Relationships><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
const EMPTY_DOCUMENT = `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>`;
const EMPTY_RELS = `<?xml version="1.0"?><Relationships/>`;

function baseEntries(extra: readonly SyntheticEntry[] = []): SyntheticEntry[] {
  return [
    { name: '[Content_Types].xml', data: NORMAL_CONTENT_TYPES },
    { name: '_rels/.rels', data: ROOT_RELS },
    { name: 'word/document.xml', data: EMPTY_DOCUMENT },
    { name: 'word/_rels/document.xml.rels', data: EMPTY_RELS },
    ...extra,
  ];
}

function hasCode(code: string) {
  return (error: unknown) => error instanceof FileToolError && error.code === code;
}

function hasAnyCode(...codes: string[]) {
  return (error: unknown) => error instanceof FileToolError && codes.includes(error.code);
}

test('FT-07 DOCX picker rule requires .docx plus ZIP signature', () => {
  assert.deepEqual(DOCX_FILE_RULES.map((rule) => rule.id), ['docx']);
  assert.deepEqual(DOCX_FILE_RULES[0].extensions, ['docx']);
  assert.deepEqual(DOCX_FILE_RULES[0].magicBytes?.[0].bytes, [0x50, 0x4b, 0x03, 0x04]);
  assert.ok(DOCX_FILE_RULES[0].mimeTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
});

test('FT-07 accepts a bounded ordinary DOCX ZIP package', () => {
  const result = preflightDocxPackage(syntheticZip(baseEntries([
    { name: 'word/media/image1.png', data: 'image' },
  ])), 'desktop');
  assert.equal(result.entries.length, 5);
  assert.equal(result.entries.some((entry) => entry.name === 'word/document.xml'), true);
  assert.ok(result.totalUncompressedBytes > 0);
});

test('FT-07 rejects generic ZIPs that are not DOCX packages', () => {
  assert.throws(
    () => preflightDocxPackage(syntheticZip([{ name: 'notes.txt', data: 'notes' }]), 'desktop'),
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
    () => preflightDocxPackage(syntheticZip(baseEntries([{ name: 'word/odd.bin', method: 99 }])), 'desktop'),
    hasCode('unsupported-type'),
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

test('FT-07 inspects DEFLATE metadata locally and allows ordinary external hyperlinks without fetching them', async () => {
  const hyperlinkRels = `<?xml version="1.0"?><Relationships><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/" TargetMode="External"/></Relationships>`;
  const result = await inspectDocxPackage(syntheticZip([
    { name: '[Content_Types].xml', data: NORMAL_CONTENT_TYPES, method: 8 },
    { name: '_rels/.rels', data: ROOT_RELS, method: 8 },
    { name: 'word/document.xml', data: EMPTY_DOCUMENT, method: 8 },
    { name: 'word/_rels/document.xml.rels', data: hyperlinkRels, method: 8 },
  ]), 'desktop');
  assert.equal(result.externalHyperlinks, 1);
  assert.equal(result.inspectedRelationshipFiles, 2);
});

test('FT-07 rejects forged declared sizes using actual DEFLATE output for document and media entries', async () => {
  const bomb = new Uint8Array(1024 * 1024).fill(0x41);
  for (const target of ['word/document.xml', 'word/media/image1.png']) {
    const entries = baseEntries().map((entry) => entry.name === target
      ? { ...entry, data: bomb, method: 8, uncompressedBytes: 1 }
      : entry);
    if (target.startsWith('word/media/')) {
      entries.push({ name: target, data: bomb, method: 8, uncompressedBytes: 1 });
    }
    await assert.rejects(
      inspectDocxPackage(syntheticZip(entries), 'desktop'),
      hasAnyCode('resource-limit', 'malformed'),
      target,
    );
  }
});

test('FT-07 rejects hidden stored payload bytes outside declared local and central sizes', async () => {
  await assert.rejects(
    inspectDocxPackage(syntheticZip(baseEntries([
      { name: 'word/media/hidden.bin', data: 'hidden payload', compressedBytes: 1, uncompressedBytes: 1 },
    ])), 'desktop'),
    hasCode('malformed'),
  );
});

test('FT-07 rejects renamed macro-enabled packages by content type', async () => {
  const macroTypes = NORMAL_CONTENT_TYPES.replace(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
    'application/vnd.ms-word.document.macroEnabled.main+xml',
  );
  await assert.rejects(
    inspectDocxPackage(syntheticZip([
      { name: '[Content_Types].xml', data: macroTypes },
      { name: '_rels/.rels', data: ROOT_RELS },
      { name: 'word/document.xml', data: EMPTY_DOCUMENT },
      { name: 'word/_rels/document.xml.rels', data: EMPTY_RELS },
    ]), 'desktop'),
    hasCode('unsupported-type'),
  );
});

test('FT-07 rejects non-hyperlink external document resources', async () => {
  const externalImageRels = `<?xml version="1.0"?><Relationships><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="https://example.com/tracker.png" TargetMode="External"/></Relationships>`;
  await assert.rejects(
    inspectDocxPackage(syntheticZip([
      { name: '[Content_Types].xml', data: NORMAL_CONTENT_TYPES },
      { name: '_rels/.rels', data: ROOT_RELS },
      { name: 'word/document.xml', data: EMPTY_DOCUMENT },
      { name: 'word/_rels/document.xml.rels', data: externalImageRels },
    ]), 'desktop'),
    hasCode('unsupported-type'),
  );
});

test('FT-07 rejects javascript external hyperlinks before any HTML renderer sees them', async () => {
  const unsafeHyperlink = `<?xml version="1.0"?><Relationships><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="javascript:alert(1)" TargetMode="External"/></Relationships>`;
  await assert.rejects(
    inspectDocxPackage(syntheticZip([
      { name: '[Content_Types].xml', data: NORMAL_CONTENT_TYPES },
      { name: '_rels/.rels', data: ROOT_RELS },
      { name: 'word/document.xml', data: EMPTY_DOCUMENT },
      { name: 'word/_rels/document.xml.rels', data: unsafeHyperlink },
    ]), 'desktop'),
    hasCode('unsupported-type'),
  );
});

test('FT-07 rejects ambiguous UTF-16 metadata XML before conversion', async () => {
  const utf16Like = new Uint8Array([0xff, 0xfe, 0x3c, 0x00, 0x54, 0x00, 0x79, 0x00, 0x70, 0x00, 0x65, 0x00, 0x73, 0x00, 0x2f, 0x00, 0x3e, 0x00]);
  await assert.rejects(
    inspectDocxPackage(syntheticZip([
      { name: '[Content_Types].xml', data: utf16Like },
      { name: '_rels/.rels', data: ROOT_RELS },
      { name: 'word/document.xml', data: EMPTY_DOCUMENT },
      { name: 'word/_rels/document.xml.rels', data: EMPTY_RELS },
    ]), 'desktop'),
    hasCode('unsupported-type'),
  );
});
