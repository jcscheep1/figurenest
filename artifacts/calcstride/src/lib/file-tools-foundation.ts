export const FILE_INPUT_LIMITS = {
  mobile: 25 * 1024 * 1024,
  desktop: 75 * 1024 * 1024,
} as const;

export type FileDeviceClass = keyof typeof FILE_INPUT_LIMITS;
export type FileJobStatus = 'idle' | 'validating' | 'ready' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
export type FileToolErrorCode =
  | 'empty-file'
  | 'unsupported-type'
  | 'type-mismatch'
  | 'oversized'
  | 'malformed'
  | 'cancelled'
  | 'worker-failed';

export class FileToolError extends Error {
  readonly code: FileToolErrorCode;

  constructor(code: FileToolErrorCode, message: string) {
    super(message);
    this.name = 'FileToolError';
    this.code = code;
  }
}

export type MagicBytePattern = {
  offset: number;
  bytes: readonly number[];
};

export type FileTypeRule = {
  id: string;
  extensions: readonly string[];
  mimeTypes: readonly string[];
  magicBytes?: readonly MagicBytePattern[];
};

export type ValidatedLocalFile = {
  ruleId: string;
  size: number;
};

export type FileJobState = {
  status: FileJobStatus;
  error?: FileToolErrorCode;
};

export type FileJobEvent =
  | { type: 'start-validation' }
  | { type: 'validated' }
  | { type: 'start-processing' }
  | { type: 'succeeded' }
  | { type: 'failed'; error: FileToolErrorCode }
  | { type: 'cancelled' }
  | { type: 'reset' };

const allowedTransitions: Record<FileJobStatus, readonly FileJobEvent['type'][]> = {
  idle: ['start-validation', 'reset'],
  validating: ['validated', 'failed', 'cancelled', 'reset'],
  ready: ['start-processing', 'failed', 'cancelled', 'reset'],
  processing: ['succeeded', 'failed', 'cancelled', 'reset'],
  succeeded: ['reset'],
  failed: ['reset', 'start-validation'],
  cancelled: ['reset', 'start-validation'],
};

export function transitionFileJob(state: FileJobState, event: FileJobEvent): FileJobState {
  if (!allowedTransitions[state.status].includes(event.type)) {
    throw new Error(`Invalid file-job transition: ${state.status} -> ${event.type}`);
  }

  switch (event.type) {
    case 'start-validation': return { status: 'validating' };
    case 'validated': return { status: 'ready' };
    case 'start-processing': return { status: 'processing' };
    case 'succeeded': return { status: 'succeeded' };
    case 'failed': return { status: 'failed', error: event.error };
    case 'cancelled': return { status: 'cancelled', error: 'cancelled' };
    case 'reset': return { status: 'idle' };
  }
}

function normalizeExtension(value: string): string {
  return value.trim().toLowerCase().replace(/^\./, '');
}

function fileExtension(name: string): string {
  const cleanName = name.trim();
  const dot = cleanName.lastIndexOf('.');
  return dot > -1 && dot < cleanName.length - 1 ? normalizeExtension(cleanName.slice(dot + 1)) : '';
}

function matchesMagicBytes(header: Uint8Array, pattern: MagicBytePattern): boolean {
  if (pattern.offset < 0 || pattern.offset + pattern.bytes.length > header.length) return false;
  return pattern.bytes.every((byte, index) => header[pattern.offset + index] === byte);
}

function requiredHeaderLength(rule: FileTypeRule): number {
  return Math.max(0, ...(rule.magicBytes ?? []).map((pattern) => pattern.offset + pattern.bytes.length));
}

function abortError(): FileToolError {
  return new FileToolError('cancelled', 'File processing was cancelled.');
}

async function awaitWithAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) throw abortError();

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

export async function readBlobArrayBuffer(blob: Blob, signal?: AbortSignal): Promise<ArrayBuffer> {
  if (signal?.aborted) throw abortError();

  if (typeof blob.arrayBuffer === 'function') {
    return awaitWithAbort(blob.arrayBuffer(), signal);
  }

  if (typeof FileReader === 'undefined') {
    throw new FileToolError('malformed', 'This browser cannot read the selected file locally.');
  }

  return awaitWithAbort(new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new FileToolError('malformed', 'The selected file could not be read.'));
    reader.onabort = () => reject(abortError());
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new FileToolError('malformed', 'The selected file could not be read as binary data.'));
    };
    reader.readAsArrayBuffer(blob);
  }), signal);
}

