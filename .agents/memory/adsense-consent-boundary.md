---
name: AdSense consent boundary
description: Durable ownership rules for FigureNest AdSense, Google CMP signals, analytics consent, and optional placements.
---

FigureNest must have one authoritative AdSense publisher loader on its exact public production hosts. Consent Mode v2 advertising purposes default to denied, and a Google-certified CMP—not the custom analytics panel—owns subsequent advertising consent signals. Analytics preference updates must change `analytics_storage` only.

**Why:** The publisher configuration and placement code once remained in the project while their loader was disconnected, so the live page could expose the publisher identity without loading the provider. Reusing the analytics preference as advertising consent would also override certified-CMP decisions.

**How to apply:** Keep provider loading host- and route-gated, prevent duplicate publisher tags, and stop providers when entering noindex/private routes. Optional explicit placements render only when a slot is configured, the provider is ready, and CMP values permit ads; otherwise render no placeholder.