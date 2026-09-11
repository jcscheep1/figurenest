import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { LocalFileDropzone } from '@/components/LocalFileDropzone';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import { FILE_INPUT_LIMITS, FILE_RESOURCE_LIMITS, ObjectUrlRegistry, type FileDeviceClass, type FileJobStatus } from '@/lib/file-tools-foundation';
import { convertPdfTextToDocx, pdfToDocxOutputName, type PdfToDocxResult } from '@/lib/pdf-to-docx';
import '@/styles/file-tools.css';

const PDF_TO_DOCX_PAGE = {
  href: '/file-tools/pdf-to-docx',
  h1: 'Convert PDF Text to Editable DOCX',
  description: 'Turn selectable PDF text into an editable DOCX locally in your browser, with clear warnings for scans, images and complex layout.',
  privacySummary: 'The PDF, filename, extracted text and generated DOCX stay in this browser tab. FigureNest does not upload the document or conversion output.',
  limitations: [
    'This tool converts selectable text into an editable DOCX on a best-effort basis. It is not a pixel-perfect PDF-to-Word recreation, so columns, tables, fonts, spacing and pagination may differ.',
    'Scanned or image-only PDFs need OCR, which this version does not perform. Those files are rejected rather than returning an empty DOCX or sending the document to a server.',
    'Raster images are detected, but their placement is not preserved in this version. Selectable text can still be converted and the tool shows an image-placement warning.',
    'Password-protected, malformed, oversized and over-100-page PDFs are rejected locally. PDF scripts, launch actions, embedded executables and other active content are not carried into the DOCX.',
  ],
  faqs: [
    { question: 'Does FigureNest upload my PDF to convert it?', answer: 'No. PDF parsing, selectable-text extraction and DOCX generation run in your browser. The PDF bytes, filename, extracted text and generated DOCX are not sent to a FigureNest conversion server.' },
    { question: 'Will the DOCX look exactly like the PDF?', answer: 'No. PDFs store positioned drawing instructions rather than Word document structure. FigureNest creates useful editable text with best-effort reading order, but complex columns, tables, fonts and pagination can differ.' },
    { question: 'Can this convert scanned PDFs?', answer: 'Not in this version. If the PDF has no usable selectable text, FigureNest reports that OCR is required instead of pretending the conversion succeeded.' },
    { question: 'What happens to images in the PDF?', answer: 'The converter detects raster imagery and warns that image placement is not preserved. Selectable text remains the intended editable output for this release.' },
    { question: 'How large can the PDF be?', answer: 'The shared local-file limits currently allow up to 25 MB on mobile-class devices or 75 MB on desktop-class devices, with a maximum of 100 PDF pages.' },
  ],
} as const;

function currentDeviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

function sizeLimitLabel(deviceClass: FileDeviceClass): string {
  return `${Math.round(FILE_INPUT_LIMITS[deviceClass] / 1024 / 1024)} MB`;
}

export function PdfToDocxPage() {
  const definition = PDF_TO_DOCX_PAGE;
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<PdfToDocxResult | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const urlsRef = useRef(new ObjectUrlRegistry());
  const downloadRef = useRef<HTMLButtonElement | null>(null);
  const deviceClass = currentDeviceClass();

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    urlsRef.current.clear();
    setStatus('idle');
    setFileName('');
    setError('');
    setResult(null);
    setAnnouncement('Converter reset.');
  };

  useEffect(() => () => {
    abortRef.current?.abort();
    urlsRef.current.clear();
  }, []);

  useEffect(() => {
    if (status !== 'ready') return;
    window.setTimeout(() => downloadRef.current?.focus({ preventScroll: true }), 100);
  }, [status]);

  const select = async (file: File) => {
    abortRef.current?.abort();
    urlsRef.current.clear();
    setResult(null);
    setFileName(file.name);
    setError('');
    setAnnouncement('');
    setStatus('processing');

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const converted = await convertPdfTextToDocx(file, deviceClass, controller.signal);
      if (controller.signal.aborted) return;
      setResult(converted);
      setStatus('ready');
      setAnnouncement(`Editable DOCX is ready. ${converted.pageCount} PDF ${converted.pageCount === 1 ? 'page' : 'pages'} processed locally.`);
    } catch (caught) {
      if (controller.signal.aborted) {
        setStatus('cancelled');
        setError('PDF to DOCX conversion was cancelled.');
      } else {
        setStatus('failed');
        setError(caught instanceof Error ? caught.message : 'The PDF could not be converted locally.');
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('cancelled');
    setError('PDF to DOCX conversion was cancelled.');
  };

  const download = () => {
    if (!result) return;
    const url = urlsRef.current.create(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = pdfToDocxOutputName(fileName);
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => urlsRef.current.release(url), 0);
    setAnnouncement('DOCX download started.');
  };

  return <Shell>
    <Seo path={definition.href} />
    <main className="tool-page file-tool-page" data-testid="page-pdf-to-docx">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span aria-current="page">/ PDF TO DOCX</span>
      </nav>

      <header className="file-tool-hero">
        <p className="eyebrow">Private browser file tool</p>
        <h1>{definition.h1}</h1>
        <p>{definition.description}</p>
        <p><strong>Your PDF stays on this device.</strong> {definition.privacySummary}</p>
      </header>

      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>

      <section className="file-upload-panel" aria-label="Choose PDF file">
        <LocalFileDropzone
          accept="application/pdf,.pdf"
          status={status}
          fileName={fileName || undefined}
          error={error || undefined}
          onSelect={(file) => void select(file)}
          onCancel={cancel}
          onReset={reset}
        />
        <p className="file-limit-note">
          Up to {sizeLimitLabel(deviceClass)} and {FILE_RESOURCE_LIMITS.pdfPages} pages. Selectable-text PDFs only; scanned PDFs need OCR and are rejected with a clear message.
        </p>
      </section>

      <section className="docx-preview-step docx-workflow-step" aria-labelledby="pdf-docx-download-heading">
        <p className="docx-step-label"><span>2</span> Download editable text</p>
        <div className="docx-preview-heading-row">
          <div>
            <h2 id="pdf-docx-download-heading">{result ? 'Your editable DOCX is ready' : 'Convert PDF text to DOCX'}</h2>
            <p>{result ? `${result.pageCount} ${result.pageCount === 1 ? 'page' : 'pages'} converted into ${result.paragraphCount} editable text ${result.paragraphCount === 1 ? 'line' : 'lines'}.` : 'Choose a PDF above. FigureNest extracts its selectable text locally and creates a DOCX in this browser.'}</p>
          </div>
          <button ref={downloadRef} className="docx-download-button" type="button" onClick={download} disabled={!result || status === 'processing'}>
            <Download size={19} aria-hidden="true" /> {result ? 'Download editable DOCX' : 'Choose PDF to enable download'}
          </button>
        </div>
        {result ? <>
          <div className="docx-download-ready" role="status">
            <CheckCircle2 size={25} aria-hidden="true" />
            <div><h2>Conversion completed locally</h2><p>No PDF bytes or generated DOCX are sent to a FigureNest conversion server.</p></div>
          </div>
          <div className="docx-conversion-notes">
            <h3>Conversion notes</h3>
            <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
          </div>
        </> : null}
      </section>

      <div className="docx-information-sections">
        <section><h2>Important limitations</h2><ul>{definition.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2>Frequently asked questions</h2>{definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
      </div>
    </main>
  </Shell>;
}
