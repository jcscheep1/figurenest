export type XlsxZipLimits = {
  maxEntries: number;
  maxCompressedBytes: number;
  maxUncompressedBytes: number;
  maxEntryUncompressedBytes: number;
  maxCompressionRatio: number;
};

export type XlsxZipPreflightResult =
  | { ok: true; entries: number; compressedBytes: number; uncompressedBytes: number }
  | { ok: false; reason: string };

export const DEFAULT_XLSX_ZIP_LIMITS: XlsxZipLimits = {
  maxEntries: 2_000,
  maxCompressedBytes: 75 * 1024 * 1024,
  maxUncompressedBytes: 250 * 1024 * 1024,
  maxEntryUncompressedBytes: 64 * 1024 * 1024,
  maxCompressionRatio: 100,
};

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const ZIP64_SENTINEL_16 = 0xffff;
const ZIP64_SENTINEL_32 = 0xffffffff;
const MAX_EOCD_SEARCH = 65_557;

function fail(reason: string): XlsxZipPreflightResult {
  return { ok: false, reason };
}

/**
 * Reads ZIP central-directory metadata without inflating archive entries.
 * This is an FT-09 hostile-input preflight, not a general ZIP parser.
 * ZIP64, encrypted entries, multi-disk archives and unsupported compression
 * methods fail closed before a workbook parser receives the bytes.
 */
export function preflightXlsxZip(
  bytes: Uint8Array,
  limits: XlsxZipLimits = DEFAULT_XLSX_ZIP_LIMITS,
): XlsxZipPreflightResult {
  if (bytes.byteLength < 22) return fail('zip-too-small');
  if (bytes.byteLength > limits.maxCompressedBytes) return fail('compressed-input-limit');

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const searchStart = Math.max(0, bytes.byteLength - MAX_EOCD_SEARCH);
  let eocd = -1;
  for (let offset = bytes.byteLength - 22; offset >= searchStart; offset -= 1) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) return fail('missing-end-of-central-directory');

  const diskNumber = view.getUint16(eocd + 4, true);
  const centralDisk = view.getUint16(eocd + 6, true);
  const entriesOnDisk = view.getUint16(eocd + 8, true);
  const totalEntries = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  const commentLength = view.getUint16(eocd + 20, true);

  if (eocd + 22 + commentLength !== bytes.byteLength) return fail('invalid-eocd-comment-length');
  if (diskNumber !== 0 || centralDisk !== 0 || entriesOnDisk !== totalEntries) return fail('multi-disk-zip-unsupported');
  if (
    entriesOnDisk === ZIP64_SENTINEL_16 ||
    totalEntries === ZIP64_SENTINEL_16 ||
    centralSize === ZIP64_SENTINEL_32 ||
    centralOffset === ZIP64_SENTINEL_32
  ) return fail('zip64-unsupported');
  if (totalEntries === 0) return fail('empty-archive');
  if (totalEntries > limits.maxEntries) return fail('entry-count-limit');
  if (centralOffset + centralSize > eocd || centralOffset + centralSize > bytes.byteLength) {
    return fail('invalid-central-directory-bounds');
  }

  let offset = centralOffset;
  let totalCompressed = 0;
  let totalUncompressed = 0;

  for (let entry = 0; entry < totalEntries; entry += 1) {
    if (offset + 46 > bytes.byteLength || view.getUint32(offset, true) !== CENTRAL_SIGNATURE) {
      return fail('invalid-central-directory-entry');
    }

    const flags = view.getUint16(offset + 8, true);
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const entryCommentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);

    if ((flags & 0x0001) !== 0) return fail('encrypted-entry-unsupported');
    if (method !== 0 && method !== 8) return fail('compression-method-unsupported');
    if (
      compressedSize === ZIP64_SENTINEL_32 ||
      uncompressedSize === ZIP64_SENTINEL_32 ||
      localHeaderOffset === ZIP64_SENTINEL_32
    ) return fail('zip64-unsupported');
    if (uncompressedSize > limits.maxEntryUncompressedBytes) return fail('entry-uncompressed-limit');
    if (uncompressedSize > 0 && compressedSize === 0) return fail('compression-ratio-limit');
    if (compressedSize > 0 && uncompressedSize / compressedSize > limits.maxCompressionRatio) {
      return fail('compression-ratio-limit');
    }

    totalCompressed += compressedSize;
    totalUncompressed += uncompressedSize;
    if (totalCompressed > limits.maxCompressedBytes) return fail('compressed-content-limit');
    if (totalUncompressed > limits.maxUncompressedBytes) return fail('uncompressed-content-limit');

    const next = offset + 46 + fileNameLength + extraLength + entryCommentLength;
    if (next > bytes.byteLength || next > centralOffset + centralSize) return fail('invalid-central-directory-entry-bounds');
    offset = next;
  }

  if (offset !== centralOffset + centralSize) return fail('central-directory-size-mismatch');
  return { ok: true, entries: totalEntries, compressedBytes: totalCompressed, uncompressedBytes: totalUncompressed };
}
