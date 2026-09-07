---
name: Advertising CSP rollout
description: Why FigureNest uses a report-only content security policy while Google advertising and consent services remain enabled.
---

Keep FigureNest's Content Security Policy in Report-Only until a controlled production publish has exercised AdSense, Funding Choices, analytics consent acceptance/rejection, and ordinary calculator browsing without unexpected policy reports.

**Why:** Google advertising and certified consent services can load changing nested resource origins. Enforcing an unverified allowlist could silently break consent or ad delivery even when the main application works.

**How to apply:** Review production policy reports after publishing, narrow or extend origins based on observed legitimate traffic, then enforce only after the consent and advertising paths are proven.