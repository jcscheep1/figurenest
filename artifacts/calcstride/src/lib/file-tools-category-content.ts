import type { CategoryContent } from './category-content';

/** Visible category guidance for browser-local PDF and file utilities. */
export const fileToolsCategoryContent: CategoryContent = {
  introduction: [
    'PDF and file tasks often involve contracts, forms, invoices, IDs, or other documents that should not need to leave your device just to make a small edit. FigureNest File Tools are designed around local browser processing wherever the format can be handled reliably without uploading the document to a conversion server.',
    'PDF Sign & Edit is the first tool in this category. It renders the selected PDF in your browser, lets you place fill-and-sign items, and creates the edited download locally. Browser limits, encrypted documents, malformed files, and complex document features can still prevent a file from being processed, so keep the original copy.',
  ],
  questionsAnswered: [
    'Can I add text, initials, a date, a check mark, or a signature to a PDF without uploading the document?',
    'What file and page limits apply when editing a PDF in the browser?',
    'Why can an encrypted, malformed, or unusually complex PDF fail even when it opens elsewhere?',
    'How should I protect the original document when exporting a flattened edited copy?',
  ],
  toolDescriptions: [
    { slug: 'pdf-sign-edit', description: 'Open a PDF locally, place text, initials, dates, check marks, drawn or uploaded signatures, then export a flattened edited copy from the browser.' },
  ],
  choosingTools: [
    'Use PDF Sign & Edit when the goal is to fill or sign an existing PDF while keeping the document content in the browser. Keep a separate original file because the exported copy is flattened for dependable viewing rather than intended as a fully editable source document.',
    'If the task is conversion rather than signing, use a dedicated converter once that format is available in this category. FigureNest will distinguish reliable browser-native conversions from best-effort formats instead of implying perfect Office or PDF fidelity.',
  ],
  unitCurrencyGuidance: [
    'File tools do not use measurement or currency preferences. Security and privacy matter instead: verify the selected file type, stay within the stated device limits, keep the original document, and do not rely on a browser export as a substitute for a legally required signing platform or identity-verification process.',
    'The current PDF editor processes document bytes in the browser tab and does not send file names or document contents to FigureNest for editing. Normal page requests can still occur for the website itself, but they must not contain the selected document or its contents.',
  ],
  relatedGuides: [],
  faqs: [
    { question: 'Does FigureNest upload my PDF to edit it?', answer: 'The PDF Sign & Edit tool is designed to process the selected document in your browser rather than upload the PDF to a FigureNest conversion server.' },
    { question: 'Can I edit a password-protected PDF?', answer: 'No. Password-protected or encrypted PDFs are rejected by this release instead of asking you to send a password or document to a server.' },
    { question: 'Will the downloaded PDF remain fully editable?', answer: 'No. Added marks are flattened into the exported PDF for dependable viewing. Keep the original document if you may need to edit the source again.' },
    { question: 'Is a drawn signature the same as a verified digital signature?', answer: 'No. This tool places a visual signature mark. It does not create a certificate-backed digital signature or verify a signer’s identity.' },
  ],
};
