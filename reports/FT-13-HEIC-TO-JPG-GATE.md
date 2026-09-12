# FT-13 — HEIC/HEIF to JPG Research Gate

Status: **NOT PUBLISHABLE — ADVANCE ROADMAP**

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

### `heic-to@1.5.2` — REJECTED for publication/security spike

The initial preflight identified `heic-to@1.5.2` as a useful browser-oriented candidate because it is exact-pinnable, has zero npm runtime dependencies, is LGPL-3.0, and bundles libheif 1.22.2. Subsequent current-security reconciliation invalidates that candidate for any FigureNest publication spike.

Upstream libheif security releases published after 1.22.2 include vulnerabilities affecting the bundled generation, including:

- GHSA-g89c-p67h-r497 — critical heap buffer overflow; affected `<= 1.23.1`, patched in 1.23.2: https://github.com/strukturag/libheif/security/advisories/GHSA-g89c-p67h-r497
- GHSA-8fmq-r4pf-7m57 — high-severity permanent decoder deadlock; affected `>= 1.22.0, <= 1.23.2`, patched in 1.23.3: https://github.com/strukturag/libheif/security/advisories/GHSA-8fmq-r4pf-7m57
- libheif 1.23.4 is the current security-maintenance release and upstream advises users to upgrade because additional high-severity issues were fixed: https://github.com/strukturag/libheif/releases/tag/v1.23.4

Therefore **`heic-to@1.5.2` must not be installed, fixture-spiked, routed, catalogued or published in FigureNest**. Its npm `latest` tag is still 1.5.2 at this checkpoint, so there is no patched `heic-to` release to advance to yet.

The previous authorization to begin an executable `heic-to@1.5.2` fixture spike is revoked. Security takes precedence over fidelity/bundle experimentation.

### `libheif-js@1.19.8` — REJECTED

This lower-level package is also too old for the current libheif security floor and remains LGPL-3.0. It must not be used as a fallback merely to keep FT-13 moving.

### `@stacksjs/ts-heic` source candidate — REJECTED FOR CURRENT FIGURENEST SPIKE

The source repository currently declares version `0.0.1`, MIT licensing, and no runtime dependencies. Its architecture is attractive because it is pure TypeScript with no native module or WASM requirement, and its documentation claims real-iPhone fixture coverage, orientation transforms, HEIF grid stitching and malformed-input tests.

However, the documented decoder scope is materially narrower than the FT-13 acceptance matrix: current decoding targets 8-bit HEVC Main-profile still images and explicitly excludes 10-bit/12-bit pixel decoding, auxiliary alpha-plane decoding and animated image sequences. Those exclusions are not automatically unsafe if they fail closed, but they require executable proof before FigureNest can rely on them.

The exact registry preflight added on PR #138 failed at the package-metadata step before any package was installed or packed. At this checkpoint FigureNest therefore does **not** have a verified exact npm artefact, integrity record, distributable footprint, or browser bundle to test. The source project is also at an initial `0.0.1` maturity level. FigureNest will not consume an unverified Git/source dependency merely to bypass the package gate.

Result: **do not install, route or publish `@stacksjs/ts-heic` now.** Revisit only after there is a verifiable exact distribution artefact and enough release maturity to justify hostile-fixture, mobile-memory and browser-fidelity testing.

### Current security floor and next candidate rule

Any future libheif-derived browser candidate must prove that its distributed decoder is based on **libheif >= 1.23.4** (or a newer upstream security release current at the time of evaluation), with no known unpatched high/critical advisory applicable to the shipped decode path. Package-wrapper version numbers are insufficient; the embedded decoder revision must be evidenced directly from the distributed artefact/source.

Any future non-libheif candidate must provide a verifiable exact distribution artefact, current licence, reproducible source mapping, explicit unsupported-format behavior and enough release maturity to justify running hostile user-controlled ISO-BMFF/HEVC input through it.

Do not resume decoder fixture testing until one of those candidate rules is satisfied.

## Hostile-input and resource contract for a future revisit

- Validate extension, MIME, ISO-BMFF `ftyp` structure and accepted HEIC/HEIF brands before decoder import.
- Reject malformed/truncated boxes, unsafe box lengths, integer overflow, excessive nesting, unsupported sequences/animations and ambiguous multi-image containers.
- Apply device-aware compressed-byte ceilings before decoder initialization.
- Apply decoded width, height, total-pixel and output-memory ceilings before allocating an export canvas; initial maximum must not exceed the existing 40 MP image-tool ceiling and may need to be lower after mobile measurements.
- Perform one-file/one-frame work with cancellation and deterministic release of ArrayBuffers, decoder/WASM objects, canvas state and Object URLs on success, failure, reset and unmount.
- JPEG output must flatten alpha onto white, use a verified `image/jpeg` encoder result, preserve browser-decoded orientation, and disclose metadata/ICC/HDR/depth/Live Photo loss.

## Required fixtures for a future revisit

1. iPhone portrait HEIC with orientation metadata.
2. Landscape HEIC and HEIF-brand variant.
3. 10-bit/HDR input with explicit SDR/fidelity outcome or verified fail-closed rejection.
4. Alpha/depth/auxiliary-image container with documented behavior.
5. Multi-image/sequence/Live Photo input: deterministic primary-image handling or fail-closed rejection.
6. Malformed/truncated ISO-BMFF boxes and forged size fields.
7. Limit-adjacent and over-limit compressed/decoded images on desktop and 390×844 mobile.
8. JPEG output reopened independently with correct MIME, dimensions, orientation and white alpha flattening.
9. Network and browser-storage instrumentation proving zero file-bearing leakage.
10. Reset/cancel/unmount cleanup and repeated-conversion memory behavior.

## UI and publication contract

Any future published implementation must render inside `.file-tool-page` and inherit `file-tool-buttons.css`: enabled picker/convert/download/reset actions blue with contrasting text, disabled actions grey, destructive actions red. Verify native picker and touch targets on desktop and 390×844 mobile.

Before publication add unique HEIC-to-JPG search intent, H1/title/meta, meaningful tags and description, canonical, breadcrumb/WebApplication/FAQ schema, useful FAQs, non-thin privacy/fidelity guidance, catalog/category/applicability/sitemap parity and related links to Image Converter and Image to PDF.

## Final decision for this lane

FT-13 is **NOT PUBLISHABLE as of 2026-09-12**. The safe libheif-derived browser wrappers observed do not meet the current libheif security floor, and the non-libheif TypeScript source candidate does not yet provide a verified exact distribution package/maturity boundary suitable for hostile-file processing.

Keep `/file-tools/heic-to-jpg` absent. Do not add decoder dependencies, catalog/schema/sitemap entries or placeholder SEO content. Advance FigureNest to evidence-based calculator/content expansion. Reopen FT-13 only when a candidate materially changes the security/distribution evidence rather than on a timer.