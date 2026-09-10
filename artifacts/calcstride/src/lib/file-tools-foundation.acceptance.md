# FT-01 acceptance evidence

The foundation PR is intentionally non-public and dependency-free.

## Implemented in this branch

- Typed deterministic job states: idle, validating, ready, processing, succeeded, failed, cancelled.
- Local Blob/ArrayBuffer reading with AbortSignal support and FileReader fallback.
- Central mobile/desktop size caps (25 MB / 75 MB).
- Extension + MIME + magic-byte validation with typed errors.
- Explicit ArrayBuffer clearing helper.
- Idempotent Object URL registry and cleanup.
- Transferable worker start protocol, explicit cancel message, and termination.
- Accessible native file input, keyboard-operable buttons, drag/drop, progress, live status, error alert, cancel and reset controls.
- Regression tests for lifecycle, hostile/mismatched/empty/oversized inputs, cancellation, cleanup, worker behavior, and a static privacy-surface guard.

## Deliberately deferred to the first public file-tool route

A real browser-route network interception test cannot meaningfully exercise an unpublished component. FT-02 must add route-level browser verification that sentinel file names/bytes never enter fetch/XHR/beacon/WebSocket/form traffic or browser persistence before the public UI may use the stronger “Your files stay on this device” marketing sentence.

## Expected bundle/count impact

Because FT-01 adds no imports to App/routes/catalog and no package dependency, these modules are not reachable from the production entry graph. Expected initial production JS delta is zero and published tool/category/sitemap counts must remain unchanged. CI/static audit remains authoritative.
