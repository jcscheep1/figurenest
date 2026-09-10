import { useId, useRef, useState } from 'react';
import type { FileJobStatus } from '../lib/file-tools-foundation';

type LocalFileDropzoneProps = {
  accept?: string;
  status: FileJobStatus;
  fileName?: string;
  progress?: number;
  error?: string;
  disabled?: boolean;
  onSelect(file: File): void;
  onCancel?(): void;
  onReset?(): void;
};

function clampedProgress(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return Math.min(100, Math.max(0, value));
}

export function LocalFileDropzone({
  accept,
  status,
  fileName,
  progress,
  error,
  disabled = false,
  onSelect,
  onCancel,
  onReset,
}: LocalFileDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const safeProgress = clampedProgress(progress);
  const busy = status === 'validating' || status === 'processing';

  const choose = (file: File | undefined) => {
    if (!file || disabled) return;
    onSelect(file);
  };

  return (
    <section aria-labelledby={`${inputId}-title`} data-file-job-status={status}>
      <h2 id={`${inputId}-title`}>Choose a file</h2>
      <p id={`${inputId}-privacy`}>
        Selected files are handled in memory by FigureNest local-processing tools. This shared foundation contains no upload path.
      </p>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          choose(event.dataTransfer.files.item(0) ?? undefined);
        }}
        aria-describedby={`${inputId}-privacy`}
        data-drag-active={dragActive ? 'true' : 'false'}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          disabled={disabled || busy}
          onChange={(event) => choose(event.currentTarget.files?.item(0) ?? undefined)}
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
        />
        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </button>
        <span aria-hidden="true"> or drag and drop</span>
      </div>

      {fileName ? <p>Selected: {fileName}</p> : null}
      {safeProgress !== undefined && busy ? (
        <progress max={100} value={safeProgress} aria-label="File processing progress">
          {safeProgress}%
        </progress>
      ) : null}

      <div role="status" aria-live="polite" aria-atomic="true">
        {status === 'validating' ? 'Checking the file locally…' : null}
        {status === 'ready' ? 'File is ready for local processing.' : null}
        {status === 'processing' ? 'Processing locally…' : null}
        {status === 'succeeded' ? 'Processing completed.' : null}
        {status === 'cancelled' ? 'Processing cancelled.' : null}
      </div>

      {error ? <p role="alert">{error}</p> : null}

      <div>
        {busy && onCancel ? (
          <button type="button" onClick={onCancel}>Cancel</button>
        ) : null}
        {status !== 'idle' && onReset ? (
          <button
            type="button"
            onClick={() => {
              onReset();
              inputRef.current?.focus();
            }}
          >
            Reset
          </button>
        ) : null}
      </div>
    </section>
  );
}
