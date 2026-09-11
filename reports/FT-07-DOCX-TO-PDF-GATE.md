# FT-07 — DOCX → PDF research / fixture gate

Base production main: `6595c5ccd84ec5c9205eec4a2a430af3b216a2b3` (FT-05 Image → PDF production-green).

This file is the release gate for `/file-tools/docx-to-pdf`. A public route, catalog entry, sitemap entry, schema promise, or tool-count increase must not ship until the gate below passes on an exact branch head.

## Product position

The tool may ship only as a **browser-local, best-effort DOCX → PDF converter**. It must never claim Word-perfect fidelity, high-fidelity Office rendering, exact pagination, exact font matching, tracked-change fidelity, or preservation of all Word features.

Simple documents are the supported target: headings, paragraphs, lists, simple tables, inline images and ordinary hyperlinks. Complex Word layout loss is disclosed explicitly before export.

## Dependency direction

Primary spike:

- `mammoth@1.12.2` — BSD-2-Clause; semantic DOCX → HTML, browser-capable, not a layout-faithful Word renderer and does not sanitize output.
- `dompurify@3.4.15` — Apache-2.0 OR MPL-2.0; sanitizer candidate for all Mammoth-generated HTML before any preview DOM insertion.
- existing `pdf-lib@1.17.1` remains the approved PDF writer where suitable; do not add a second PDF framework without a demonstrated blocker.

Benchmark only:

- `docx-preview@0.4.0` — Apache-2.0. Compare accepted fixtures for visual fidelity, but do not select it solely because the preview looks more Word-like. Its public/stable surface must be reviewed before any production use.

All selected dependencies must be exact-version pinned and recorded with license, transitive dependency count, lazy chunk impact, maintenance/security notes and runtime-network behavior.

## OOXML / hostile-input preflight

Before Mammoth, docx-preview or any renderer sees document content, the local preflight must:

- accept `.docx` only; reject `.docm`, `.dotm`, `.xlsm`, `.pptm` and other macro-enabled/unsupported packages;
- verify ZIP/OOXML structure includes `[Content_Types].xml` and `word/document.xml`;
- validate extension, MIME and ZIP magic bytes rather than trusting the filename;
- cap ZIP entry count, total uncompressed size and compression ratio; reject suspicious recursive/decompression-bomb structures;
- cap source size using the shared 25 MB mobile / 75 MB desktop local-file limits;
- reject malformed relationships/object graphs safely;
- prohibit macro execution and active content;
- prohibit external relationship/resource loading (`http:`, `https:`, remote templates, external images, OLE/package links and similar fetch-capable relationships);
- never send file bytes, filenames, extracted text, HTML, images or generated PDF content to FigureNest APIs, analytics or logs.

## Sanitization gate

Mammoth output is untrusted HTML.

- Sanitize before preview or PDF layout.
- No unsanitized `dangerouslySetInnerHTML`.
- Strip scripts, event handlers, forms, iframes, embedded objects, unsafe SVG, `javascript:` URLs, remote-resource URLs and unsupported active content.
- Hyperlinks may remain only after protocol allow-listing.
- Embedded document images must resolve from local in-memory data only.
- Static/privacy tests must reject `fetch`, XHR, `sendBeacon`, WebSocket, form submission, IndexedDB/localStorage/sessionStorage persistence, runtime CDNs and remote document-resource loads containing file data or names.

## Fixture matrix

Every row must record: preview result, PDF result, known loss, mobile behavior and PASS / DISCLOSE / BLOCK.

1. Plain paragraphs and Unicode.
2. Heading hierarchy.
3. Ordered and unordered lists.
4. Nested lists.
5. Bold / italic / underline / basic inline emphasis.
6. Simple tables.
7. Merged cells / complex tables.
8. Inline PNG/JPEG images.
9. Local hyperlinks.
10. External hyperlinks (link may remain; no automatic fetch).
11. Manual page breaks.
12. Headers and footers.
13. Footnotes and endnotes.
14. Fields / generated values.
15. Comments.
16. Tracked changes.
17. Custom fonts / missing fonts.
18. Columns, text boxes, floating shapes and positioned objects.
19. Malformed ZIP / missing `word/document.xml`.
20. Macro-enabled or externally linked OOXML.
21. Oversized/high-compression-ratio hostile fixtures.

### Publication threshold

A release may proceed only if fixtures 1–6 and 8 produce clearly usable preview + reopenable PDF output on desktop and mobile, with no external fetches and no unsafe HTML. Failures in rows 7 and 11–18 may be DISCLOSE only when the result is understandable and not misleading; otherwise they BLOCK publication.

Rows 19–21 must fail safely and locally every time.

## PDF-output gate

A good HTML preview is not enough.

The PDF stage must:

- generate locally in the browser;
- reopen successfully in a PDF parser/viewer;
- preserve the accepted fixture subset in readable order;
- avoid clipped/invisible primary content on representative mobile and desktop page sizes;
- provide predictable page sizing and margins;
- disclose pagination/font/image limitations;
- expose progress, cancel and reset;
- release ArrayBuffers, Object URLs, temporary DOM/resources and output buffers on reset, navigation, cancellation, failure and completed download.

## Accessibility / UX gate

- Keyboard-operable file picker, preview controls, export, cancel and reset.
- Touch targets suitable for mobile.
- Status/error/progress live regions without noisy repeated announcements.
- Clear preview-before-download step.
- Clear statement: **Your file stays on this device** only after privacy tests pass.
- Limitations are visible before export, not hidden only in FAQ text.

## Performance / bundle gate

Record on the exact release head:

- initial-site gzip delta (route must remain lazy; target effectively zero outside shared metadata);
- Mammoth lazy chunk size;
- DOMPurify lazy chunk size;
- any benchmark-only dependency must not ship in production unless explicitly selected and justified;
- mobile processing time and peak-memory observations for small, medium and limit-adjacent fixtures;
- cleanup verification after repeated convert/reset cycles.

## Integration gate if publication is approved

The same PR must update all relevant sources of truth together:

- file-tools catalog;
- API catalog parity;
- File Tools category copy/count;
- route registry;
- related tools;
- SEO title/description/canonical;
- FAQ/tool schema where actually supported;
- sitemap/prerender/static audit;
- `toolApplicability` explicit unitless classification only if required by the existing parity contract;
- representative regressions for PDF Sign & Edit, PDF → JPG/PNG, JPG/PNG → PDF and PDF → Text.

## Stop condition

If the accepted fixture subset cannot produce a safe, readable, reopenable local PDF within the privacy, security, bundle and mobile limits, FT-07 is recorded as **not publishable in the current browser-only architecture**. Do not create a placeholder route or weaken the product promise to force release.