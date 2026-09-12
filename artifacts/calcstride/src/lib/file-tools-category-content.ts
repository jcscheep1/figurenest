import type { CategoryContent } from './category-content';

/** Visible category guidance for browser-local PDF and file utilities. */
export const fileToolsCategoryContent: CategoryContent = {
  introduction: [
    'PDF and file tasks often involve contracts, forms, invoices, IDs, reports, photos, spreadsheets, or other files that should not need to leave your device just to make a small edit or conversion. FigureNest File Tools are designed around local browser processing wherever the format can be handled reliably without uploading the file to a conversion server.',
    'The current file tools cover fill-and-sign editing with annotations and page operations, PDF pages to JPG/PNG, ordered JPG/PNG images to PDF, text-layer extraction to TXT, best-effort DOCX to PDF conversion with a sanitized preview, selectable PDF text to editable DOCX reconstruction, and bounded CSV/XLSX spreadsheet conversion. Each tool uses explicit file, page, pixel, workbook-shape, and memory limits because browser-local processing trades cloud uploads for the resources available on your own device. Keep the original files, especially when metadata, print dimensions, color profiles, spreadsheet formatting, or legal document fidelity matter.',
  ],
  questionsAnswered: [
    'Can I sign, annotate, rotate, reorder or delete pages in a PDF without uploading the document?',
    'Can I convert selected PDF pages to JPG/PNG or combine ordered JPG/PNG images into a PDF locally?',
    'Can I extract the existing text layer from a PDF without sending the document to an OCR service?',
    'Can I convert a DOCX file to a best-effort PDF locally without uploading the document?',
    'Can I convert CSV and XLSX spreadsheets locally while keeping formula-looking text inert and workbook resources bounded?',
    'What file, page, pixel, workbook-shape, and memory limits apply to private browser-based file processing?',
  ],
  toolDescriptions: [
    { slug: 'pdf-sign-edit', description: 'Open a PDF locally, place fill-and-sign marks, highlights, freehand drawings, PNG/JPEG images and reviewed stamps, rotate or reorder pages, remove pages, then export a flattened edited copy from the browser.' },
    { slug: 'pdf-to-image', description: 'Render selected PDF pages locally as PNG or JPG images, with scale and JPG-quality controls and a local ZIP download for multiple pages.' },
    { slug: 'image-to-pdf', description: 'Combine ordered JPG/PNG files into one local PDF using A4 auto-orientation or image-sized pages, with reorder/remove controls before download.' },
    { slug: 'pdf-to-text', description: 'Extract the PDF text layer from selected pages locally, preview the result, and download a UTF-8 TXT file with clear page separators.' },
    { slug: 'docx-to-pdf', description: 'Convert a DOCX file locally to a sanitized best-effort browser preview, then create and download a PDF without uploading document bytes, names, or extracted content.' },
    { slug: 'pdf-to-docx', description: 'Convert selectable PDF text into an editable DOCX locally, with explicit OCR-required, password-protected, image-placement and complex-layout limitations instead of claiming pixel-perfect PDF-to-Word fidelity.' },
    { slug: 'csv-to-xlsx', description: 'Convert UTF-8 CSV values into a single-sheet XLSX workbook locally, with delimiter controls, inert formula-looking text, bounded workbook shape, and local package validation before download.' },
    { slug: 'xlsx-to-csv', description: 'Inspect an XLSX package locally, choose one worksheet, and export injection-safe CSV without executing workbook formulas or uploading spreadsheet contents.' },
  ],
  choosingTools: [
    'Use PDF Sign & Edit when the goal is to fill, sign, annotate or manage pages in an existing PDF while keeping the document content in the browser. Page operations have their own undo and redo history, while annotations stay attached to their original source page.',
    'Use PDF to JPG/PNG when you need page images for sharing, previews, slides, websites, or image workflows. PNG is lossless and often better for text-heavy pages; JPG can be smaller for photographic pages. For many pages, convert in smaller groups if the browser reaches the stated output-memory limit.',
    'Use JPG/PNG to PDF when you already have images and need one ordered PDF. A4 auto-orientation gives a predictable paper size; Fit page to image follows decoded pixel dimensions as PDF points and deliberately does not guess physical size from DPI metadata.',
    'Use PDF to Text when the PDF already contains selectable text and you need a plain-text copy. It does not perform OCR. Scanned or image-only documents need a separate OCR workflow because FigureNest does not silently upload those pages to a recognition service.',
    'Use DOCX to PDF for ordinary Word documents when a private best-effort PDF is sufficient. Review the sanitized preview before export because complex pagination, fonts, fields, tracked changes, headers and footers may differ from Microsoft Word.',
    'Use PDF Text to Editable DOCX when the PDF already has selectable text and editability matters more than exact visual reconstruction. Scans need OCR, raster-image placement is not preserved, and complex columns, tables, fonts and pagination can differ.',
    'Use CSV to XLSX when plain tabular CSV data needs an Excel-compatible workbook. The converter creates one worksheet and treats formula-looking values as text; CSV cannot supply workbook formatting, charts, macros, or formulas that were never present in the source format.',
    'Use XLSX to CSV when one worksheet needs a plain-text export. The workbook package is checked before parsing, formulas are not evaluated, and the CSV serializer neutralizes formula-leading text while preserving genuine negative numbers.',
  ],
  unitCurrencyGuidance: [
    'File tools do not use measurement or currency preferences. Security and privacy matter instead: verify the selected file type, stay within the stated device limits, keep original files, and do not rely on a browser export as a substitute for a legally required signing platform or identity-verification process.',
    'The current PDF, image, DOCX, CSV, and XLSX tools process selected bytes in the browser tab and do not send file names, images, annotations, page-operation plans, extracted text, document or spreadsheet content, or generated output to FigureNest for conversion. Normal page requests can still occur for the website itself, but they must not contain selected file content or names.',
  ],
  relatedGuides: [],
  faqs: [
    { question: 'Does FigureNest upload my PDF, images, documents, or spreadsheets?', answer: 'The current File Tools are designed to process supported PDF, image, DOCX, CSV, and XLSX files in your browser rather than upload them to a FigureNest conversion server.' },
    { question: 'What annotations can I add in PDF Sign & Edit?', answer: 'The editor supports translucent highlights, blue freehand drawings, PNG/JPEG images, and the reviewed APPROVED, REVIEWED and CONFIDENTIAL stamps alongside text and signing marks.' },
    { question: 'Can I rotate, reorder or delete PDF pages?', answer: 'Yes. PDF Sign & Edit supports 90-degree rotation, moving pages earlier or later, deleting pages while keeping at least one page, and undoing or redoing those page operations.' },
    { question: 'Can I control JPG/PNG to PDF page order?', answer: 'Yes. The image list is the PDF page order. Move images up or down, remove any image, choose A4 or image-sized pages, then create the PDF locally.' },
    { question: 'Can I use password-protected PDFs?', answer: 'No. Password-protected or encrypted PDFs are rejected by these releases instead of asking you to send a password or document to a server.' },
    { question: 'Does PDF to Text use OCR?', answer: 'No. It extracts text already present in the PDF. Image-only scans may return little or no text and need a separate OCR tool.' },
    { question: 'Can spreadsheet formulas execute during CSV/XLSX conversion?', answer: 'FigureNest does not evaluate workbook formulas, and formula-looking CSV input is written as inert text. CSV export also neutralizes formula-leading text that could otherwise execute when opened in spreadsheet software.' },
    { question: 'Why are there local conversion limits?', answer: 'Rendering PDF pages, decoding images, parsing workbook packages, and creating output files can use much more memory than the source file. Page, pixel, file-size, workbook-shape, and output-size limits reduce browser crashes, particularly on phones and tablets.' },
  ],
};