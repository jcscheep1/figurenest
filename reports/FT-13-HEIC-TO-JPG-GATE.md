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

## 2026-09-12 decoder preflight checkpoint

This checkpoint narrows the first executable spike without approving a publication dependency.

### `heic-to@1.5.2` — primary spike candidate, not yet approved

- Current package evidence reports `heic-to` 1.5.2, released roughly three months before this checkpoint, with zero npm dependencies and libheif 1.22.2 bundled under the hood.
- Package licence is LGPL-3.0 and the compressed/unpacked distribution is large enough that it must remain route-lazy and must not enter the initial FigureNest bundle.
- It is maintained specifically as a browser HEIC/HEIF decoder/converter following libheif releases, which makes it the strongest current candidate for representative HEIC/HEIF fidelity testing.
- LGPL obligations are a release gate, not paperwork to defer: before publication FigureNest must record the exact distributed decoder artefacts, licence texts, corresponding source/relinking availability required by the selected distribution model, and ensure the decoder remains separable from proprietary application code.
- Runtime CDN examples in upstream documentation are forbidden for FigureNest. Any accepted spike must bundle/pin the decoder locally and prove zero file-bearing network access.

### `libheif-js@1.19.8` — lower-level fallback/reference candidate

- Current package evidence reports version 1.19.8, LGPL-3.0, zero npm dependencies, and browser-capable pure-JS plus WASM variants.
- The package exposes a lower-level `HeifDecoder` and returns all decoded images from a container, which is useful for explicitly detecting/rejecting ambiguous multi-image inputs rather than silently choosing an arbitrary frame.
- The browser bundles are materially large (published package listings show multi-megabyte libheif JS/WASM directories), so it also requires route-level lazy loading and explicit mobile memory/bundle measurements.
- Upstream documentation includes CDN loading examples; FigureNest must not use those. If this candidate is spiked, use a pinned local package artefact only.

### `@stacksjs/ts-heic` — watchlist only until maturity/coverage is proven

- A newer pure-TypeScript decoder exists with no WASM/runtime dependencies and claims irot/imir orientation plus tiled-image support.
- Its architecture is attractive for CSP and LGPL avoidance, but the current gate has not yet established release maturity, security history, 10-bit/HDR/auxiliary-image fidelity or representative iPhone/browser coverage. It must not displace the libheif-based candidates until fixture evidence is stronger.

### Preflight decision

The next unpublished executable spike should start with **exact-pinned `heic-to@1.5.2`**, while retaining `libheif-js@1.19.8` as the lower-level comparison/fallback candidate. This is a research authorization only. **No dependency may be wired into a public route, catalog, sitemap or initial bundle.**

The spike must fail closed if any of these remain unresolved:

1. LGPL distribution/source/relinking obligations cannot be met cleanly for the shipped browser artefact.
2. The decoder performs runtime third-party/CDN access or cannot be served entirely same-origin.
3. Representative portrait/orientation, HEIF-brand, 10-bit/HDR, auxiliary-image or multi-image fixtures produce ambiguous or misleading output.
4. Decoder + canvas peak memory cannot stay within a conservative mobile ceiling at 390×844.
5. Route-lazy JS/WASM cost is excessive relative to a single-purpose converter and cannot be isolated from initial-site JS.

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
