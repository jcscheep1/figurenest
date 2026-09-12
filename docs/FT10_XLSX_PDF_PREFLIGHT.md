# FT-10 — XLSX → PDF browser-local research gate

Status: **RESEARCH / NOT PUBLISHABLE**

Base production SHA: `70528afcea57c7bc34fdd72a215fcfea866190e7` (FT-09 released).
Validated research baseline: `406325825b81accaa93e6d26dc99b38bec75b734` — full FigureNest validation green before this decision update.

## Goal

Determine whether FigureNest can safely convert one selected XLSX worksheet to a useful PDF entirely in the browser without uploading spreadsheet data, executing workbook formulas, loading workbook-controlled remote resources, or creating unacceptable mobile/browser memory pressure.

This gate deliberately publishes **no route, catalog record, sitemap URL, schema entry, or tool-count change**. A public `/file-tools/xlsx-to-pdf` surface is forbidden until the fixture, security, privacy, performance and output-quality gates below pass on an exact head.

## Reuse before adding dependencies

Current production already carries the reviewed FT-09 stack and existing PDF/rendering libraries:

- SheetJS CE `0.20.3`, exact-pinned to the authoritative versioned tarball used by FT-09;
- `jspdf` `4.2.1`;
- `html2canvas` `1.4.1`;
- `pdf-lib` `1.17.1`;
- `pdfjs-dist` `6.3.289`.

FT-10 must begin with **zero new runtime dependencies**. Any later dependency request requires a separate exact-version license/security/bundle decision and cannot be smuggled into the publication build.

## Validated baseline decision

The initial FT-10 research-only head `406325825b81accaa93e6d26dc99b38bec75b734` cleared the repository validation gate without introducing a public surface or a new runtime dependency. That result closes the baseline-integrity question: FT-10 may proceed to an unpublished fixture/rendering spike on top of the released FT-09 security boundary.

This does **not** approve XLSX → PDF for publication. The next exact-head gate must contain executable evidence, not only design prose.

### Next executable spike — required before route work

Build one deterministic repository-local XLSX fixture and a focused test/harness that proves all of the following before any route/catalog/sitemap work is permitted:

1. XLSX bytes pass through the existing dependency-independent ZIP/resource preflight before SheetJS parsing; a malformed/hostile variant fails before parse/render.
2. A selected worksheet is converted using **direct paginated PDF text/table drawing as the first candidate**. A whole-worksheet canvas is not allowed.
3. Formula cells are never recalculated or executed. Tests must include formula-bearing cells and assert that only inert cached/display data or an explicit safe placeholder can reach the renderer.
4. Pagination is deterministic for a deliberately wide and long fixture, with a hard page-count ceiling that fails closed instead of producing unbounded output.
5. Generated PDF bytes reopen through a repository-local PDF inspection path and prove expected page count plus extractable sentinel text. If extractable text cannot be proved, direct rendering has not yet passed the release-quality gate.
6. Repeated conversion of the same deterministic fixture yields the same structural pagination result. Byte-for-byte identity is desirable but is not required if the PDF library embeds nondeterministic metadata; any such nondeterminism must be documented rather than hidden.
7. No fixture value, filename or workbook-controlled URL is sent over the network or persisted. Browser-level network/storage instrumentation remains a later mandatory publication gate, but unit-level code must not introduce an upload/storage path.

### Limits policy for the spike

Do not copy FT-09 parse maxima into the PDF renderer. The spike must collect the evidence needed to set separate print ceilings. Until measurements exist, any provisional constants must be test-only/conservative and must not be represented as public supported limits.

At minimum the implementation must have explicit fail-closed guards for:

- printable rows;
- printable columns;
- populated cells considered for rendering;
- generated pages;
- generated output bytes;
- per-page/tile pixels if a raster comparison is later attempted.

The first usable limit set must be justified by both desktop and 390×844 measurements before publication.

## Security boundary

1. Reuse the dependency-independent FT-09 XLSX ZIP/resource preflight **before** SheetJS parses workbook bytes. ZIP64, encryption, unsupported compression, excessive entry count, excessive per-entry/aggregate uncompressed size and suspicious compression ratios remain fail-closed.
2. Reuse the FT-09 lazy local SheetJS loader. Runtime CDN loading is forbidden.
3. Workbook formulas are never evaluated. Formula cells may be represented only by safely read cached/display values or explicit formula-presence placeholders according to the fixture decision; workbook code is never executed.
4. External links, macros, active content, workbook-provided URLs and remote resources must never cause network requests. The renderer must not inject workbook-controlled HTML with `innerHTML` or equivalent executable markup.
5. Render cell strings through text-safe APIs. Spreadsheet text beginning with `=`, `+`, `@`, or formula-like `-` remains data, not code.
6. The selected filename, workbook bytes, sheet names, cell contents, generated pages and PDF bytes must remain ephemeral in memory and must not be written to localStorage, sessionStorage, IndexedDB, Cache Storage, analytics or logs.

