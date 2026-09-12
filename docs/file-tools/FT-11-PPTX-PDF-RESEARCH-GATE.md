# FT-11 PPTX → PDF research gate

Status: **RESEARCH / NOT PUBLISHABLE**

Latest reconciled production `main`: `772a103020fe73ff264f229920ccc93ccb2a3a87`

The FT-11 branch was originally based on `dccb82e42f8fdaa5cd2dd491335bf6e22b482307`; the newer production commit only adds the shared FigureNest Facebook/Instagram footer links and does not change the PPTX research surface. Exact-head research QA must still be rerun after every FT-11 branch change.

## Decision to resolve

Determine whether FigureNest can offer a genuinely browser-local PPTX → PDF converter with bounded resource use and honest fidelity, without uploading presentation bytes or executing active content.

## Security and privacy gate

Any implementation spike must fail closed before presentation rendering when the PPTX ZIP/package violates package or resource limits. It must:

- treat PPTX as untrusted ZIP/XML input;
- reject encrypted/password-protected or malformed packages;
- bound compressed size, expanded size, entry count, XML/document-part sizes, slide count, embedded-media count and decoded media pixels before expensive rendering;
- never execute VBA/macros, JavaScript, embedded OLE content, external links, remote images, fonts, videos, audio or presentation-controlled network requests;
- never send the selected file name, bytes, extracted text, slide XML, images or generated PDF to FigureNest or another conversion service;
- avoid persistent document storage in localStorage, IndexedDB, Cache Storage or service-worker caches;
- use no runtime CDN dependency for presentation parsing/rendering;
- sanitize or ignore unsupported active/external relationships rather than following them.

### Relationship hardening checkpoint

OOXML relationship safety must not rely only on `TargetMode="External"`. A hostile or malformed package can carry a URL-like target while omitting or corrupting that marker. Before a renderer receives relationship data, the research spike must therefore parse each relationship attribute and fail closed when a target:

- uses any URI scheme (`https:`, `http:`, `javascript:`, `data:`, `file:`, `vbscript:`, or another scheme) rather than a package-relative path;
- is protocol-relative (`//host/...`), root-absolute, drive-letter absolute, contains NUL/backslash ambiguity, or escapes the package namespace after path normalization;
- uses an active relationship type such as OLE/package/ActiveX;
- requests external resolution through `TargetMode="External"`, regardless of target spelling.

A valid package-relative relationship such as `../media/image1.png` may remain inert input only after normalization proves it stays within the PPTX package namespace. Tests must include external targets with a missing `TargetMode` so this cannot regress.

## Renderer/dependency research checkpoint — 2026-09-12

The hostile-package preflight at exact head `13c0f512171f70876b8819c238954ad460addf01` passed Validate FigureNest #758 and both authoritative GitHub-attached Vercel previews. That authorizes an **unpublished** renderer spike only; it does not authorize a public route.

Current browser-local candidates were rechecked before selecting a spike dependency:

| Candidate | Version observed | License | Research assessment |
| --- | --- | --- | --- |
| `@aiden0z/pptx-renderer` | `1.2.4` | Apache-2.0 | Primary spike candidate. Browser-native HTML/SVG renderer with documented shapes/text/images/tables/charts/SmartArt coverage, zip-limit support and visual-regression methodology. Published package is large (`dist` roughly 2.55 MB uncompressed), so it must be route-level lazy and measured before approval. |
| `pptxviewjs` | `1.1.9` | MIT | Secondary candidate. Client-side Canvas renderer with JSZip peer requirement and optional Chart.js. Canvas output may simplify raster-per-slide PDF generation but increases text-searchability/fidelity and memory questions. |
| `@briank-dev/pptx-to-html` | `2.1.0` | MIT | Promising Rust/WASM local converter with coded diagnostics and no declared npm dependencies, but its own documentation treats generated HTML as active/untrusted and recommends sandboxed execution. This conflicts with the preferred inert-rendering surface unless a no-script rendering path can be proven. |
| PptxGenJS | `4.0.1` | MIT | Excluded as the import renderer: it generates PPTX rather than faithfully reading/rendering arbitrary PPTX. |

**Pinned next spike:** `@aiden0z/pptx-renderer@1.2.4`, unpublished and dynamically imported only. Do not add it to the public application path until the following executable gate passes. A fallback comparison with `pptxviewjs@1.1.9` is warranted only if the primary candidate fails size, security, fidelity or mobile limits.

### Dependency spike acceptance

The next exact-head experiment must prove all of the following before FT-11 can advance:

