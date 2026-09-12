import assert from 'node:assert/strict';
import test from 'node:test';
import {
  IMAGE_CONVERTER_DEFAULT_QUALITY,
  assertDecodedImageSize,
  buildConvertedImageName,
  clampImageQuality,
  encodedBlobMatchesTargetMime,
  outputExtension,
  outputMime,
  outputNeedsOpaqueBackground,
  qualityApplies,
  transparencyNotice,
  webpContainsAnimation,
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
  assert.equal(buildConvertedImageName(' .png ', 'png'), 'image-converted.png');
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

function riffWebpChunk(id: string, payload: number[]): Uint8Array {
  const paddedLength = payload.length + (payload.length % 2);
  const bytes = new Uint8Array(12 + 8 + paddedLength);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  const riffSize = bytes.length - 8;
  bytes.set([riffSize & 0xff, (riffSize >>> 8) & 0xff, (riffSize >>> 16) & 0xff, (riffSize >>> 24) & 0xff], 4);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([...id].map((char) => char.charCodeAt(0)), 12);
  bytes.set([payload.length & 0xff, (payload.length >>> 8) & 0xff, (payload.length >>> 16) & 0xff, (payload.length >>> 24) & 0xff], 16);
  bytes.set(payload, 20);
  return bytes;
}

test('detects animated WebP by structural chunks and VP8X animation flag', () => {
  assert.equal(webpContainsAnimation(riffWebpChunk('ANIM', [0, 0, 0, 0, 0, 0])), true);
  assert.equal(webpContainsAnimation(riffWebpChunk('ANMF', [0, 0, 0, 0])), true);
  assert.equal(webpContainsAnimation(riffWebpChunk('VP8X', [0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0])), true);
  assert.equal(webpContainsAnimation(riffWebpChunk('VP8X', [0x10, 0, 0, 0, 0, 0, 0, 0, 0, 0])), false);
});

test('does not mistake ANIM bytes inside a non-animation payload for an animation chunk', () => {
  const payload = [0x41, 0x4e, 0x49, 0x4d, 0, 0, 0, 0];
  assert.equal(webpContainsAnimation(riffWebpChunk('VP8 ', payload)), false);
});

test('fails closed on malformed WebP chunk lengths', () => {
  const malformed = riffWebpChunk('VP8X', [0]);
  malformed[16] = 0xff;
  malformed[17] = 0xff;
  malformed[18] = 0xff;
  malformed[19] = 0x7f;
  assert.equal(webpContainsAnimation(malformed), false);
});

test('rejects silent canvas MIME fallback for output formats', () => {
  assert.equal(encodedBlobMatchesTargetMime('image/webp', 'webp'), true);
  assert.equal(encodedBlobMatchesTargetMime('IMAGE/JPEG', 'jpeg'), true);
  assert.equal(encodedBlobMatchesTargetMime('image/png', 'webp'), false);
  assert.equal(encodedBlobMatchesTargetMime('', 'jpeg'), false);
});
