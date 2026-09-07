---
name: Consolidated release validation
description: Validation cadence for multi-page FigureNest quality batches.
---

For a cohesive multi-page quality batch, implement the related changes together and run one consolidated static/build/browser review after the batch is assembled. Avoid repeating the full release test after every individual page.

**Why:** The project owner explicitly prefers planned, accurate batches and fewer redundant validation cycles.

**How to apply:** Use focused checks while coding only when needed to catch local errors; reserve the complete test, SEO crawl, responsive browser pass, and architecture review for the assembled batch.