# FT-08 — PDF → editable DOCX research gate

Status: **RESEARCH ONLY / NOT PUBLISHABLE** until the gate below passes.

## Product promise under evaluation

FigureNest may offer a browser-local **PDF → editable DOCX** tool only for PDFs with a usable selectable text layer. The first gate is intentionally text-first and conservative: it must not claim pixel-perfect reconstruction, OCR, or faithful recovery of arbitrary PDF layout.

Expected safe v1 semantics:
- parse the selected PDF locally with the already-pinned `pdfjs-dist@6.3.289`;
- extract selectable text plus defensible paragraph/line ordering metadata in a worker;
- generate DOCX locally in-browser;
- preserve useful text, paragraphs, basic emphasis/list/table structure only when recoverable with evidence;
- clearly label layout reconstruction as best-effort;
- reject or clearly classify image-only/scanned PDFs rather than silently uploading them or pretending OCR occurred;
- no file bytes, filename, extracted text, generated DOCX, or document-derived telemetry may leave the browser.

## Dependency / license preflight

### Existing PDF parser
`pdfjs-dist@6.3.289` is already pinned in Calcstride. npm identifies it as Apache-2.0, browser-oriented PDF.js distribution, with zero package dependencies. Reuse it rather than introducing another PDF parser.

Source: https://www.npmjs.com/package/pdfjs-dist

### Candidate DOCX generator
`docx@9.7.1` is the leading spike candidate. npm reports MIT licensing, browser support, ~3M+ weekly downloads, and first-party browser/React examples.

Source: https://www.npmjs.com/package/docx

**Dependency caution:** `docx@9.7.1` currently depends on `xml-js`; upstream issue #3471 (opened 2026-06-18) calls out that dependency as effectively unmaintained. Before adoption, the exact transitive tree and browser bundle must be reviewed and pinned. Do not substitute an unofficial fork merely to hide this concern.

Source: https://github.com/dolanmiu/docx/issues/3471

## Security / privacy gate

Any spike must prove all of the following before route publication:
1. PDF parsing and DOCX creation are browser-local and route-lazy.
2. Worker/resource URLs are same-origin or bundled; no CDN, proxy, conversion API, CORS relay, remote font/resource fetch, or document-derived request is allowed.
3. Malformed/hostile PDF handling is bounded by file size/page count/time/memory limits and fails closed.
4. Network interception proves no PDF bytes, filename, extracted text, image data, generated DOCX, or document-derived sentinel leaves the tab.
5. localStorage/sessionStorage/IndexedDB/caches do not retain document-derived data after reset/unmount.
6. Generated DOCX reopens successfully in an independent parser/validator in CI.
7. Formula/action/embedded-file/annotation URLs from PDFs are not carried into DOCX as active content without an explicit safe protocol policy.

## Fidelity fixture gate

Minimum research matrix:
1. plain multi-paragraph selectable text;
2. headings + bold/italic spans where recoverable;
3. bullets/numbered lists;
4. two-column PDF — must either reconstruct acceptably or explicitly flatten with a warning;
5. simple table — must either reconstruct acceptably or explicitly flatten with a warning;
6. mixed text + local raster image;
7. scanned/image-only PDF — explicit unsupported/OCR-required state, not empty success;
8. encrypted/restricted PDF — explicit safe failure;
9. malformed/hostile PDF;
10. long document on mobile-class limits.

Acceptance requires useful editable text with deterministic reading order on fixtures 1–3, reopenable DOCX output, bounded behavior on 7–10, and truthful warnings for any structure that cannot be reconstructed reliably.

## Stop / pivot conditions

Mark FT-08 **NOT PUBLISHABLE** and advance if any of these remain true after a bounded spike:
- reliable reading order cannot be recovered for ordinary selectable-text PDFs;
- browser-local DOCX generation has unacceptable memory/mobile cost;
- exact dependency review produces an unresolved security/license concern;
- privacy interception cannot prove zero document-data egress;
- generated DOCX files do not reopen reliably;
- useful output would require server-side conversion or a copyleft/commercial dependency that has not been explicitly approved.

If rejected, keep the evidence and consider a narrower product such as **PDF → editable text/structured DOCX (selectable-text PDFs only)** rather than overstating fidelity.

## Next spike decision

Allowed next work: exact-pin/dependency-tree review for `docx@9.7.1`, followed by an unpublished worker-only fixture spike using the existing `pdfjs-dist@6.3.289`. No catalog/route/schema/sitemap/tool-count change is allowed until this research gate passes.