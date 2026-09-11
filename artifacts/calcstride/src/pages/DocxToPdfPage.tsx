import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Download } from 'lucide-react';
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

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${fileName.replace(/\.docx$/i, '') || 'document'}.pdf`; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const createAndDownloadPdf = async () => {
    if (!previewRef.current) return;
    setStatus('processing'); setError('');
    try {
      const blob = await exportSanitizedPreviewToPdf(previewRef.current, { filename: fileName });
      setPdf(blob); setStatus('succeeded'); downloadBlob(blob);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The PDF could not be created locally.');
      setStatus('failed');
    }
  };

  const download = () => {
    if (!pdf) return;
    downloadBlob(pdf);
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
      <section className="file-upload-panel docx-workflow-step" aria-label="Step 1: Choose DOCX file">
        <p className="docx-step-label"><span>1</span> Upload your Word document</p>
        <LocalFileDropzone accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" status={status} fileName={fileName || undefined} error={error || undefined} onSelect={select} onCancel={() => abortRef.current?.abort()} onReset={reset} />
      </section>
      {html ? <section className="docx-preview-step docx-workflow-step" aria-labelledby="docx-preview-heading">
        <p className="docx-step-label"><span>2</span> Review and download</p>
        <div className="docx-preview-heading-row">
          <div><h2 id="docx-preview-heading">Document preview</h2><p>Check the document below, then use the blue button to download your PDF.</p></div>
          <button className="docx-download-button" type="button" onClick={createAndDownloadPdf} disabled={status === 'processing'}><Download size={19} aria-hidden="true" /> {status === 'processing' ? 'Creating PDF…' : 'Convert and download PDF'}</button>
        </div>
        <p className="docx-layout-note">Complex Word pagination, fonts, fields, tracked changes, headers and footers may differ from Word.</p>
        <div className="docx-preview-frame"><article ref={previewRef} className="file-tool-preview" dangerouslySetInnerHTML={{ __html: html }} /></div>
        {messages.length ? <details className="docx-conversion-notes"><summary>Conversion notes</summary><ul>{messages.map((message, index) => <li key={index}>{message}</li>)}</ul></details> : null}
      </section> : null}
      {pdf ? <section className="docx-download-ready" aria-live="polite"><CheckCircle2 size={25} aria-hidden="true" /><div><h2>Your PDF has downloaded</h2><p>If the download did not open, tap the button again.</p></div><button type="button" onClick={download}><Download size={18} aria-hidden="true" /> Download PDF again</button></section> : null}
      <div className="docx-information-sections">
        <section><h2>Important limitations</h2><ul>{definition.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2>Frequently asked questions</h2>{definition.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</section>
      </div>
    </main>
  </Shell>;
}
