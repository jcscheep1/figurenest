---
name: Mobile homepage flow
description: Android layout constraint for FigureNest homepage content and interactive search results.
---

Visible homepage sections and search suggestions must participate in normal document flow. Do not apply `content-visibility` with intrinsic-size containment to the long homepage, and do not absolutely position the search result list over following content.

**Why:** Narrow Android Chrome rendered stale or collapsed geometry when the long page combined contained sections with an out-of-flow search list, causing toolkit, statistics, headings, and cards to overlap.

**How to apply:** Preserve performance through code splitting and idle/lazy loading of non-visible services. Let search expansion increase document height, and use responsive stacking for dense trust/statistics and section-heading rows.