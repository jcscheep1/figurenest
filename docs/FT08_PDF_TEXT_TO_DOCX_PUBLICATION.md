# FT-08 — PDF text to editable DOCX publication contract

Status: **PUBLICATION BUILD — NOT YET RELEASABLE**

This lane starts from production `main` after the FT-08 research gate passed. It intentionally does not merge the older research branch because that branch diverged from concurrent production work.

## Product wording

The public tool may be described only as **PDF text to editable DOCX** or **best-effort editable reconstruction** for PDFs with a usable selectable-text layer.

Do not promise faithful PDF-to-Word layout conversion, OCR, exact image placement, font fidelity, pagination fidelity, fields, annotations, or executable content preservation.

## Locked implementation constraints

- Browser-local processing only. No PDF bytes, filename, extracted text, generated DOCX, raster content, or document-derived telemetry may be uploaded or persisted.
- Reuse exact `pdfjs-dist@6.3.289` with a same-origin, version-matched worker.
- Use exact `docx@9.7.1` only behind route-level lazy loading. Keep the exact lockfile and monitor the known `xml-js@1.6.11` maintenance concern.
- Apply the programme's centralized input ceilings: mobile 25 MB, desktop 75 MB, and 100 PDF pages unless a later separately reviewed measurement changes them.
- Scans/image-only PDFs must return an explicit OCR-required state.
- Password-protected PDFs must return an explicit safe error state.
- Malformed and oversized PDFs must fail closed before expensive extraction or DOCX generation.
- Mixed selectable text + raster imagery must preserve useful editable text and warn that raster-image placement is not guaranteed/preserved unless publication implementation adds and proves safe reconstruction.
- Never carry PDF JavaScript, launch actions, embedded executables, arbitrary annotation URLs, or other active content into the generated DOCX.

## Required publication surface

- Canonical route: `/file-tools/pdf-to-docx`.
- One truthful `publishedTools` catalog record; no duplicate alias counted as another tool.
- Route registry, API catalog parity, category totals, related links, canonical/meta/FAQ/schema and sitemap integration in the same publication lane.
- Heavy PDF/DOCX modules loaded only from this route/workflow; record initial-site JS delta separately from lazy chunks and worker bytes.
- Accessible file picker/dropzone, progress, cancel/reset/cleanup, error states and explicit download action.
- Object URLs and in-memory document state must be released on reset, remove, error, completion and unmount.

## Evidence that must remain green

Research evidence already established selectable-text extraction, reopenable DOCX generation, headings/lists, coordinate-aware two-column order, deterministic simple-table reconstruction, OCR-required scans, malformed/oversized/password classification, browser privacy at desktop and 390×844 mobile, mixed raster warning behavior, and a 100-page mobile-viewport resource benchmark.

Publication itself must rerun those properties against the real route and final dependency graph. The release head must pass:

1. normal FigureNest typecheck, unit tests, build and static/site audit;
2. real-route browser privacy interception with zero document-derived egress/persistence;
3. 100-page/resource and mobile-class gate;
4. DOCX reopenability and truthful unsupported-state fixtures;
5. route-lazy bundle evidence and initial-site JS budget check;
6. both authoritative Vercel frontend/API statuses;
7. expected-head-protected merge followed by production smoke of the new route plus robots, sitemap, canonical, schema, catalog/tool-count parity and representative existing calculators/file tools.

Until all of these are satisfied, this lane remains **NOT READY FOR DEPLOY**.
