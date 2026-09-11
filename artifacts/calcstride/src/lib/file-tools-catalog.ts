export const FILE_TOOLS_CATEGORY = {
  slug: 'file-tools',
  name: 'PDF & File Tools',
  description: 'Edit, sign, convert, and extract files locally in your browser with clear privacy and format limits.',
  accent: '#5b89a8',
} as const;

export type FileToolDefinition = {
  slug: string;
  name: string;
  description: string;
  category: typeof FILE_TOOLS_CATEGORY.name;
  categorySlug: typeof FILE_TOOLS_CATEGORY.slug;
  href: string;
  tags: readonly string[];
  featured: boolean;
  h1: string;
  seoTitle: string;
  seoDescription: string;
  privacySummary: string;
  limitations: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  relatedRoutes: readonly string[];
};

export const fileToolDefinitions = {
  'pdf-sign-edit': {
    slug: 'pdf-sign-edit',
    name: 'PDF Sign & Edit',
    description: 'Sign a PDF, add text, initials, dates and checkmarks, then download the edited PDF without uploading the document.',
    category: FILE_TOOLS_CATEGORY.name,
    categorySlug: FILE_TOOLS_CATEGORY.slug,
    href: '/file-tools/pdf-sign-edit',
    tags: ['sign pdf', 'edit pdf', 'add signature to pdf', 'fill pdf', 'pdf signer', 'pdf editor', 'private pdf tool'],
    featured: false,
    h1: 'Sign & Edit a PDF Online',
    seoTitle: 'Free PDF Sign & Edit Tool | Private Browser | FigureNest',
    seoDescription: 'Sign and edit a PDF in your browser. Add text, initials, dates, checkmarks or a signature, then export the edited PDF without uploading the file.',
    privacySummary: 'Your PDF is processed in this browser tab. FigureNest does not upload the document, its name, its extracted contents, signatures, or the edited result.',
    limitations: [
      'This first editor release adds fill-and-sign marks. Highlighting, general annotations, image stamps, page rotation, reordering and deletion are planned separately.',
      'Password-protected or encrypted PDFs are rejected rather than sent to a server or silently altered.',
      'Typed text uses a standard embedded PDF font. Existing PDF fonts, form-field appearances and complex document scripts are not reused or executed.',
      'Uploaded signature images support PNG and JPEG. Very large images or files outside the local resource limits are rejected before editing.',
    ],
    faqs: [
      { question: 'Does FigureNest upload my PDF?', answer: 'No. The PDF editor reads and modifies the selected document in your browser. Normal website assets or consent-controlled analytics may make ordinary page requests, but document names, bytes, signatures and edited contents are not included in those requests.' },
      { question: 'Can I type or draw my signature?', answer: 'Yes. You can draw a signature with a mouse, pen or touch input, or upload a PNG or JPEG signature image. You can also add typed text, initials, a date and checkmarks.' },
      { question: 'Can I undo changes before downloading?', answer: 'Yes. Fill-and-sign object additions, moves, resizes, edits and deletions are kept in an in-memory undo and redo history for the current document.' },
      { question: 'Can I edit a password-protected PDF?', answer: 'Not in this version. Encrypted or password-protected PDFs are rejected locally so the tool does not ask you to send a password or document to a server.' },
      { question: 'Will the downloaded PDF remain editable?', answer: 'The marks added by this tool are flattened into the exported PDF page content. Keep the original file if you may need to make a different set of changes later.' },
    ],
    relatedRoutes: ['/file-tools/pdf-to-image', '/file-tools/pdf-to-text', '/privacy'],
  },
  'pdf-to-image': {
    slug: 'pdf-to-image',
    name: 'PDF to JPG/PNG',
    description: 'Convert selected PDF pages to JPG or PNG images in your browser, with a ZIP download for multiple pages and no document upload.',
    category: FILE_TOOLS_CATEGORY.name,
    categorySlug: FILE_TOOLS_CATEGORY.slug,
    href: '/file-tools/pdf-to-image',
    tags: ['pdf to jpg', 'pdf to png', 'pdf to image', 'convert pdf pages', 'private pdf converter', 'browser pdf converter'],
    featured: false,
    h1: 'Convert PDF to JPG or PNG',
    seoTitle: 'Free PDF to JPG/PNG Converter | Private Browser | FigureNest',
    seoDescription: 'Convert PDF pages to JPG or PNG locally in your browser. Choose pages, scale and JPG quality, then download one image or a ZIP without uploading the PDF.',
    privacySummary: 'The PDF and generated images stay in this browser tab. FigureNest does not upload the document, its name, page contents, or converted image output.',
    limitations: [
      'Up to 30 selected pages can be converted in one run so multi-image ZIP creation stays within predictable browser memory limits.',
      'Each rendered page must remain under the stated pixel limit at the chosen scale. Reduce the scale if an unusually large PDF page exceeds that limit.',
      'Password-protected or encrypted PDFs are rejected locally rather than sent to a conversion service.',
      'This tool renders the visible PDF page. It does not preserve PDF text, links, forms, layers, vector editability, animation, audio, video or embedded files in the image output.',
    ],
    faqs: [
      { question: 'Does FigureNest upload my PDF to convert it?', answer: 'No. PDF.js renders the selected pages in your browser and the browser encodes the resulting canvases as JPG or PNG files. The selected document is not sent to a FigureNest conversion server.' },
      { question: 'Can I convert only certain PDF pages?', answer: 'Yes. Enter all, a single page such as 2, or ranges such as 1,3-5. Page numbers are validated against the local PDF before conversion.' },
      { question: 'What happens when I convert several pages?', answer: 'FigureNest packages the generated images into a ZIP file locally in memory so you receive one download rather than many browser download prompts.' },
      { question: 'Should I use JPG or PNG?', answer: 'PNG is lossless and often better for diagrams, screenshots and text-heavy pages. JPG can make photographic pages smaller and includes an adjustable quality setting.' },
      { question: 'Why is there a 30-page limit per conversion?', answer: 'Rendered images can consume much more memory than the source PDF. The per-run limit and output-size guard reduce browser crashes, especially on phones and tablets.' },
    ],
    relatedRoutes: ['/file-tools/pdf-sign-edit', '/file-tools/pdf-to-text', '/privacy'],
  },
  'pdf-to-text': {
    slug: 'pdf-to-text',
    name: 'PDF to Text',
    description: 'Extract the text layer from selected PDF pages locally in your browser and download a plain-text file without uploading the document.',
    category: FILE_TOOLS_CATEGORY.name,
    categorySlug: FILE_TOOLS_CATEGORY.slug,
    href: '/file-tools/pdf-to-text',
    tags: ['pdf to text', 'extract text from pdf', 'pdf text extractor', 'private pdf text', 'pdf txt converter'],
    featured: false,
    h1: 'Extract Text from a PDF',
    seoTitle: 'Free PDF to Text Extractor | No Upload | FigureNest',
    seoDescription: 'Extract text from selected PDF pages locally in your browser and download a TXT file. No upload and no OCR: image-only scans may contain no extractable text.',
    privacySummary: 'The PDF and extracted text stay in this browser tab. FigureNest does not upload the document, its name, its text layer, or the generated TXT output.',
    limitations: [
      'This tool extracts text already stored in the PDF. It does not run OCR, so scanned or image-only PDFs may return little or no text.',
      'PDF text is stored as positioned fragments rather than paragraphs. Reading order, columns, tables, ligatures and complex scripts may not reproduce exactly as they appear visually.',
      'Password-protected or encrypted PDFs are rejected locally rather than sent to a server.',
      'Images, formatting, fonts, links, forms and page layout are not preserved in the plain-text download.',
    ],
    faqs: [
      { question: 'Does FigureNest upload the PDF or extracted text?', answer: 'No. PDF.js reads the text layer in your browser. The selected PDF, filename, extracted text and TXT output are not sent to a FigureNest conversion server.' },
      { question: 'Does PDF to Text use OCR?', answer: 'No. This release deliberately performs text-layer extraction only. Scanned pages that contain only images need a separate OCR tool.' },
      { question: 'Can I extract text from selected pages?', answer: 'Yes. Enter all, a single page, or ranges such as 1,3-5. The downloaded text keeps clear page separators for the selected pages.' },
      { question: 'Why can the reading order look different from the PDF?', answer: 'PDFs often store words as positioned drawing instructions rather than semantic paragraphs. Multi-column layouts, tables and complex scripts can therefore extract in an imperfect order.' },
      { question: 'What file do I download?', answer: 'The result is a UTF-8 plain-text TXT file with page separators. It contains text only and intentionally does not preserve the PDF layout or images.' },
    ],
    relatedRoutes: ['/file-tools/pdf-sign-edit', '/file-tools/pdf-to-image', '/privacy'],
  },
} as const satisfies Record<string, FileToolDefinition>;

export type FileToolSlug = keyof typeof fileToolDefinitions;
export const fileToolSlugs = Object.keys(fileToolDefinitions) as FileToolSlug[];
export const fileToolCatalog = fileToolSlugs.map((slug) => fileToolDefinitions[slug]);

export function isFileToolSlug(value: string): value is FileToolSlug {
  return Object.prototype.hasOwnProperty.call(fileToolDefinitions, value);
}
