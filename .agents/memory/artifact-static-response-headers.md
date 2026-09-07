---
name: Artifact static response headers
description: Response-header and cache-control limits of Replit static web artifacts
---

Treat root `.replit` static response-header rules as best-effort when the project is published through a static web artifact. A runnable Autoscale web service can instead own response headers, caching, compression, and request redirects while continuing to serve a prerendered build.

**Why:** The artifact schema validates a `[services.production.run]` command for the FigureNest web service, so the application can set response headers. However, the live Autoscale edge has been observed adding an affinity cookie and changing public responses to private caching after the application responds.

**How to apply:** Keep browser and dedicated CDN cache directives configured, verify the runnable web service after every publish, and treat live response cookies/effective headers as authoritative. Keep API traffic on its separate artifact path.