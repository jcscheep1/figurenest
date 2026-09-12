import type { FileTypeRule } from './file-tools-foundation';

export type ImageConverterInputFormat = 'png' | 'jpeg' | 'webp';
export type ImageConverterOutputFormat = 'png' | 'jpeg' | 'webp';

export const IMAGE_CONVERTER_RULES: readonly FileTypeRule[] = [
  {
    id: 'png',
    extensions: ['png'],
    mimeTypes: ['image/png'],
    magicBytes: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  {
    id: 'jpeg',
    extensions: ['jpg', 'jpeg'],
    mimeTypes: ['image/jpeg'],
    magicBytes: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  },
  {
    id: 'webp',
    extensions: ['webp'],
    mimeTypes: ['image/webp'],
    magicBytes: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
    ],
  },
] as const;

export const IMAGE_CONVERTER_MAX_PIXELS = 40_000_000;
export const IMAGE_CONVERTER_DEFAULT_QUALITY = 0.9;
export const IMAGE_CONVERTER_MIN_QUALITY = 0.4;
export const IMAGE_CONVERTER_MAX_QUALITY = 1;

export function outputMime(format: ImageConverterOutputFormat): string {
  if (format === 'png') return 'image/png';
  if (format === 'jpeg') return 'image/jpeg';
  return 'image/webp';
}

export function outputExtension(format: ImageConverterOutputFormat): string {
  if (format === 'jpeg') return 'jpg';
  return format;
}

export function qualityApplies(format: ImageConverterOutputFormat): boolean {
  return format === 'jpeg' || format === 'webp';
}

export function clampImageQuality(value: number): number {
  if (!Number.isFinite(value)) return IMAGE_CONVERTER_DEFAULT_QUALITY;
  return Math.min(IMAGE_CONVERTER_MAX_QUALITY, Math.max(IMAGE_CONVERTER_MIN_QUALITY, value));
}

export function outputNeedsOpaqueBackground(format: ImageConverterOutputFormat): boolean {
  return format === 'jpeg';
}

export function buildConvertedImageName(sourceName: string, format: ImageConverterOutputFormat): string {
  const trimmed = sourceName.trim() || 'image';
  const withoutExtension = trimmed.replace(/\.[^.]+$/, '') || 'image';
  return `${withoutExtension}-converted.${outputExtension(format)}`;
}

export function assertDecodedImageSize(width: number, height: number): number {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error('The selected image has invalid decoded dimensions.');
  }
  const pixels = width * height;
  if (!Number.isSafeInteger(pixels) || pixels > IMAGE_CONVERTER_MAX_PIXELS) {
    throw new Error(`The decoded image exceeds the ${IMAGE_CONVERTER_MAX_PIXELS.toLocaleString('en-US')} pixel safety limit.`);
  }
  return pixels;
}

export function webpSignatureMatches(header: Uint8Array): boolean {
  if (header.length < 12) return false;
  const riff = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
  const webp = header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  return riff && webp;
}

export function transparencyNotice(format: ImageConverterOutputFormat): string {
  return format === 'jpeg'
    ? 'JPEG does not support transparency. Transparent pixels are flattened onto white.'
    : 'Transparency is preserved when the source decoder and selected output format support alpha.';
}
