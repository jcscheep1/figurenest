import { FILE_INPUT_LIMITS, FileToolError, type FileDeviceClass } from './file-tools-foundation';

const ZIP_EOCD_SIGNATURE = 0x06054b50;
const ZIP_CENTRAL_SIGNATURE = 0x02014b50;
const ZIP64_U16 = 0xffff;
const ZIP64_U32 = 0xffffffff;
const MAX_ZIP_COMMENT_BYTES = 0xffff;

export const DOCX_PACKAGE_LIMITS = {
  maxEntries: 2_000,
  maxCompressionRatio: 100,
  mobileUncompressedBytes: 80 * 1024 * 1024,
  desktopUncompressedBytes: 250 * 1024 * 1024,
  mobileEntryBytes: 40 * 1024 * 1024,
  desktopEntryBytes: 100 * 1024 * 1024,
} as const;

export type DocxPackageEntry = {
  name: string;
  compressedBytes: number;
  uncompressedBytes: number;
  compressionMethod: 0 | 8;
};

export type DocxPackagePreflight = {
  entries: readonly DocxPackageEntry[];
  totalCompressedBytes: number;
  totalUncompressedBytes: number;
};

const utf8 = new TextDecoder('utf-8', { fatal: false });

function malformed(message: string): never {
  throw new FileToolError('malformed', message);
}

function resourceLimit(message: string): never {
  throw new FileToolError('resource-limit', message);
}

function unsupported(message: string): never {
  throw new FileToolError('unsupported-type', message);
}