1. Package bytes pass FigureNest's own hostile preflight **before** renderer import/open.
2. Runtime network interception observes no presentation-controlled `fetch`, XHR, beacon, WebSocket, form submission, remote font/image/media request or CDN dependency.
3. Storage interception observes no presentation bytes/text/name written to localStorage, IndexedDB, Cache Storage or service-worker cache.
4. A deterministic generated PPTX fixture covers text, fallback font, image, shape, table and chart; unsupported SmartArt/media/animation/notes behavior is explicitly recorded rather than silently claimed.
5. Rendering is bounded per slide. No whole-deck canvas/screenshot surface is retained.
6. Desktop and 390×844 mobile measurements record load/render/export time, observable memory where available, slide/object/image scaling, cleanup and cancellation.
7. The PDF export reopens through the existing PDF stack with deterministic page count, order and dimensions. If PDF pages are rasterized, the product must disclose that slide text will not remain searchable/selectable.
8. The renderer and transitive packages are exact-pinned, license-reviewed and isolated from initial-site JS. The measured lazy chunk must be recorded; size alone cannot be hidden by lazy loading.

Until these pass, FT-11 remains **NOT PUBLISHABLE** and `/file-tools/pptx-to-pdf` must not exist in catalog, routes, schema or sitemap.

## Fidelity gate

The release must not claim PowerPoint-identical output. Research must explicitly measure and document support/limitations for:

- text boxes, paragraphs, basic fonts and fallback fonts;
- simple shapes, fills, borders and rotations;
- images and cropping;
- slide dimensions and orientation;
- tables;
- charts and SmartArt;
- themes/master layouts;
- equations, SVG/EMF/WMF and other uncommon media;
- animations, transitions, speaker notes, comments, embedded video/audio and OLE objects.

A safe release may deliberately support a narrower subset if unsupported content is clearly identified before export.

## Resource gate

The first deterministic fixture spike must derive conservative limits instead of inheriting spreadsheet/PDF limits. Measure at least desktop and a 390×844 mobile viewport. Capture:

- parse/render wall time;
- peak or observable browser memory where available;
- slide count and object-count scaling;
- decoded image-pixel scaling;
- generated PDF page count and output bytes;
- cleanup after success, cancellation and failure.

A single unbounded presentation canvas or whole-deck raster surface is prohibited. If rasterization is required, render one bounded slide/tile at a time and release intermediate resources promptly.

## PDF output gate

Generated output must reopen successfully with the existing PDF stack. If text is rendered as text, verify searchable sentinel text. If a narrower raster-per-slide approach is chosen for fidelity/safety, describe that trade-off honestly and prove page dimensions/order deterministically.

## Initial conservative research ceilings

Until browser measurements justify tighter or looser values, the unpublished spike must fail closed at:

- 50 slides;
- 2,000 ZIP entries;
- 75 MiB compressed package bytes on desktop and 25 MiB on mobile;
- 250 MiB total declared expanded bytes;
- 20 MiB for any individual XML/document part;
- 100 embedded media parts;
- 40 megapixels per decoded raster image;
- 100 MiB generated PDF output.

These are research ceilings, not product promises. They must not be raised merely to make a fixture pass.

## Publication gate

Do **not** add `/file-tools/pptx-to-pdf`, catalog/schema entries, sitemap exposure or tool-count changes until an exact-head research fixture proves:

1. hostile-package rejection before expensive parsing/rendering;
2. no active-content execution or presentation-data egress;
3. no persistent presentation storage;
4. bounded desktop and 390×844 resource behavior;
5. deterministic, reopenable PDF output;
6. documented unsupported-content behavior;
7. acceptable bundle isolation and production build impact.

After that evidence passes, implementation and a dedicated fail-closed publication browser gate can proceed atomically.

## Publication UI and SEO contract

If FT-11 ever passes the research gate, publication must also inherit the current FigureNest File Tools contracts rather than introducing a one-off page:

- the route must render inside `.file-tool-page` and use the shared `file-tool-buttons.css` action system: enabled upload/convert/download/reset actions visibly blue with contrasting text, disabled actions grey, destructive actions red; desktop and 390×844 QA must include the native file-picker button;
- the public page must have a unique PPTX-to-PDF search-intent H1/title/meta description, useful visible guidance and limitations, meaningful tags/description and FAQs, canonical route, breadcrumb/WebApplication/FAQ schema where applicable, related internal links, and catalog/category/sitemap/tool-count parity;
- no placeholder or thin route may be indexed while the converter remains research-only.