export async function validateLocalFile(
  file: File,
  rules: readonly FileTypeRule[],
  deviceClass: FileDeviceClass,
  signal?: AbortSignal,
): Promise<ValidatedLocalFile> {
  if (signal?.aborted) throw abortError();
  if (file.size === 0) throw new FileToolError('empty-file', 'The selected file is empty.');
  if (file.size > FILE_INPUT_LIMITS[deviceClass]) {
    throw new FileToolError('oversized', `The selected file exceeds the ${deviceClass} size limit.`);
  }

  const extension = fileExtension(file.name);
  const mime = file.type.trim().toLowerCase();
  const extensionMatches = extension
    ? rules.filter((rule) => rule.extensions.some((item) => normalizeExtension(item) === extension))
    : [];
  const mimeMatches = mime
    ? rules.filter((rule) => rule.mimeTypes.some((item) => item.trim().toLowerCase() === mime))
    : [];

  if (extensionMatches.length === 0 && mimeMatches.length === 0) {
    throw new FileToolError('unsupported-type', 'The selected file type is not supported.');
  }

  let candidates: FileTypeRule[];
  if (extensionMatches.length > 0 && mimeMatches.length > 0) {
    const mimeIds = new Set(mimeMatches.map((rule) => rule.id));
    candidates = extensionMatches.filter((rule) => mimeIds.has(rule.id));
    if (candidates.length === 0) {
      throw new FileToolError('type-mismatch', 'The file extension and reported content type do not agree.');
    }
  } else {
    candidates = [...(extensionMatches.length > 0 ? extensionMatches : mimeMatches)];
  }

  for (const rule of candidates) {
    const headerLength = requiredHeaderLength(rule);
    if (headerLength === 0) return { ruleId: rule.id, size: file.size };

    const headerBuffer = await readBlobArrayBuffer(file.slice(0, headerLength), signal);
    const header = new Uint8Array(headerBuffer);
    if ((rule.magicBytes ?? []).some((pattern) => matchesMagicBytes(header, pattern))) {
      return { ruleId: rule.id, size: file.size };
    }
  }

  throw new FileToolError('type-mismatch', 'The file contents do not match the expected format signature.');
}

export async function loadValidatedLocalFile(
  file: File,
  rules: readonly FileTypeRule[],
  deviceClass: FileDeviceClass,
  signal?: AbortSignal,
): Promise<{ validation: ValidatedLocalFile; buffer: ArrayBuffer }> {
  const validation = await validateLocalFile(file, rules, deviceClass, signal);
  const buffer = await readBlobArrayBuffer(file, signal);
  if (signal?.aborted) {
    clearArrayBuffer(buffer);
    throw abortError();
  }
  return { validation, buffer };
}

export function clearArrayBuffer(buffer: ArrayBuffer | undefined | null): void {
  if (!buffer || buffer.byteLength === 0) return;
  try {
    new Uint8Array(buffer).fill(0);
  } catch {
    // A transferred/detached ArrayBuffer no longer exposes writable bytes; dropping the reference is sufficient.
  }
}

export type ObjectUrlApi = {
  createObjectURL(blob: Blob): string;
  revokeObjectURL(url: string): void;
};

export class ObjectUrlRegistry {
  private readonly urls = new Set<string>();
  private readonly api: ObjectUrlApi;

  constructor(api: ObjectUrlApi = URL) {
    this.api = api;
  }

  create(blob: Blob): string {
    const url = this.api.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  release(url: string): void {
    if (!this.urls.delete(url)) return;
    this.api.revokeObjectURL(url);
  }

  clear(): void {
    for (const url of [...this.urls]) this.release(url);
  }

  get size(): number {
    return this.urls.size;
  }
}

export type FileWorkerRequest =
  | { type: 'start'; jobId: string; buffer: ArrayBuffer }
  | { type: 'cancel'; jobId: string };

export type FileWorkerResponse =
  | { type: 'progress'; jobId: string; progress: number }
  | { type: 'succeeded'; jobId: string; buffer?: ArrayBuffer }
  | { type: 'failed'; jobId: string; error: FileToolErrorCode };

export type LocalWorkerLike = {
  postMessage(message: FileWorkerRequest, transfer?: Transferable[]): void;
  terminate(): void;
};

export class LocalWorkerSession {
  private closed = false;

  constructor(private readonly worker: LocalWorkerLike) {}

  start(jobId: string, buffer: ArrayBuffer): void {
    if (this.closed) throw new FileToolError('worker-failed', 'The local worker session is already closed.');
    this.worker.postMessage({ type: 'start', jobId, buffer }, [buffer]);
  }

  cancel(jobId: string): void {
    if (this.closed) return;
    this.worker.postMessage({ type: 'cancel', jobId });
    this.dispose();
  }

  dispose(): void {
    if (this.closed) return;
    this.closed = true;
    this.worker.terminate();
  }

  get isClosed(): boolean {
    return this.closed;
  }
}
