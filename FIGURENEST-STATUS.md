# FigureNest Master Control List

**Source of truth:** this file.
**Repository:** `jcscheep1/figurenest`
**Production:** `https://figurenest.com`
**Last reset:** 2026-09-08

## Operating rule

FigureNest work follows this gate for every change:

**CODE -> TEST -> DEPLOY -> LIVE VERIFY -> CLOSE**

An item is not complete just because code was changed or deployed. It is only **CLOSED** after production verification.

### Status meanings

- 🔴 **CRITICAL** — blocks indexing, core functionality, or deployment reliability.
- 🟠 **ACTIVE** — confirmed work currently required.
- 🟡 **VERIFY** — reported/fixed previously but must be checked against current production before closing.
- ⬜ **WAITING** — intentionally queued behind higher-priority work.
- ✅ **CLOSED** — verified on production. Do not return to the outstanding list unless new evidence proves a regression.
- ♻️ **REOPENED** — previously closed, but a new live production check proves it regressed. Evidence and date are mandatory.

## Master priority queue

| ID | Priority | Work item | Status | Closure evidence required | Notes |
|---|---:|---|---|---|---|
| FN-001 | P0 | `robots.txt` production correctness | 🔴 CRITICAL | Fetch live `/robots.txt`; confirm 200, correct directives, no accidental blocking, and sitemap declaration points to the canonical production sitemap | User explicitly set this as top priority |
| FN-002 | P0 | Production sitemap correctness | 🔴 CRITICAL | Fetch live sitemap; confirm 200, valid XML, canonical `https://figurenest.com` URLs, no draft/non-canonical routes, expected calculator coverage, and robots reference | Must be checked together with FN-001 |
| FN-003 | P1 | Calculator/tool inventory count | ✅ CLOSED | Homepage and `/calculators/` both show 162 published tools/results on production | Fixed by deduplicating directory entries by canonical destination; commit `3be640768d4e868997202d72c89423944271dab7`; live verified 2026-09-08 |
| FN-004 | P1 | Directory/category filtering | 🟡 VERIFY | Test every top-level category on production, including Home & Construction -> Electrical; verify correct tools appear and counts update | Previous issue reported around category filtering |
| FN-005 | P1 | Calculator functional audit | 🟠 ACTIVE | One-by-one production test of every calculator: inputs, units, validation, formulas, result rendering, mobile usability | Track individual failures as child IDs, never duplicate them |
| FN-006 | P2 | Calculator content depth & advanced/basic UX | ⬜ WAITING | Verify each calculator has sufficient useful explanation, assumptions, examples, advanced/basic controls where applicable, and no hidden inputs | Starts after P0/P1 core correctness |
| FN-007 | P2 | SEO/indexability/schema/internal linking | ⬜ WAITING | Production crawl/check: title/meta/canonical/H1/schema/breadcrumbs/internal links/indexability for key templates and representative calculators | Do not run as a full reset while repair work is active |
| FN-008 | P2 | Mobile/performance/accessibility | ⬜ WAITING | Fresh production PageSpeed/Lighthouse plus manual mobile UX check after functional/SEO changes are stable | Avoid optimizing against stale builds |
| FN-009 | P3 | Final production audit | ⬜ WAITING | All preceding open items closed or explicitly deferred; fresh end-to-end live audit with no unresolved P0/P1 issues | Final gate before expansion work |

## Calculator issue register

Create a child ID under FN-005 for every specific calculator problem. Never add the same problem twice.

| ID | Calculator | Issue | Status | Last evidence |
|---|---|---|---|---|
| FN-005-A | Shoe Size Converter | Previous reports included inaccurate conversion and adult-only coverage | 🟡 VERIFY | Historical report only; do not classify as outstanding again unless current production test fails |
| FN-005-B | Time Card Calculator | Previous report: result showed time worked but not pay | 🟡 VERIFY | Historical report only; verify current production behavior before reopening |

## Closed-item protection

Once an item is marked ✅ **CLOSED**:

1. It remains closed in all future status reports.
2. Old audits, old chats, screenshots, or stale reports cannot reopen it.
3. To reopen it, record:
   - the exact production URL,
   - what failed,
   - the date/time of the new check,
   - the evidence/source of the failure,
   - and set status to ♻️ **REOPENED**.

This prevents previously solved work from silently re-entering the queue.

## Audit discipline

- Do **not** start a fresh full-site audit while a higher-priority repair batch is still active unless the purpose is to verify that batch.
- Targeted verification comes before another broad audit.
- Audit findings are compared against this file before being reported.
- Existing IDs are updated; duplicate IDs are not created.
- New work is appended without resetting the queue.

## Deployment discipline

For every code change, record the state explicitly:

| Stage | Meaning |
|---|---|
| CODE | Change exists in repository/source |
| TEST | Relevant local/CI tests passed |
| DEPLOY | Commit/build reached production deployment |
| LIVE VERIFY | `figurenest.com` checked directly |
| CLOSE | Evidence recorded and item marked ✅ |

A deployment by itself is **not** proof of completion.

## Status update format

Every FigureNest status update should use this structure instead of reconstructing the project from old conversations:

### Completed since last update
Only newly production-verified closures.

### Active now
Only items with 🔴, 🟠, 🟡, or ♻️ status.

### Blocked
Only genuine blockers, with the exact dependency or failure.

### Next 3 actions
Exactly the next three actions in priority order.

### Closed items
Do not repeat the full closed history unless specifically requested.

## Current next three actions

1. **FN-001:** Verify and, if necessary, repair production `robots.txt`.
2. **FN-002:** Verify and, if necessary, repair production sitemap and its robots declaration.
3. **FN-004:** Verify directory/category filtering across production.

---

### Rule for future agents/automation

Before starting or reporting FigureNest work, read this file first. Update the existing ID instead of creating a duplicate issue. A historical problem is not an outstanding problem until current production evidence confirms it.