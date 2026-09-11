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

**Exact lock evidence (2026-09-11):** the FigureNest pnpm lock resolves `docx` exactly to `9.7.1` and resolves its `xml-js` range to `xml-js@1.6.11`, whose only locked dependency is `sax@1.6.1`. This is materially better evidence than treating the declared `^1.6.8` range as the installed version. The package remains MIT and browser-capable, but this does **not** clear the maintenance gate by itself.

**Maintenance caution remains:** upstream docx issue #3471 (opened 2026-06-18) calls out `xml-js` as effectively unmaintained. The research lane may continue with the exact locked tree for bounded CI/browser experiments because generated DOCX output is produced from FigureNest-controlled structures rather than parsing untrusted XML through `xml-js`, but publication still requires an explicit dependency-risk disposition. Do not substitute an unofficial fork merely to hide this concern. If the dependency remains in the shipped browser bundle, record bundle reachability and decide accept/replace/reject before publication.

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

The programme default PDF page ceiling is locked at **100 pages**. The research test suite contains a 101-page parseable fixture that must fail before extraction or DOCX generation; a separate byte-limit fixture proves oversized input is rejected before PDF.js sees attacker-controlled bytes.

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

## Evidence landed so far

- Plain selectable text can be extracted locally with the pinned PDF.js build, mapped into paragraphs, generated as DOCX with `docx@9.7.1`, and reopened independently with Mammoth while preserving deterministic paragraph order.
- DOCX generation/reopenability preserves representative Unicode text independently of PDF-lib's standard-font WinAnsi limitation in the synthetic PDF fixture.
- Recoverable heading and simple-list cues are converted into semantic DOCX structure and independently reopened as heading/list HTML.
- Two-column reading order is reconstructed from PDF coordinates rather than raw content-stream emission order.
- A simple table fixture deliberately emits cells out of reading order and is reconstructed deterministically by row clustering plus left-to-right cell ordering.
- A graphics-only PDF produces no usable selectable text and is explicitly classified **OCR required** instead of being treated as a successful empty DOCX conversion.
- Malformed/truncated input fails closed; byte limits are enforced before PDF.js parsing; parseable documents over the programme ceiling are rejected before extraction/generation.
- Exact research head `13b4fdf7653e5149e8a0f51ffa09779c51b2c0f5` passed **Validate FigureNest #640** and **FT-07 Browser Publication Gate #40**. These are regression/research checks only and do not authorize a public FT-08 route.

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

The basic selectable-text, semantic heading/list, columns, simple-table, no-text/OCR classification, malformed-input and 100-page resource fixtures are now evidenced. Allowed next work is limited to the unresolved publication gates:

1. encrypted/password-protected PDF classification with an explicit safe UX state;
2. browser network + storage interception proving zero document-derived egress/persistence;
3. mixed text + raster-image behavior, including an honest fallback if image positioning cannot be reconstructed reliably;
4. mobile-class timing/memory/resource measurements under the locked limits;
5. explicit dependency-risk and lazy-bundle disposition for `docx@9.7.1 → xml-js@1.6.11 → sax@1.6.1`.

No catalog/route/schema/sitemap/tool-count change is allowed until those gates are resolved and the research outcome is explicitly recorded as publishable or not publishable.
