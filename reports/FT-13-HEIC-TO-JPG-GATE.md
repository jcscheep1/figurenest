# FT-13 — HEIC/HEIF to JPG Research Gate

Status: **RESEARCH ONLY / NOT PUBLISHABLE**

Proposed route: `/file-tools/heic-to-jpg`

## Decision boundary

FT-13 may publish only if a browser-local decoder can be pinned, licensed, audited, loaded route-locally, and proven reliable on representative HEIC/HEIF fixtures. No document or image bytes, filenames, decoded pixels, metadata, or output may be sent to FigureNest or a third-party conversion service. No CDN, proxy, remote decoder, remote WASM, or server fallback is allowed.

Native browser HEIC decoding is not assumed. Until the full gate passes, the route, catalog entry, sitemap URL, category card, schema and placeholder content must remain absent.

## Required preflight decision

Compare viable browser decoders and record for each candidate:

- exact package and transitive versions;
- source repository, release freshness, licence and bundled codec/WASM licence obligations;
- maintenance status, security advisories and supply-chain surface;
- browser API requirements and CSP implications;
- compressed package, route chunk, WASM and peak decoded-memory cost;
- support for HEIC and HEIF brands, 8/10-bit images, alpha, orientation and multi-image containers;
- whether decoding ever resolves external references or performs network access.

Select no dependency until the licence chain and browser-only architecture are explicit.

## Hostile-input and resource contract

- Validate extension, MIME, ISO-BMFF `ftyp` structure and accepted HEIC/HEIF brands before decoder import.
- Reject malformed/truncated boxes, unsafe box lengths, integer overflow, excessive nesting, unsupported sequences/animations and ambiguous multi-image containers.
- Apply device-aware compressed-byte ceilings before decoder initialization.
- Apply decoded width, height, total-pixel and output-memory ceilings before allocating an export canvas; initial maximum must not exceed the existing 40 MP image-tool ceiling and may need to be lower after mobile measurements.
- Perform one-file/one-frame work with cancellation and deterministic release of ArrayBuffers, decoder/WASM objects, canvas state and Object URLs on success, failure, reset and unmount.
- JPEG output must flatten alpha onto white, use a verified `image/jpeg` encoder result, preserve browser-decoded orientation, and disclose metadata/ICC/HDR/depth/Live Photo loss.

## Required fixtures and QA

1. iPhone portrait HEIC with orientation metadata.
2. Landscape HEIC and HEIF-brand variant.
3. 10-bit/HDR input with explicit SDR/fidelity outcome.
4. Alpha/depth/auxiliary-image container with documented behavior.
5. Multi-image/sequence/Live Photo input: deterministic primary-image handling or fail-closed rejection.
6. Malformed/truncated ISO-BMFF boxes and forged size fields.
7. Limit-adjacent and over-limit compressed/decoded images on desktop and 390×844 mobile.
8. JPEG output reopened independently with correct MIME, dimensions, orientation and white alpha flattening.
9. Network and browser-storage instrumentation proving zero file-bearing leakage.
10. Reset/cancel/unmount cleanup and repeated-conversion memory behavior.

## UI and publication contract

Any published implementation must render inside `.file-tool-page` and inherit `file-tool-buttons.css`: enabled picker/convert/download/reset actions blue with contrasting text, disabled actions grey, destructive actions red. Verify native picker and touch targets on desktop and 390×844 mobile.

Before publication add unique HEIC-to-JPG search intent, H1/title/meta, meaningful tags and description, canonical, breadcrumb/WebApplication/FAQ schema, useful FAQs, non-thin privacy/fidelity guidance, catalog/category/applicability/sitemap parity and related links to Image Converter and Image to PDF.

## Publish / stop rule

Publish only after exact-head focused tests, full validation/build, route-lazy bundle measurements, hostile fixtures, desktop/mobile browser QA, privacy interception, output reopening and both authoritative Vercel previews pass. If no candidate meets licence, security, fidelity or mobile-resource limits, record **NOT PUBLISHABLE** with evidence and advance the roadmap without exposing a route.
