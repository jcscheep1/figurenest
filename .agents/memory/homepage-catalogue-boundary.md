---
name: Homepage catalogue boundary
description: Why homepage discovery metadata must remain separate from full calculator definitions.
---

Keep homepage search, categories, counts, and route matching on lightweight static metadata. Full formulas, educational content, and calculator implementations belong only in deferred page-family chunks. Maintain parity tests across the two representations.

Treat both published-tool and active-category totals as derived values. Do not preserve a number from an external audit when it conflicts with the canonical catalog, and do not invent or duplicate a category merely to match that report.

**Why:** Importing full definition registries into the shared catalogue caused the homepage to preload large calculator-content chunks, adding substantial transfer and main-thread work even though discovery pages needed only names, descriptions, tags, and links. External audits can also retain old inventory totals after the catalog changes.

**How to apply:** When adding or changing a published calculator, update the lightweight catalogue/route metadata and its full definition together. Render totals from the catalog, preserve route-family precedence, and rely on parity tests to catch drift.