function findEndOfCentralDirectory(bytes: Uint8Array): number {
  if (bytes.byteLength < 22) malformed('The DOCX package is too small to contain a valid ZIP directory.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const start = Math.max(0, bytes.byteLength - (22 + MAX_ZIP_COMMENT_BYTES));
  for (let offset = bytes.byteLength - 22; offset >= start; offset -= 1) {
    if (view.getUint32(offset, true) === ZIP_EOCD_SIGNATURE) return offset;
  }
  malformed('The DOCX package does not contain a valid ZIP end record.');
}

function normalizedEntryName(raw: string): string {
  const name = raw.replace(/\\/g, '/');
  if (!name || name.includes('\0')) malformed('The DOCX package contains an invalid ZIP entry name.');
  if (name.startsWith('/') || /^[a-zA-Z]:\//.test(name)) malformed('The DOCX package contains an absolute ZIP path.');
  const segments = name.split('/');
  if (segments.some((segment) => segment === '..')) malformed('The DOCX package contains a path-traversal ZIP entry.');
  return name;
}

function isBlockedOfficePayload(lowerName: string): boolean {
  return lowerName === 'word/vbaproject.bin'
    || lowerName === 'word/vbadata.xml'
    || lowerName.startsWith('word/activex/')
    || lowerName.startsWith('word/embeddings/')
    || lowerName.startsWith('customui/');
}

function deviceUncompressedLimit(deviceClass: FileDeviceClass): number {
  return deviceClass === 'mobile'
    ? DOCX_PACKAGE_LIMITS.mobileUncompressedBytes
    : DOCX_PACKAGE_LIMITS.desktopUncompressedBytes;
}

function deviceEntryLimit(deviceClass: FileDeviceClass): number {
  return deviceClass === 'mobile'
    ? DOCX_PACKAGE_LIMITS.mobileEntryBytes
    : DOCX_PACKAGE_LIMITS.desktopEntryBytes;
}

export function preflightDocxPackage(bytes: Uint8Array, deviceClass: FileDeviceClass): DocxPackagePreflight {
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) {
    throw new FileToolError('empty-file', 'The selected DOCX file is empty.');
  }
  if (bytes.byteLength > FILE_INPUT_LIMITS[deviceClass]) {
    throw new FileToolError('oversized', `The selected DOCX exceeds the ${deviceClass} input limit.`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const diskNumber = view.getUint16(eocdOffset + 4, true);
  const centralDisk = view.getUint16(eocdOffset + 6, true);
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
  const totalEntries = view.getUint16(eocdOffset + 10, true);
  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  const commentLength = view.getUint16(eocdOffset + 20, true);

  if (eocdOffset + 22 + commentLength > bytes.byteLength) malformed('The DOCX ZIP comment exceeds the file boundary.');
  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== totalEntries) unsupported('Multi-disk DOCX ZIP packages are not supported.');
  if (totalEntries === ZIP64_U16 || centralSize === ZIP64_U32 || centralOffset === ZIP64_U32) unsupported('ZIP64 DOCX packages are not supported by this browser tool.');
  if (totalEntries < 1) malformed('The DOCX package contains no files.');
  if (totalEntries > DOCX_PACKAGE_LIMITS.maxEntries) resourceLimit(`The DOCX package contains more than ${DOCX_PACKAGE_LIMITS.maxEntries} ZIP entries.`);
  if (centralOffset + centralSize > eocdOffset || centralOffset + centralSize > bytes.byteLength) malformed('The DOCX ZIP central directory is outside the file boundary.');

  const entries: DocxPackageEntry[] = [];
  const seen = new Set<string>();
  let totalCompressedBytes = 0;
  let totalUncompressedBytes = 0;
  let cursor = centralOffset;
  const maxUncompressed = deviceUncompressedLimit(deviceClass);
  const maxEntry = deviceEntryLimit(deviceClass);

  for (let index = 0; index < totalEntries; index += 1) {
    if (cursor + 46 > eocdOffset || view.getUint32(cursor, true) !== ZIP_CENTRAL_SIGNATURE) {
      malformed('The DOCX ZIP central directory is malformed.');
    }

    const flags = view.getUint16(cursor + 8, true);
    const method = view.getUint16(cursor + 10, true);
    const compressedBytes = view.getUint32(cursor + 20, true);
    const uncompressedBytes = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const entryCommentLength = view.getUint16(cursor + 32, true);
    const diskStart = view.getUint16(cursor + 34, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const entryEnd = cursor + 46 + nameLength + extraLength + entryCommentLength;

    if (entryEnd > eocdOffset) malformed('A DOCX ZIP entry exceeds the central-directory boundary.');
    if ((flags & 0x0001) !== 0) unsupported('Encrypted DOCX ZIP entries are not supported.');
    if (diskStart !== 0) unsupported('Multi-disk DOCX ZIP entries are not supported.');
    if (compressedBytes === ZIP64_U32 || uncompressedBytes === ZIP64_U32 || localOffset === ZIP64_U32) unsupported('ZIP64 DOCX entries are not supported.');
    if (method !== 0 && method !== 8) unsupported(`DOCX ZIP compression method ${method} is not supported.`);
    if (localOffset >= centralOffset) malformed('A DOCX ZIP entry points outside the local-file area.');

    const rawName = utf8.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
    const name = normalizedEntryName(rawName);
    const lowerName = name.toLowerCase();
    if (seen.has(lowerName)) malformed('The DOCX ZIP package contains duplicate entry names.');
    seen.add(lowerName);

    if (!name.endsWith('/')) {
      if (isBlockedOfficePayload(lowerName)) unsupported('Macro, ActiveX, embedded-object, or custom-UI DOCX packages are not supported.');
      if (uncompressedBytes > maxEntry) resourceLimit('A DOCX ZIP entry exceeds the per-entry uncompressed-size limit.');
      const ratio = uncompressedBytes === 0 ? 1 : compressedBytes === 0 ? Number.POSITIVE_INFINITY : uncompressedBytes / compressedBytes;
      if (ratio > DOCX_PACKAGE_LIMITS.maxCompressionRatio) resourceLimit(`A DOCX ZIP entry exceeds the ${DOCX_PACKAGE_LIMITS.maxCompressionRatio}:1 compression-ratio limit.`);
      totalCompressedBytes += compressedBytes;
      totalUncompressedBytes += uncompressedBytes;
      if (totalUncompressedBytes > maxUncompressed) resourceLimit('The DOCX package exceeds the safe total uncompressed-size limit for this device.');
      entries.push({ name, compressedBytes, uncompressedBytes, compressionMethod: method as 0 | 8 });
    }

    cursor = entryEnd;
  }

  if (cursor !== centralOffset + centralSize) malformed('The DOCX ZIP central-directory size does not match its entries.');
  if (!seen.has('[content_types].xml') || !seen.has('word/document.xml')) {
    unsupported('The selected ZIP is not a supported DOCX package.');
  }

  return { entries, totalCompressedBytes, totalUncompressedBytes };
}
