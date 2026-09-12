# FT-12 — PNG/JPG/WebP Image Converter Gate

Status: **PUBLICATION CANDIDATE / EXACT-HEAD RELEASE QA REQUIRED**

Target route: `/file-tools/image-converter`

## Product boundary

FT-12 is a browser-local still-image converter for PNG, JPEG/JPG and WebP. It must not upload image bytes, filenames or decoded pixel data to FigureNest or a third-party conversion service. The initial implementation uses browser image decoding plus Canvas export rather than adding a conversion dependency.

The tool intentionally does not claim animation preservation. Animated WebP must be rejected or clearly disclosed as a still-frame conversion before publication. HEIC/HEIF is out of scope and remains FT-13 because native browser decode coverage is not reliable enough for a general HEIC→JPG promise.

## Security and resource gates

- Validate extension, reported MIME and magic bytes with the shared file-tools foundation before decode.
- WebP validation must verify both the RIFF marker and the WEBP marker; the generic RIFF prefix alone is insufficient.
- Apply existing per-device compressed input limits and a 40,000,000 decoded-pixel ceiling.
- Fail closed on corrupt/undecodable images.
- Revoke every object URL and release canvas/image references on reset/unmount/error.
- No fetch/XHR/WebSocket/storage path may receive user file content or filenames.
- Conversion stays single-file/single-decode to bound peak mobile memory.

## Fidelity contract

- PNG output preserves alpha when the browser decoder/canvas path supports it.
- WebP output preserves alpha when supported by the browser encoder; feature-detect `canvas.toBlob('image/webp')` before enabling the format.
- JPEG output always flattens transparency onto white and must show this before conversion.
- Quality control applies to JPEG/WebP only; PNG quality UI is disabled/hidden.
- Preserve decoded orientation as exposed by the browser. Do not promise EXIF metadata retention: Canvas export may strip metadata including EXIF/ICC details.
- Output dimensions equal decoded source dimensions; no implicit resize in FT-12 v1.

## UI contract

The published page must use `.file-tool-page`, import `file-tools.css` and `file-tool-buttons.css`, and rely on the shared action-button contract. Upload/select, Convert, Download and Reset are normal actions: enabled = FigureNest blue with contrasting text, disabled = grey. Destructive actions remain red. Do not add local CSS that overrides those semantics.

Required desktop and 390×844 mobile QA includes the native file-picker button, format selector, quality control, transparency disclosure, Convert, Download and Reset states.

## SEO contract

Proposed intent:

- H1: `Image Converter — Convert PNG, JPG & WebP Online`
- title: `PNG, JPG & WebP Image Converter | FigureNest`
- description: `Convert PNG, JPG/JPEG and WebP images privately in your browser. Choose the output format and quality, preview the result and download without uploading your image.`
- category: `file-tools`
- tags: `image converter`, `PNG to JPG`, `JPG to PNG`, `WebP converter`, `PNG to WebP`, `WebP to JPG`

Before release add canonical route, breadcrumb + WebApplication + FAQ schema, sitemap/catalog/category parity, related internal links, useful FAQs and non-thin visible guidance covering privacy, transparency, quality, metadata, animation and browser support. Related links should include Image→PDF and PDF→JPG/PNG without duplicating those intents.

## Required fixtures before publish

1. Transparent PNG → JPEG: white background, exact dimensions.
2. Transparent PNG → WebP and PNG: alpha retained where supported.
3. JPEG with EXIF orientation: decoded orientation is visually correct; metadata-loss disclosure visible.
4. Valid still WebP → PNG/JPEG.
5. Animated WebP: explicit rejection/disclosure behavior verified.
6. Corrupt extension/MIME/signature combinations: rejected before conversion.
7. Compressed image whose decoded pixels exceed 40 MP: rejected.
8. Desktop and 390×844 mobile native picker/button-state visual QA.
9. Network/storage instrumentation: zero user-file payload/name leakage.

## Merge gate

Do not expose the public route or merge until automated exact-head checks and all desktop/mobile/privacy/fidelity gates above pass. If a target browser cannot encode WebP reliably, disable WebP output there rather than silently producing PNG or a mislabeled file.
