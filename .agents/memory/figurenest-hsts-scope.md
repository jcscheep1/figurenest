---
name: FigureNest HSTS scope
description: The agreed HSTS coverage for the canonical and www FigureNest hosts.
---

Use `Strict-Transport-Security: max-age=63072000; includeSubDomains` on served responses. Do not add `preload`.

**Why:** The launch audit explicitly requires two-year HSTS coverage for both the apex and www host while deliberately avoiding the hard-to-reverse preload program.

**How to apply:** Keep response audits pinned to the exact value. Revisit only if a real FigureNest subdomain cannot support HTTPS.