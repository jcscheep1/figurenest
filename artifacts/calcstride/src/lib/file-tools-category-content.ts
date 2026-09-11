import type { CategoryContent } from './category-content';

/** Visible category guidance for browser-local PDF and file utilities. */
export const fileToolsCategoryContent: CategoryContent = {
  introduction: [
    'PDF and file tasks often involve contracts, forms, invoices, IDs, reports, or other documents that should not need to leave your device just to make a small edit or conversion. FigureNest File Tools are designed around local browser processing wherever the format can be handled reliably without uploading the document to a conversion server.',
    'The current PDF tools cover fill-and-sign editing with highlights, freehand annotations, images, stamps and page operations, PDF page conversion to JPG or PNG, and text-layer extraction to TXT. Each tool uses explicit file, page, pixel, and memory limits because browser-local processing trades cloud uploads for the resources available on your own device. Keep the original file, especially for important documents.',
  ],
  questionsAnswered: [
    'Can I sign, annotate, rotate, reorder or delete pages in a PDF without uploading the document?',
    'Can I convert selected PDF pages to JPG or PNG and download several pages as one ZIP?',
    'Can I extract the existing text layer from a PDF without sending the document to an OCR service?',
    'What file, page, pixel, and memory limits apply to private browser-based PDF processing?',
  ],
  toolDescriptions: [
    { slug: 'pdf-sign-edit', description: 'Open a PDF locally, place fill-and-sign marks, highlights, freehand drawings, PNG/JPEG images and reviewed stamps, rotate or reorder pages, remove pages, then export a flattened edited copy from the browser.' },
    { slug: 'pdf-to-image', description: 'Render selected PDF pages locally as PNG or JPG images, with scale and JPG-quality controls and a local ZIP download for multiple pages.' },
    { slug: 'pdf-to-text', description: 'Extract the PDF text layer from selected pages locally, preview the result, and download a UTF-8 TXT file with clear page separators.' },
  ],
  choosingTools: [
    'Use PDF Sign & Edit when the goal is to fill, sign, annotate or manage pages in an existing PDF while keeping the document content in the browser. You can place highlights, freehand drawings, PNG/JPEG images and reviewed stamps, rotate pages in 90-degree steps, move pages earlier or later and remove pages while keeping at least one page. Page operations have their own undo and redo history, while annotations stay attached to their original source page.',
    'Use PDF to JPG/PNG when you need page images for sharing, previews, slides, websites, or image workflows. PNG is lossless and often better for text-heavy pages; JPG can be smaller for photographic pages. For many pages, convert in smaller groups if the browser reaches the stated output-memory limit.',
    'Use PDF to Text when the PDF already contains selectable text and you need a plain-text copy. It does not perform OCR. Scanned or image-only documents need a separate OCR workflow because FigureNest does not silently upload those pages to a recognition service.',
  ],
  unitCurrencyGuidance: [
    'File tools do not use measurement or currency preferences. Security and privacy matter instead: verify the selected file type, stay within the stated device limits, keep the original document, and do not rely on a browser export as a substitute for a legally required signing platform or identity-verification process.',
    'The current PDF tools process document bytes in the browser tab and do not send file names, added images, annotations, page-operation plans or document contents to FigureNest for editing, rendering, or text extraction. Normal page requests can still occur for the website itself, but they must not contain the selected document or generated output.',
  ],
  relatedGuides: [],
  faqs: [
    { question: 'Does FigureNest upload my PDF?', answer: 'The current PDF Sign & Edit, PDF to JPG/PNG, and PDF to Text tools are designed to process the selected document in your browser rather than upload it to a FigureNest conversion server.' },
    { question: 'What annotations can I add in PDF Sign & Edit?', answer: 'The editor supports translucent highlights, blue freehand drawings, PNG/JPEG images, and the reviewed APPROVED, REVIEWED and CONFIDENTIAL stamps alongside text and signing marks.' },
    { question: 'Can I rotate, reorder or delete PDF pages?', answer: 'Yes. PDF Sign & Edit supports 90-degree rotation, moving pages earlier or later, deleting pages while keeping at least one page, and undoing or redoing those page operations.' },
    { question: 'Can I use password-protected PDFs?', answer: 'No. Password-protected or encrypted PDFs are rejected by these releases instead of asking you to send a password or document to a server.' },
    { question: 'Does PDF to Text use OCR?', answer: 'No. It extracts text already present in the PDF. Image-only scans may return little or no text and need a separate OCR tool.' },
    { question: 'Why are there local conversion limits?', answer: 'Rendering pages, decoding uploaded images and creating ZIP files can use much more memory than the source file. The page, pixel, file-size, and output-size limits reduce browser crashes, particularly on phones and tablets.' },
  ],
};