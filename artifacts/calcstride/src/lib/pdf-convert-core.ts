import { FileToolError } from './file-tools-foundation';

export type ZipEntry = { name: string; data: Uint8Array };
export type ExtractedPdfPage = { pageNumber: number; text: string };

export function parsePdfPageSelection(value: string, pageCount: number): number[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new FileToolError('malformed', 'The PDF page count is invalid.');
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === 'all') {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const selected = new Set<number>();
  for (const token of normalized.split(',').map((part) => part.trim()).filter(Boolean)) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(token);
    if (!match) {
      throw new FileToolError('malformed', 'Use page numbers like 1,3-5 or all.');
    }
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < 1 || start > end || end > pageCount) {
      throw new FileToolError('resource-limit', `Page selection must stay between 1 and ${pageCount}.`);
    }
    for (let page = start; page <= end; page += 1) selected.add(page);
  }

  if (selected.size === 0) throw new FileToolError('malformed', 'Choose at least one PDF page.');
  return [...selected].sort((a, b) => a - b);
}

export function safePdfBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.pdf$/i, '').trim();
  const safe = withoutExtension
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return safe || 'figurenest-pdf';
}

export function textItemsToPlainText(items: readonly { str?: string; hasEOL?: boolean }[]): string {
  let output = '';
  for (const item of items) {
    const text = typeof item.str === 'string' ? item.str : '';
    if (text) {
      if (output && !/[\s\n]$/.test(output)) output += ' ';
      output += text;
    }
    if (item.hasEOL) output = output.replace(/[ \t]+$/g, '') + '\n';
  }
  return output.replace(/[ \t]+\n/g, '\n').trim();
}

export function assembleExtractedPdfText(pages: readonly ExtractedPdfPage[]): string {
  return pages
    .map(({ pageNumber, text }) => `--- Page ${pageNumber} ---\n${text.trim() || '[No extractable text on this page]'}`)
    .join('\n\n');
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function setUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function setUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

export function createStoredZip(entries: readonly ZipEntry[]): Uint8Array {
  if (entries.length === 0) throw new FileToolError('malformed', 'There are no files to place in the ZIP archive.');
  if (entries.length > 0xffff) throw new FileToolError('resource-limit', 'Too many files for a browser ZIP archive.');

  const encoder = new TextEncoder();
  const records = entries.map((entry) => {
    const name = encoder.encode(entry.name.replace(/\\/g, '/'));
    if (name.length === 0 || name.length > 0xffff) throw new FileToolError('malformed', 'A ZIP filename is invalid.');
    return { ...entry, name, crc: crc32(entry.data) };
  });

  const localSize = records.reduce((total, record) => total + 30 + record.name.length + record.data.length, 0);
  const centralSize = records.reduce((total, record) => total + 46 + record.name.length, 0);
  const output = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(output.buffer);
  let offset = 0;
  const localOffsets: number[] = [];

  records.forEach((record) => {
    localOffsets.push(offset);
    setUint32(view, offset, 0x04034b50);
    setUint16(view, offset + 4, 20);
    setUint16(view, offset + 6, 0x0800);
    setUint16(view, offset + 8, 0);
    setUint16(view, offset + 10, 0);
    setUint16(view, offset + 12, 0);
    setUint32(view, offset + 14, record.crc);
    setUint32(view, offset + 18, record.data.length);
    setUint32(view, offset + 22, record.data.length);
    setUint16(view, offset + 26, record.name.length);
    setUint16(view, offset + 28, 0);
    output.set(record.name, offset + 30);
    output.set(record.data, offset + 30 + record.name.length);
    offset += 30 + record.name.length + record.data.length;
  });

  const centralOffset = offset;
  records.forEach((record, index) => {
    setUint32(view, offset, 0x02014b50);
    setUint16(view, offset + 4, 20);
    setUint16(view, offset + 6, 20);
    setUint16(view, offset + 8, 0x0800);
    setUint16(view, offset + 10, 0);
    setUint16(view, offset + 12, 0);
    setUint16(view, offset + 14, 0);
    setUint32(view, offset + 16, record.crc);
    setUint32(view, offset + 20, record.data.length);
    setUint32(view, offset + 24, record.data.length);
    setUint16(view, offset + 28, record.name.length);
    setUint16(view, offset + 30, 0);
    setUint16(view, offset + 32, 0);
    setUint16(view, offset + 34, 0);
    setUint16(view, offset + 36, 0);
    setUint32(view, offset + 38, 0);
    setUint32(view, offset + 42, localOffsets[index]);
    output.set(record.name, offset + 46);
    offset += 46 + record.name.length;
  });

  setUint32(view, offset, 0x06054b50);
  setUint16(view, offset + 4, 0);
  setUint16(view, offset + 6, 0);
  setUint16(view, offset + 8, records.length);
  setUint16(view, offset + 10, records.length);
  setUint32(view, offset + 12, offset - centralOffset);
  setUint32(view, offset + 16, centralOffset);
  setUint16(view, offset + 20, 0);
  return output;
}
