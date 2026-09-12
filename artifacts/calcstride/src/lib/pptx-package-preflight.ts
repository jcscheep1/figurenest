export type PptxPackageLimits = {
  maxEntries: number;
  maxCompressedBytes: number;
  maxUncompressedBytes: number;
  maxEntryUncompressedBytes: number;
  maxXmlPartBytes: number;
  maxCompressionRatio: number;
  maxSlides: number;
  maxMediaParts: number;
};

export type PptxPackageInventory = {
  entries: number;
  compressedBytes: number;
  uncompressedBytes: number;
  slides: number;
  mediaParts: number;
  relationshipParts: number;
};

export type PptxPackagePreflightResult =
  | { ok: true; inventory: PptxPackageInventory }
  | { ok: false; reason: string };

export const DEFAULT_PPTX_PACKAGE_LIMITS: PptxPackageLimits = {
  maxEntries: 2_000,
  maxCompressedBytes: 75 * 1024 * 1024,
  maxUncompressedBytes: 250 * 1024 * 1024,
  maxEntryUncompressedBytes: 64 * 1024 * 1024,
  maxXmlPartBytes: 20 * 1024 * 1024,
  maxCompressionRatio: 100,
  maxSlides: 50,
  maxMediaParts: 100,
};

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const ZIP64_SENTINEL_16 = 0xffff;
const ZIP64_SENTINEL_32 = 0xffffffff;
const MAX_EOCD_SEARCH = 65_557;
const decoder = new TextDecoder('utf-8', { fatal: true });

function fail(reason: string): PptxPackagePreflightResult {
  return { ok: false, reason };
}

function normaliseEntryName(name: string): string | null {
  if (!name || name.includes('\0') || name.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(name)) return null;
  const normalised = name.replace(/\\/g, '/');
  const parts = normalised.split('/');
  if (parts.some((part) => part === '..')) return null;
  return normalised;
}

function isActiveOrEmbeddedPart(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower === 'ppt/vbaproject.bin' ||
    lower.startsWith('ppt/embeddings/') ||
    lower.startsWith('ppt/activex/') ||
    lower.startsWith('customui/') ||
    lower.endsWith('/vbaproject.bin') ||
    lower.endsWith('.vml')
  );
}

function isXmlPart(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.xml') || lower.endsWith('.rels');
}

/**
 * FT-11 hostile PPTX package inventory gate. It reads only ZIP central-directory
 * metadata and entry names; it never inflates presentation content. ZIP64,
 * encryption, unsupported compression, path traversal, active/OLE content and
 * provisional resource-limit violations fail closed before any PPTX renderer.
 */
