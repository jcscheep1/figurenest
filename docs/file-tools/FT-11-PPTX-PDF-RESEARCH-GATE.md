# FT-11 PPTX → PDF research gate

Status: **RESEARCH / NOT PUBLISHABLE**

Reconciled production baseline SHA: `dccb82e42f8fdaa5cd2dd491335bf6e22b482307`

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
