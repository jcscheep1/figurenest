import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  FILE_INPUT_LIMITS,
  FileToolError,
  LocalWorkerSession,
  ObjectUrlRegistry,
  clearArrayBuffer,
  loadValidatedLocalFile,
  transitionFileJob,
  validateLocalFile,
  type FileTypeRule,
  type LocalWorkerLike,
} from './file-tools-foundation';

const pdfRule: FileTypeRule = {
  id: 'pdf',
  extensions: ['pdf'],
  mimeTypes: ['application/pdf'],
  magicBytes: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }],
};

const pngRule: FileTypeRule = {
  id: 'png',
  extensions: ['png'],
  mimeTypes: ['image/png'],
  magicBytes: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
};

function makeFile(name: string, type: string, bytes: number[]): File {
  const blob = new Blob([Uint8Array.from(bytes)], { type });
  Object.defineProperty(blob, 'name', { configurable: false, enumerable: true, value: name });
  return blob as File;
}

async function expectCode(promise: Promise<unknown>, code: FileToolError['code']) {
  await assert.rejects(promise, (error: unknown) => error instanceof FileToolError && error.code === code);
}

test('FT-01 file-job state machine permits only deterministic lifecycle transitions', () => {
  let state = { status: 'idle' as const };
  state = transitionFileJob(state, { type: 'start-validation' });
  assert.equal(state.status, 'validating');
  state = transitionFileJob(state, { type: 'validated' });
  assert.equal(state.status, 'ready');
  state = transitionFileJob(state, { type: 'start-processing' });
  assert.equal(state.status, 'processing');
  state = transitionFileJob(state, { type: 'succeeded' });
  assert.equal(state.status, 'succeeded');
  state = transitionFileJob(state, { type: 'reset' });
  assert.deepEqual(state, { status: 'idle' });

  assert.throws(
    () => transitionFileJob({ status: 'idle' }, { type: 'succeeded' }),
    /Invalid file-job transition/,
  );
  assert.deepEqual(
    transitionFileJob({ status: 'processing' }, { type: 'failed', error: 'worker-failed' }),
    { status: 'failed', error: 'worker-failed' },
  );
  assert.deepEqual(
    transitionFileJob({ status: 'ready' }, { type: 'cancelled' }),
    { status: 'cancelled', error: 'cancelled' },
  );
});

test('FT-01 validates extension, MIME, magic bytes, empty files and device limits locally', async () => {
  const validPdf = makeFile('private-sentinel.pdf', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  assert.deepEqual(await validateLocalFile(validPdf, [pdfRule, pngRule], 'mobile'), { ruleId: 'pdf', size: 8 });

  await expectCode(validateLocalFile(makeFile('empty.pdf', 'application/pdf', []), [pdfRule], 'desktop'), 'empty-file');
  await expectCode(validateLocalFile(makeFile('wrong.png', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d]), [pdfRule, pngRule], 'desktop'), 'type-mismatch');
  await expectCode(validateLocalFile(makeFile('fake.pdf', 'application/pdf', [1, 2, 3, 4, 5]), [pdfRule], 'desktop'), 'type-mismatch');
  await expectCode(validateLocalFile(makeFile('notes.txt', 'text/plain', [65]), [pdfRule, pngRule], 'desktop'), 'unsupported-type');

  const oversized = new Blob([new Uint8Array(FILE_INPUT_LIMITS.mobile + 1)], { type: 'application/pdf' });
  Object.defineProperty(oversized, 'name', { value: 'large.pdf' });
  await expectCode(validateLocalFile(oversized as File, [pdfRule], 'mobile'), 'oversized');
});

test('FT-01 loads bytes in memory, supports cancellation and allows explicit buffer cleanup', async () => {
  const file = makeFile('local.pdf', 'application/pdf', [0x25, 0x50, 0x44, 0x46, 0x2d, 9, 8, 7]);
  const loaded = await loadValidatedLocalFile(file, [pdfRule], 'desktop');
  assert.equal(loaded.validation.ruleId, 'pdf');
  assert.deepEqual([...new Uint8Array(loaded.buffer)], [0x25, 0x50, 0x44, 0x46, 0x2d, 9, 8, 7]);
  clearArrayBuffer(loaded.buffer);
  assert.ok([...new Uint8Array(loaded.buffer)].every((value) => value === 0));

  const controller = new AbortController();
  controller.abort();
  await expectCode(loadValidatedLocalFile(file, [pdfRule], 'desktop', controller.signal), 'cancelled');
});

test('FT-01 object URL registry revokes every tracked URL exactly once', () => {
  const created: string[] = [];
  const revoked: string[] = [];
  const registry = new ObjectUrlRegistry({
    createObjectURL: () => {
      const url = `blob:local-${created.length + 1}`;
      created.push(url);
      return url;
    },
    revokeObjectURL: (url) => revoked.push(url),
  });

  const first = registry.create(new Blob(['one']));
  const second = registry.create(new Blob(['two']));
  assert.equal(registry.size, 2);
  registry.release(first);
  registry.release(first);
  assert.deepEqual(revoked, [first]);
  registry.clear();
  registry.clear();
  assert.deepEqual(revoked, [first, second]);
  assert.equal(registry.size, 0);
});

test('FT-01 worker session transfers in-memory bytes and terminates idempotently', () => {
  const messages: unknown[] = [];
  const transfers: Transferable[][] = [];
  let terminations = 0;
  const worker: LocalWorkerLike = {
    postMessage: (message, transfer = []) => {
      messages.push(message);
      transfers.push(transfer);
    },
    terminate: () => { terminations += 1; },
  };
  const session = new LocalWorkerSession(worker);
  const buffer = new ArrayBuffer(4);
  session.start('job-1', buffer);
  assert.equal(transfers[0]?.[0], buffer);
  session.cancel('job-1');
  session.dispose();
  assert.deepEqual(messages.map((message) => (message as { type: string }).type), ['start', 'cancel']);
  assert.equal(terminations, 1);
  assert.equal(session.isClosed, true);
  assert.throws(() => session.start('job-2', new ArrayBuffer(1)), FileToolError);
});

test('FT-01 production foundation has no network, persistence or logging surface', () => {
  const foundation = readFileSync(new URL('./file-tools-foundation.ts', import.meta.url), 'utf8');
  const dropzone = readFileSync(new URL('../components/LocalFileDropzone.tsx', import.meta.url), 'utf8');
  const productionSurface = `${foundation}\n${dropzone}`;
  for (const forbidden of [
    'fetch(',
    'XMLHttpRequest',
    'sendBeacon',
    'WebSocket',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches.',
    'console.',
  ]) {
    assert.equal(productionSurface.includes(forbidden), false, forbidden);
  }
});

test('FT-01 shared picker keeps native file input, keyboard buttons, live status, cancel/reset and no public route wiring', () => {
  const source = readFileSync(new URL('../components/LocalFileDropzone.tsx', import.meta.url), 'utf8');
  assert.match(source, /type="file"/);
  assert.match(source, /type="button"/);
  assert.match(source, /onDrop=/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /role="alert"/);
  assert.match(source, />Cancel</);
  assert.match(source, />\s*Reset\s*</);
});
