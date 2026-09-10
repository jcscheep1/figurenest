# FT-01 local file privacy contract

This file documents the shared browser-only boundary used by later FigureNest PDF & File Tools.

- Selected document bytes remain in the current browser tab's memory.
- The foundation has no upload, server persistence, analytics payload, browser storage, or logging path for file names or contents.
- File identity is checked with extension, MIME type, and configured magic-byte signatures rather than trusting the filename alone.
- Input limits are centralized at 25 MB for mobile and 75 MB for desktop until later tool-specific measurements justify a tighter or different limit.
- ArrayBuffers can be explicitly cleared before references are released. Object URLs are centrally tracked and revoked idempotently.
- Worker jobs use transferable ArrayBuffers, an explicit cancel message, and deterministic termination.
- Later public tools must add browser-level network interception tests around their actual user-facing route before using the stronger marketing copy “Your files stay on this device.”
- Later format engines remain route-level lazy imports and must not use runtime CDNs or cloud conversion fallbacks.

FT-01 itself deliberately publishes no category, route, catalog entry, schema, sitemap URL, or placeholder tool. It adds no conversion dependency.
