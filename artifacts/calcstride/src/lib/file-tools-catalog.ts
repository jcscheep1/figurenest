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
    relatedRoutes: ['/calculators', '/privacy'],
  },
} as const satisfies Record<string, FileToolDefinition>;

export type FileToolSlug = keyof typeof fileToolDefinitions;
export const fileToolSlugs = Object.keys(fileToolDefinitions) as FileToolSlug[];
export const fileToolCatalog = fileToolSlugs.map((slug) => fileToolDefinitions[slug]);

export function isFileToolSlug(value: string): value is FileToolSlug {
  return Object.prototype.hasOwnProperty.call(fileToolDefinitions, value);
}
