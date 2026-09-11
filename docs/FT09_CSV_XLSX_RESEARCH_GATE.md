# FT-09 — CSV ↔ XLSX research gate

Status: **RESEARCH / PREFLIGHT — NOT PUBLISHABLE**

Base at lane creation: production `main` after FT-08 merge `5fedf320827c021f7f34821242e0fdc57f056495`.

## Product goal

Evaluate a browser-local CSV ↔ XLSX tool that can safely convert ordinary tabular data without uploading file bytes, filenames, parsed cell values, workbook metadata, or generated outputs to a conversion server.

This research lane must not add a public route, catalog entry, sitemap URL, tool-count increase, or SEO promise until dependency, security, resource, fidelity and browser evidence are explicit.

## Dependency decision to resolve

Do **not** install the stale npm-registry `xlsx@0.18.5` package by habit.

Current official SheetJS Community Edition documentation identifies `0.20.3` as the authoritative current release and states that the SheetJS CDN is the authoritative distribution source. For bundlers, the candidate exact package is:

`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`

Official sources:

- Installation / authoritative distribution: https://docs.sheetjs.com/docs/getting-started/installation/frameworks/
- Browser distribution and current version: https://docs.sheetjs.com/docs/getting-started/installation/standalone/
- License: https://docs.sheetjs.com/docs/miscellany/license/

SheetJS CE is Apache-2.0 licensed. Commercial redistribution is permitted subject to the license and attribution requirements. If selected, FigureNest must preserve required notices and add an open-source disclosure/attribution record before publication.

The research spike must compare exact SheetJS CE `0.20.3` with at least one credible alternative or a narrow native implementation for the CSV side. The comparison must record:

- exact dependency graph and resolved source;
- minified/gzip route-lazy browser chunk cost;
- initial-site JS delta (target: effectively zero outside the route);
- license/notice obligations;
- parser/writer format breadth actually needed for FT-09;
- security history / maintenance evidence available for the exact candidate;
- whether the dependency executes formulas or merely preserves formula strings;
- whether ZIP decompression can be bounded before hostile XLSX archives exhaust browser memory.

No dependency is approved merely because it can parse a happy-path workbook.

## Locked security model

1. **Browser-local only.** No upload, proxy, cloud fallback, remote OCR, remote workbook parsing, or document-derived analytics.
2. **Input allowlist.** Start with `.csv` / text CSV and modern OOXML `.xlsx`. Do not silently broaden to legacy `.xls`, `.xlsb`, macro-enabled workbooks or arbitrary ZIP containers in the publication lane.
3. **No formula execution.** Formula cells are data. FT-09 must never evaluate spreadsheet formulas, external links, DDE-like content, macros, scripts, embedded OLE objects, or workbook actions.
4. **CSV formula-injection defence.** CSV exported from workbook cells that begin with spreadsheet-control prefixes such as `=`, `+`, `-`, or `@` must follow a documented safe policy rather than generating a file that silently becomes executable spreadsheet syntax when opened elsewhere. The policy must be explicit and covered by fixtures; it must not corrupt ordinary negative numeric values.
5. **Archive/decompression limits.** XLSX is ZIP-based. Apply compressed-byte, uncompressed-byte, entry-count and workbook-shape ceilings before / during expensive materialisation wherever the selected library permits. A hostile high-compression-ratio fixture must fail closed.
6. **Workbook-shape limits.** Establish measured ceilings for worksheet count, row count, column count, total populated cells, per-cell string length and aggregate text bytes. Limits must be lower on mobile-class devices if measurements justify it.
7. **Malformed input fails closed.** Truncated ZIPs, duplicate/invalid workbook parts, impossible shared-string references, malformed XML, pathological dimensions and CSV decoding errors must produce bounded safe errors rather than partial misleading output.
8. **No persistence.** Selected bytes, filenames, parsed workbooks, CSV text and generated outputs must not be written to localStorage, sessionStorage, IndexedDB, Cache Storage or service-worker caches.
9. **Cleanup/cancel.** Abort/reset/unmount must release object URLs and large in-memory buffers/references as far as the browser/library API permits.

## Fidelity fixtures required before implementation approval

CSV → XLSX and XLSX → CSV fixtures must cover at minimum:

- UTF-8 text including accents and non-Latin characters;
- RFC-style quoted delimiters and escaped quotes;
- embedded CR/LF inside quoted fields;
- empty cells, empty rows and trailing empty fields;
- commas, semicolons and tabs as explicitly selected delimiters where supported;
- booleans, integers, decimals and large-but-safe numeric values;
- ISO-like date text versus actual spreadsheet date cells, with truthful handling rather than locale guessing;
- leading-zero identifiers such as postal codes / SKU values;
- formula strings and cells beginning with CSV injection prefixes;
- multiple XLSX worksheets with an explicit sheet-selection/export rule;
- duplicate sheet names / invalid names handled predictably when generating workbooks;
- very long strings near the chosen limit;
- malformed CSV quoting and malformed XLSX archives;
- round-trip evidence that distinguishes **value preservation** from **format/style preservation**.

