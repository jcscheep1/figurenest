---
name: Analytics release gates
description: Non-code privacy settings required before publishing FigureNest analytics changes
---

FigureNest must use only its consent-gated GA4 integration. Replit Publishing Analytics must remain disabled, and GA4 Enhanced Measurement's “Page changes based on browser history events” option must be disabled for the FigureNest web stream.

**Why:** Replit can inject Umami outside the app code, and GA4 Enhanced Measurement can emit history-based SPA page views independently of `send_page_view: false`. Either setting would violate the one-provider or one-canonical-page-view guarantees.

**How to apply:** Treat both settings as hard release gates before every publish or republish, then verify the production network on public and private routes before and after analytics consent.