## Rendering decision to prove

The spike must compare two approaches using the dependencies already present:

### A. Direct paginated PDF drawing — preferred candidate

Use `jsPDF` text/drawing APIs (or an equivalently bounded direct-PDF path already in the repository) to lay out a worksheet grid page by page. Acceptance advantages:

- searchable/selectable text rather than a single raster screenshot;
- predictable page boundaries and memory use;
- no giant browser canvas for long sheets;
- explicit clipping and row/column pagination.

The spike must prove deterministic pagination, Unicode handling, long-cell clipping/wrapping, numeric/text display, repeated page headers if implemented, and bounded output size.

### B. Canvas rasterization — comparison/fallback only

`html2canvas` + `jsPDF` may be measured as a comparison, but **a single giant worksheet canvas is forbidden**. Any raster approach must tile/page before rasterization, enforce pixel ceilings per page/tile, release intermediate canvases, and document the trade-off that rasterized text is not selectable/searchable.

A public release must choose the safer/better-quality path based on measured evidence. If neither path is acceptable on a 390×844 mobile viewport and desktop fixtures, FT-10 is formally NOT PUBLISHABLE rather than bypassing the gate.

## Workbook/output fidelity contract

The first release, if approved, should target ordinary printable tabular worksheets rather than claim Excel print fidelity.

The spike must explicitly decide and test:

- one selected worksheet per conversion;
- cell text, numbers, booleans and dates/display strings;
- merged cells;
- row/column sizing and basic alignment where safely available;
- hidden rows/columns/sheets;
- print area and orientation handling;
- formulas (never recalculated);
- images, charts, pivots, macros, conditional formatting and advanced Excel layout features.

Unsupported features must be omitted or represented with a clear warning; they must not silently trigger remote/cloud conversion.

## PDF-specific resource limits

FT-09's workbook ceilings are parsing ceilings, not permission to print an arbitrarily huge worksheet. The fixture spike must measure and set stricter PDF-specific limits for:

- maximum printable rows;
- maximum printable columns;
- maximum populated cells;
- maximum generated PDF pages;
- maximum per-page/tile pixels if rasterization is used;
- maximum output bytes and peak practical memory.

Do not guess a high public ceiling. Derive the release limits from measured desktop and mobile behavior and fail closed above them.

## Required fixture evidence

At minimum, commit deterministic fixtures/tests covering:

1. a normal workbook with Unicode, quotes/symbols, leading-zero text, negative values, dates/numbers and multiple sheets;
2. formula cells proving no formula execution;
3. long text and wide/long sheet pagination;
4. malformed/hostile XLSX rejected by ZIP/resource preflight before SheetJS;
5. workbook features that the first release intentionally does not preserve;
6. generated PDF reopen/inspection with a repository-local PDF parser to prove valid output, expected page count and—if direct text rendering wins—extractable expected text;
7. deterministic repeated conversion of the same fixture where practical.

## Browser privacy and performance gate

Desktop and 390×844 browser QA must instrument/deny `fetch`, XHR, `sendBeacon`, WebSocket, form submission and persistent storage. A unique sentinel filename and sentinel cell value must not appear in URL, headers, request bodies, analytics, console output or storage.

The QA must also prove:

- SheetJS/PDF rendering dependencies are route/action lazy and local;
- no workbook-controlled network fetch occurs;
- cancellation/reset releases object URLs, buffers, canvases and generated output references;
- hostile resource limits fail closed;
- representative conversion completes within measured memory/output ceilings;
- initial-site bundle impact remains isolated from unrelated routes.

## Publication gate

FT-10 remains **NOT PUBLISHABLE** until all of the following are true on one exact SHA:

- rendering approach selected with committed comparison evidence;
- dependency/license/source decision complete (prefer zero new dependencies);
- hostile/malformed workbook fixtures pass fail-closed tests;
- formula non-execution and remote-resource blocking proven;
- desktop + 390×844 privacy/resource QA green;
- generated PDF reopen/output-quality evidence green;
- production implementation has explicit PDF-specific limits and user-facing fidelity warnings;
- route/catalog/category/schema/sitemap/tool-count integration is atomic;
- full FigureNest validation and authoritative Vercel previews are green.

Only then may the PR transition from research to publication implementation and eventual expected-head merge.