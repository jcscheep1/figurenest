import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Shell } from '@/components/FigureNestShell';
import { LocalFileDropzone } from '@/components/LocalFileDropzone';
import { Link } from '@/components/PublicLink';
import { Seo } from '@/pages/AppPages';
import type { FileDeviceClass, FileJobStatus } from '@/lib/file-tools-foundation';
import { convertDocxToSanitizedHtml, exportSanitizedPreviewToPdf } from '@/lib/docx-to-pdf-spike';
import { fileToolDefinitions } from '@/lib/file-tools-catalog';
import '@/styles/file-tools.css';

function deviceClass(): FileDeviceClass {
  if (typeof window === 'undefined') return 'desktop';
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024 ? 'mobile' : 'desktop';
}

export function DocxToPdfPage() {
  const definition = fileToolDefinitions['docx-to-pdf'];
  const [status, setStatus] = useState<FileJobStatus>('idle');
  const [fileName, setFileName] = useState('');
  const [html, setHtml] = useState('');
  const [messages, setMessages] = useState<readonly string[]>([]);
  const [error, setError] = useState('');
  const [pdf, setPdf] = useState<Blob | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previewRef = useRef<HTMLElement | null>(null);

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle'); setFileName(''); setHtml(''); setMessages([]); setError(''); setPdf(null);
  };
  useEffect(() => () => abortRef.current?.abort(), []);

  const select = async (file: File) => {
    reset();
    const controller = new AbortController();
    abortRef.current = controller;
    setFileName(file.name);
    setStatus('processing');
    try {
      const result = await convertDocxToSanitizedHtml(file, deviceClass(), controller.signal);
      if (controller.signal.aborted) return;
      setHtml(result.html); setMessages(result.messages); setStatus('ready');
    } catch (caught) {
      if (controller.signal.aborted) { setStatus('cancelled'); return; }
      setError(caught instanceof Error ? caught.message : 'The DOCX file could not be converted locally.');
      setStatus('failed');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const createPdf = async () => {
    if (!previewRef.current) return;
    setStatus('processing'); setError('');
    try {
      const blob = await exportSanitizedPreviewToPdf(previewRef.current, { filename: fileName });
      setPdf(blob); setStatus('succeeded');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The PDF could not be created locally.');
      setStatus('failed');
    }
  };

  const download = () => {
    if (!pdf) return;
    const url = URL.createObjectURL(pdf);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileName.replace(/\.docx$/i, '') || 'document'}.pdf`; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return <Shell>
    <Seo title={definition.seoTitle} description={definition.seoDescription} path={definition.href} />
    <main className="tool-page file-tool-page">
      <nav className="calc-breadcrumb" aria-label="Breadcrumb">
        <Link href="/"><ArrowLeft size={15} aria-hidden="true" /> Home</Link>
        <Link href="/category/file-tools">PDF &amp; File Tools</Link>
        <span aria-current="page">/ DOCX TO PDF</span>
      </nav>
      <header className="file-tool-hero">
        <p className="eyebrow">Private browser file tool</p>
        <h1>{definition.h1}</h1>
        <p>{definition.description}</p>
        <p><strong>Your files stay on this device.</strong> {definition.privacySummary}</p>
      </header>
      <LocalFileDropzone accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" status={status} fileName={fileName || undefined} error={error || undefined} onSelect={select} onCancel={() => abortRef.current?.abort()} onReset={reset} />
      {html ? <section aria-labelledby="docx-preview-heading">
        <h2 id="docx-preview-heading">Preview before download</h2>
        <p>This is a best-effort document layout. Complex Word pagination, fonts, fields, tracked changes, headers and footers may differ from Word.</p>
        <article ref={previewRef} className="file-tool-preview" dangerouslySetInnerHTML={{ __html: html }} />
        {messages.length ? <details><summary>Conversion notes</summary><ul>{messages.map((message, index) => <li key={index}>{message}</li>)}</ul></details> : null}
        <button type="button" onClick={createPdf} disabled={status === 'processing'}>Create PDF locally</button>
      </section> : null}
      {pdf ? <section aria-live="polite"><h2>PDF ready</h2><button type="button" onClick={download}><Download size={16} aria-hidden="true" /> Download PDF</button></section> : null}
      <section><h2>Important limitations</h2><ul>{definition.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h2>Frequently asked questions</h2>{definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
    </main>
  </Shell>;
}
