import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const forbiddenDataExfiltrationApis = [
  'fetch(',
  'XMLHttpRequest',
  'sendBeacon',
  'WebSocket',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches.',
  'console.',
] as const;

test('FT-02 editor page has no document upload, persistence, or logging path', () => {
  const source = readFileSync(new URL('../pages/PdfSignEditPage.tsx', import.meta.url), 'utf8');
  for (const forbidden of forbiddenDataExfiltrationApis) {
    assert.equal(source.includes(forbidden), false, `PDF editor unexpectedly references ${forbidden}`);
  }
  assert.match(source, /useWorkerFetch: false/);
  assert.match(source, /disableAutoFetch: true/);
  assert.match(source, /disableStream: true/);
  assert.match(source, /pdf\.worker\.min\.mjs\?url/);
});

test('FT-02 core and shared file foundation stay free of network and persistence APIs', () => {
  const sources = [
    readFileSync(new URL('./pdf-sign-edit-core.ts', import.meta.url), 'utf8'),
    readFileSync(new URL('./file-tools-foundation.ts', import.meta.url), 'utf8'),
  ].join('\n');
  for (const forbidden of forbiddenDataExfiltrationApis) {
    assert.equal(sources.includes(forbidden), false, `local processing foundation unexpectedly references ${forbidden}`);
  }
});
