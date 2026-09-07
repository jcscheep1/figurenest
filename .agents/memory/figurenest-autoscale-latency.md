---
name: FigureNest Autoscale latency
description: Owner decision and reporting boundary for FigureNest production response latency
---

Keep FigureNest on Replit Autoscale rather than switching it to an always-on Reserved VM. Treat application startup and platform wake-up as separate latency components.

**Why:** The owner explicitly chose usage-based Autoscale. September 2026 production logs showed that a large share of the observed cold delay was controllable: the artifact router waited for both runnable ports while the web process launched through package-manager and TypeScript tooling. The live edge also injected a `GAESA` affinity cookie and rewrote otherwise-public responses to private caching.

**How to apply:** Keep the production web listener minimal and direct, measure launch-to-health separately from first-file service, and keep public files prerendered. After every publish, recheck live cookies and effective Cache-Control; application headers alone cannot prove that the Replit edge preserved shared caching.