FT-09 should promise tabular data conversion, not faithful preservation of workbook styling, charts, macros, pivot tables, conditional formatting, comments, external links, images or print settings unless a later fixture proves a specific feature and the public wording is updated accordingly.

## Browser QA gate

Before publication, run the production conversion core in a real Chromium browser at desktop and 390×844 mobile-class viewports with:

- network interception for fetch/XHR/beacon/WebSocket document-derived egress;
- localStorage/sessionStorage/IndexedDB/Cache Storage interception;
- representative round-trip fixtures;
- malformed/hostile archive fixtures;
- chosen cell/row/workbook resource ceilings;
- cancel/reset cleanup;
- route-lazy bundle evidence and initial-site JS comparison.

## First spike acceptance criteria

The next commit in this lane should be an unpublished dependency/fixture spike only. It may proceed when it:

1. exact-pins the candidate from the authoritative source;
2. records license/attribution files without exposing a public tool;
3. proves basic browser-local CSV→XLSX→reopen and XLSX→CSV on deterministic fixtures;
4. records lazy bundle sizes;
5. tests formula preservation/non-evaluation and CSV-injection handling direction;
6. demonstrates at least one bounded hostile ZIP/resource rejection mechanism or, if the candidate cannot support a defensible bound, records that as a publication blocker and evaluates an alternative.

Until those criteria are satisfied, FT-09 is **NOT PUBLISHABLE**.

## Preflight decision — 2026-09-12

**Decision: ALLOW the unpublished dependency/fixture spike with exact SheetJS CE `0.20.3`; publication remains closed.**

Fresh authoritative SheetJS documentation still identifies `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz` as the bundler package and explicitly says the public npm registry is stale at `0.18.5`. The bundler guidance also recommends a narrow wrapper module for dynamic imports so bundlers can tree-shake the route-lazy surface instead of importing the whole library blindly.

The first comparison candidate is ExcelJS `4.4.0`, but it is **not approved as the primary FT-09 engine** at this stage. A documented browser-side corruption report exists for generated XLSX files, and there is an unresolved dependency-licensing concern in the project issue tracker. Those signals do not prove ExcelJS unusable, but they are enough that the spike should prefer the narrower SheetJS candidate while keeping ExcelJS only as comparison evidence.

The spike is permitted only under these additional constraints:

- install SheetJS from the exact authoritative tarball URL, never `xlsx@latest` from npm;
- place all SheetJS imports behind an FT-09-only wrapper/dynamic import and measure both initial-site delta and lazy chunk gzip size;
- do not add legacy codepage support unless a fixture proves it is required for the v1 CSV/XLSX scope;
- before passing arbitrary XLSX bytes to the workbook parser, add or prove a bounded OOXML ZIP preflight capable of enforcing compressed input size, entry count and declared uncompressed-size/ratio ceilings; if the chosen browser stack cannot enforce those bounds before expensive inflation, that is a publication blocker rather than permission to raise limits;
- formulas must remain inert data; no calculation engine or macro path may be introduced;
- CSV export safety must distinguish text beginning with `=`, `+`, `-`, `@` (including leading whitespace) from genuine numeric negative values, with fixtures locking the policy;
- the spike may add dependencies, fixtures, tests and research evidence only. It must not add `/file-tools/csv-to-xlsx`, `/file-tools/xlsx-to-csv`, catalog records, sitemap URLs, schema promises or tool-count changes.

### Distribution stability decision

The authoritative SheetJS bundler documentation also recommends vendoring the tarball for general stability. For the **research spike**, the exact versioned CDN tarball URL is acceptable so the package manager can resolve and lock the dependency reproducibly. Before a public FT-09 release, the dependency review must decide between a repository-vendored exact tarball and an equivalently immutable verified source. Runtime CDN loading remains forbidden either way: browser production code must import the bundled local dependency only.

### Reconciliation / exact-head evidence

The dependency-independent ZIP preflight head `c8d6827e6ae6434995cf863d73dcc52706718605` passed `Validate FigureNest #681` and both authoritative Vercel previews. The retired Netlify deploy preview is the only red legacy status and is non-authoritative.

Production `main` has since advanced independently to `b2b0b10c7fb33d8e54d66dbb5a1c4032c3c97e87` with a File Tools mobile-contrast/calculator-export repair. FT-09 is four commits ahead of the common FT-08 merge base and one commit behind current `main`; its three changed paths remain isolated to the FT-09 ZIP preflight and this research record. The branch must reconcile that newer main before any publication or merge decision, and no older QA verdict can be treated as release approval after such reconciliation.

Resume condition for implementation approval: exact-head tests must demonstrate deterministic CSV→XLSX→reopen and XLSX→CSV value preservation, hostile ZIP/resource rejection before uncontrolled expansion, formula non-execution, injection-safe CSV output, and acceptable route-lazy bundle measurements. Until then FT-09 remains **RESEARCH / NOT PUBLISHABLE**.
