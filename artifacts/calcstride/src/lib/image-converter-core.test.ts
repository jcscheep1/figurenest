import assert from 'node:assert/strict';
import test from 'node:test';
import {
  IMAGE_CONVERTER_DEFAULT_QUALITY,
  assertDecodedImageSize,
  buildConvertedImageName,
  clampImageQuality,
  outputExtension,
  outputMime,
  outputNeedsOpaqueBackground,
  qualityApplies,
  transparencyNotice,
  webpSignatureMatches,
} from './image-converter-core';

test('maps output formats to stable MIME types and extensions', () => {
  assert.equal(outputMime('png'), 'image/png');
  assert.equal(outputMime('jpeg'), 'image/jpeg');
  assert.equal(outputMime('webp'), 'image/webp');
  assert.equal(outputExtension('jpeg'), 'jpg');
  assert.equal(outputExtension('webp'), 'webp');
});

test('applies quality only to lossy-capable canvas encoders', () => {
  assert.equal(qualityApplies('png'), false);
  assert.equal(qualityApplies('jpeg'), true);
  assert.equal(qualityApplies('webp'), true);
  assert.equal(clampImageQuality(Number.NaN), IMAGE_CONVERTER_DEFAULT_QUALITY);
  assert.equal(clampImageQuality(0.1), 0.4);
  assert.equal(clampImageQuality(1.5), 1);
  assert.equal(clampImageQuality(0.82), 0.82);
});

test('makes JPEG transparency loss explicit', () => {
  assert.equal(outputNeedsOpaqueBackground('jpeg'), true);
  assert.equal(outputNeedsOpaqueBackground('png'), false);
  assert.match(transparencyNotice('jpeg'), /flattened onto white/i);
  assert.match(transparencyNotice('webp'), /preserved/i);
});

test('builds deterministic safe download names', () => {
  assert.equal(buildConvertedImageName('photo.PNG', 'jpeg'), 'photo-converted.jpg');
  assert.equal(buildConvertedImageName('scan', 'webp'), 'scan-converted.webp');
  assert.equal(buildConvertedImageName(' .png ', 'png'), ' -converted.png');
});

test('enforces decoded pixel safety independently from compressed file size', () => {
  assert.equal(assertDecodedImageSize(4000, 3000), 12_000_000);
  assert.throws(() => assertDecodedImageSize(10_000, 5_000), /pixel safety limit/i);
  assert.throws(() => assertDecodedImageSize(0, 100), /invalid decoded dimensions/i);
});

test('checks both RIFF and WEBP markers for WebP signatures', () => {
  assert.equal(webpSignatureMatches(Uint8Array.from([0x52,0x49,0x46,0x46,0,0,0,0,0x57,0x45,0x42,0x50])), true);
  assert.equal(webpSignatureMatches(Uint8Array.from([0x52,0x49,0x46,0x46,0,0,0,0,0x4a,0x55,0x4e,0x4b])), false);
});
