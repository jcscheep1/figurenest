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
| FN-001 | P0 | `robots.txt` production correctness | ✅ CLOSED | Live `/robots.txt` returned 200 text/plain; public crawl allowed; 9 private paths blocked; no sitewide block; canonical `https://figurenest.com/sitemap.xml` declared | Live verified by production indexing audit 2026-09-08; reusable audit added in commit `9217b5dc948d2e989bfd6c6ae1f19f778471772e` |
| FN-002 | P0 | Production sitemap correctness | ✅ CLOSED | Live `/sitemap.xml` returned 200 application/xml; 196 canonical unique URLs exactly matched the published route inventory; no duplicates/private routes; valid `lastmod` values; robots declaration matched | Canonical route dedupe fixed in commit `8acdfda5368d6751fca6297ed5f8edd872ba1e59`; live verified 2026-09-08 |
| FN-003 | P1 | Calculator/tool inventory count | ✅ CLOSED | Homepage and `/calculators/` both show 162 published tools/results on production | Fixed by deduplicating directory entries by canonical destination; commit `3be640768d4e868997202d72c89423944271dab7`; live verified 2026-09-08 |
| FN-004 | P1 | Directory/category filtering | 🟡 VERIFY | Test every top-level category on production, including Home & Construction -> Electrical; verify correct tools appear and counts update | Electrical discoverability code/tests advanced in commits through `1c7b504e93c1f33a2346727b546573b8cfad48bb`; still requires production interaction verification before closing |
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
| FN-005-C | Markup Calculator | Zero-cost selling price previously displayed equivalent margin as `0%` instead of mathematically undefined | 🟡 VERIFY | Source fix + regression tests merged in `f01fde5c20cc35ed124ff772a6d0fbdef2419b66`; Vercel production deployment green; needs fresh live calculator verification before closing |
| FN-005-D | Unit/measurement converters | Small valid converted values could display as zero due to two-decimal result formatting | 🟡 VERIFY | Precision-aware formatter + regression tests merged in `309122842f9df68d89f43074e671ec45aaf36966`; needs fresh live converter verification before closing |
| FN-005-E | Commission Calculator | Blank optional base-pay field was rejected by shared required-number validation | 🟡 VERIFY | Optional-input normalization + regression tests merged in `4a421360a1ce35eb8000c41847fd759e9b8ec5c9`; all three Vercel deployments green; needs fresh live verification |
| FN-005-F | APR Calculator | Repayment validation compares scheduled payments with gross loan amount instead of net cash received | 🟠 ACTIVE | Confirmed on current shared engine; PR #37 contains focused red regression. Example: 10000 amount, 200 withheld fees, 9800 received, 60 × 165 should be valid because 9900 > 9800 net proceeds |
| FN-005-G | Roman Numeral Converter | Decimal inputs within 1–3999 are accepted and silently truncated by conversion loop | 🟠 ACTIVE | PR #38 contains focused red regression; source needs a whole-number guard before conversion |
| FN-005-H | Matrix Calculator | Determinant/inverse incorrectly require Matrix B fields although those operations only use Matrix A | 🟠 ACTIVE | PR #41 contains focused red regression; source needs operation-aware validation and UI cleanup |
| FN-005-I | Percentage Calculator | Blank required numeric inputs can be coerced to zero and return plausible results | 🟠 ACTIVE | PR #32 contains focused red regression; source requires safe blank-input validation |

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

1. **FN-004:** Live-verify directory/category filtering across production, including Home & Construction -> Electrical.
2. **FN-005-F/G/H/I:** Repair the confirmed APR, Roman Numeral, Matrix, and Percentage defects one-by-one; never merge test-only red branches.
3. **FN-005-C/D/E:** Fresh-live verify the newly deployed Markup, converter-precision, and Commission repairs, then close each only if production passes.

---

### Rule for future agents/automation

Before starting or reporting FigureNest work, read this file first. Update the existing ID instead of creating a duplicate issue. A historical problem is not an outstanding problem until current production evidence confirms it.