export function preflightPptxPackage(
  bytes: Uint8Array,
  limits: PptxPackageLimits = DEFAULT_PPTX_PACKAGE_LIMITS,
): PptxPackagePreflightResult {
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
  let slides = 0;
  let mediaParts = 0;
  let relationshipParts = 0;
  let hasContentTypes = false;
  let hasPresentation = false;
  const seen = new Set<string>();

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
    const nameStart = offset + 46;
    const nameEnd = nameStart + fileNameLength;

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
    if (nameEnd > bytes.byteLength) return fail('invalid-entry-name-bounds');

    let decodedName: string;
    try {
      decodedName = decoder.decode(bytes.subarray(nameStart, nameEnd));
    } catch {
      return fail('invalid-entry-name-encoding');
    }
    const name = normaliseEntryName(decodedName);
    if (!name) return fail('unsafe-entry-path');
    const lowerName = name.toLowerCase();
    if (seen.has(lowerName)) return fail('duplicate-entry-name');
    seen.add(lowerName);

    if (isActiveOrEmbeddedPart(name)) return fail('active-or-embedded-content-unsupported');
    if (isXmlPart(name) && uncompressedSize > limits.maxXmlPartBytes) return fail('xml-part-size-limit');

    if (lowerName === '[content_types].xml') hasContentTypes = true;
    if (lowerName === 'ppt/presentation.xml') hasPresentation = true;
    if (/^ppt\/slides\/slide\d+\.xml$/i.test(name)) slides += 1;
    if (lowerName.startsWith('ppt/media/') && !lowerName.endsWith('/')) mediaParts += 1;
    if (lowerName.endsWith('.rels')) relationshipParts += 1;
    if (slides > limits.maxSlides) return fail('slide-count-limit');
    if (mediaParts > limits.maxMediaParts) return fail('media-count-limit');

    totalCompressed += compressedSize;
    totalUncompressed += uncompressedSize;
    if (totalCompressed > limits.maxCompressedBytes) return fail('compressed-content-limit');
    if (totalUncompressed > limits.maxUncompressedBytes) return fail('uncompressed-content-limit');

    const next = offset + 46 + fileNameLength + extraLength + entryCommentLength;
    if (next > bytes.byteLength || next > centralOffset + centralSize) return fail('invalid-central-directory-entry-bounds');
    offset = next;
  }

  if (offset !== centralOffset + centralSize) return fail('central-directory-size-mismatch');
  if (!hasContentTypes || !hasPresentation) return fail('not-pptx-package');
  if (slides === 0) return fail('presentation-has-no-slides');

  return {
    ok: true,
    inventory: {
      entries: totalEntries,
      compressedBytes: totalCompressed,
      uncompressedBytes: totalUncompressed,
      slides,
      mediaParts,
      relationshipParts,
    },
  };
}

export type PptxRelationshipInspectionResult = { ok: true } | { ok: false; reason: string };

function decodeRelationshipTarget(value: string): string | null {
  let malformed = false;
  const decoded = value.replace(/&(?:#(x[0-9a-f]+|[0-9]+)|amp|apos|quot|lt|gt);/gi, (entity, numeric: string | undefined) => {
    if (numeric) {
      const radix = numeric[0]?.toLowerCase() === 'x' ? 16 : 10;
      const raw = radix === 16 ? numeric.slice(1) : numeric;
      const codePoint = Number.parseInt(raw, radix);
      if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        malformed = true;
        return '';
      }
      return String.fromCodePoint(codePoint);
    }
    switch (entity.toLowerCase()) {
      case '&amp;': return '&';
      case '&apos;': return "'";
      case '&quot;': return '"';
      case '&lt;': return '<';
      case '&gt;': return '>';
      default: return entity;
    }
  });
  if (malformed || /&(?:#|[a-z])/i.test(decoded)) return null;
  return decoded.trim();
}

function isUnsafeRelationshipTarget(target: string): boolean {
  if (!target || target.includes('\0') || target.includes('\\')) return true;
  if (target.startsWith('/') || target.startsWith('//')) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return true;
  return false;
}

/**
 * Runs only after package preflight and bounded XML inflation. Relationship XML
 * is treated as data; no target is fetched. Explicit external relationships,
 * URI schemes, absolute/protocol-relative paths and ambiguous encoded targets
 * fail closed before rendering.
 */
export function inspectPptxRelationshipXml(xmlParts: Iterable<string>): PptxRelationshipInspectionResult {
  for (const xml of xmlParts) {
    if (/TargetMode\s*=\s*["']External["']/i.test(xml)) {
      return { ok: false, reason: 'external-relationship-unsupported' };
    }
    const targets = xml.matchAll(/\bTarget\s*=\s*(["'])(.*?)\1/gi);
    for (const match of targets) {
      const target = decodeRelationshipTarget(match[2] ?? '');
      if (target === null || isUnsafeRelationshipTarget(target)) {
        return { ok: false, reason: 'active-relationship-target-unsupported' };
      }
    }
    if (/Type\s*=\s*["'][^"']*(?:oleObject|package|activeX)[^"']*["']/i.test(xml)) {
      return { ok: false, reason: 'active-relationship-type-unsupported' };
    }
  }
  return { ok: true };
}
