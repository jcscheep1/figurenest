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
    description: 'Sign, fill and annotate a PDF, then rotate, reorder or delete pages and download the edited copy without uploading the document.',
    category: FILE_TOOLS_CATEGORY.name,
    categorySlug: FILE_TOOLS_CATEGORY.slug,
    href: '/file-tools/pdf-sign-edit',
    tags: ['sign pdf', 'edit pdf', 'annotate pdf', 'highlight pdf', 'rotate pdf pages', 'reorder pdf pages', 'delete pdf pages', 'add image to pdf', 'add signature to pdf', 'fill pdf', 'pdf signer', 'pdf editor', 'private pdf tool'],
    featured: false,
    h1: 'Sign & Edit a PDF Online',
    seoTitle: 'Free PDF Sign, Edit & Manage Pages | Private Browser | FigureNest',
    seoDescription: 'Sign and edit a PDF in your browser. Add annotations and images, rotate, reorder or delete pages, then export without uploading the document.',
    privacySummary: 'Your PDF is processed in this browser tab. FigureNest does not upload the document, its name, its extracted contents, signatures, added images, annotations, page plan, or the edited result.',
    limitations: [
      'The editor supports fill-and-sign marks, highlights, freehand drawings, PNG/JPEG images, reviewed stamps, 90-degree page rotation, page reordering and page deletion. At least one page must remain.',
      'Password-protected or encrypted PDFs are rejected rather than sent to a server or silently altered.',
      'Typed text uses a standard embedded PDF font. Existing PDF fonts, form-field appearances and complex document scripts are not reused or executed.',
      'Uploaded PNG/JPEG files are validated by type and signature, limited to 10 MB, and decoded dimensions must stay within the local image-pixel guard. Metadata, animation and unsupported image features are not preserved.',
    ],
    faqs: [
      { question: 'Does FigureNest upload my PDF?', answer: 'No. The PDF editor reads and modifies the selected document in your browser. Normal website assets or consent-controlled analytics may make ordinary page requests, but document names, bytes, signatures, added images, annotations, page operations and edited contents are not included in those requests.' },
      { question: 'What can I add to the PDF?', answer: 'You can add typed text, initials, a date, checkmarks, a drawn or uploaded signature, translucent highlights, freehand drawings, PNG/JPEG images and the built-in APPROVED, REVIEWED and CONFIDENTIAL stamps.' },
      { question: 'Can I rotate, reorder or delete PDF pages?', answer: 'Yes. Rotate pages left or right in 90-degree steps, move the current page earlier or later, or delete it. A separate page-operation undo and redo history lets you restore page changes, and the editor will not let you delete the final remaining page.' },
      { question: 'What happens to annotations when I move or delete a page?', answer: 'Annotations stay attached to their original source page while pages are reordered. Deleting a page hides its annotations from the export; undoing that page deletion restores the page with those annotations.' },
      { question: 'Can I undo annotations and image changes?', answer: 'Yes. Edit additions, moves, resizes, text changes and deletions use the edit undo/redo history. Page rotation, reordering and deletion use a separate page-operation undo/redo history.' },
      { question: 'Can I edit a password-protected PDF?', answer: 'Not in this version. Encrypted or password-protected PDFs are rejected locally so the tool does not ask you to send a password or document to a server.' },
      { question: 'Will the downloaded PDF remain editable?', answer: 'The marks added by this tool are flattened into the exported PDF page content. Keep the original file if you may need to make a different set of changes later.' },
    ],
    relatedRoutes: ['/file-tools/pdf-to-image', '/file-tools/image-to-pdf', '/file-tools/pdf-to-text'],
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
    relatedRoutes: ['/file-tools/image-to-pdf', '/file-tools/pdf-sign-edit', '/file-tools/pdf-to-text'],
  },
  'image-to-pdf': {
    slug: 'image-to-pdf',
    name: 'JPG/PNG to PDF',
    description: 'Turn ordered JPG and PNG images into a PDF locally in your browser, with A4 or image-sized pages and no image upload.',
    category: FILE_TOOLS_CATEGORY.name,
    categorySlug: FILE_TOOLS_CATEGORY.slug,
    href: '/file-tools/image-to-pdf',
    tags: ['jpg to pdf', 'jpeg to pdf', 'png to pdf', 'image to pdf', 'photos to pdf', 'private image converter', 'browser pdf maker'],
    featured: false,
    h1: 'Convert JPG or PNG Images to PDF',
    seoTitle: 'Free JPG/PNG to PDF Converter | No Upload | FigureNest',
    seoDescription: 'Combine ordered JPG and PNG images into one PDF locally in your browser. Choose A4 auto-orientation or image-sized pages and download without uploading files.',
    privacySummary: 'Your selected JPG/PNG files, names, previews and generated PDF stay in this browser tab. FigureNest does not upload or store the image content or output.',
    limitations: [
      'This release accepts JPG/JPEG and PNG only. Each image becomes one PDF page in the order shown, with up to 100 images and the local decoded-pixel/input-size guards.',
      'A4 auto-orientation fits each image inside an A4 portrait or landscape page. Fit-to-image uses decoded pixel dimensions as PDF points and does not treat DPI metadata as a reliable physical print size.',
      'PNG transparency, JPEG compression, embedded color profiles and metadata can render differently between image decoders and PDF viewers. Keep the original images when exact archival color/metadata fidelity matters.',
      'Image metadata such as EXIF/GPS/camera fields is not copied into PDF document metadata by this tool. The visible pixels are the intended conversion result.',
    ],
    faqs: [
      { question: 'Does FigureNest upload my photos or images?', answer: 'No. The files are validated, decoded for resource checks, ordered and embedded into the PDF in your browser. Image bytes, names, previews and the generated PDF are not sent to a FigureNest conversion server.' },
      { question: 'Can I control the page order?', answer: 'Yes. Add multiple JPG/PNG files, then use Move up and Move down before creating the PDF. The displayed order is the exported PDF page order.' },
      { question: 'What is the difference between A4 and Fit page to image?', answer: 'A4 auto-orientation places each image inside an A4 portrait or landscape page with a small margin. Fit page to image uses the decoded image aspect and pixel dimensions for the PDF page, scaled down only if a page would exceed the PDF page-size guard.' },
      { question: 'Does the converter preserve image DPI and metadata?', answer: 'It does not use DPI metadata to infer physical page size and it does not copy EXIF/GPS/camera metadata into PDF document metadata. Use A4 mode when a predictable paper size matters.' },
      { question: 'How many images can I add?', answer: 'Up to 100 images, subject to the combined device input-size limit and the 40-megapixel decoded-image limit for each file.' },
    ],
    relatedRoutes: ['/file-tools/pdf-to-image', '/file-tools/pdf-sign-edit', '/privacy'],
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
