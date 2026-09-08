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
| FN-004 | P1 | Directory/category filtering | ✅ CLOSED | Live Chrome test exercised all 14 category buttons; each count matched rendered cards; Home & Construction returned 25 combined results including Electrical; Electrical alone returned 4 | Production browser run `34265387711` passed 2026-09-08 |
| FN-005 | P1 | Calculator functional audit | 🟠 ACTIVE | One-by-one production test of every calculator: inputs, units, validation, formulas, result rendering, mobile usability | Current issue register A-M is fully closed; use `FIGURENEST-FUNCTIONAL-AUDIT.md` as the calculator-by-calculator cursor and do not retest completed rows |
| FN-006 | P2 | Calculator content depth & advanced/basic UX | ⬜ WAITING | Verify each calculator has sufficient useful explanation, assumptions, examples, advanced/basic controls where applicable, and no hidden inputs | Starts after P0/P1 core correctness |
| FN-007 | P2 | SEO/indexability/schema/internal linking | ⬜ WAITING | Production crawl/check: title/meta/canonical/H1/schema/breadcrumbs/internal links/indexability for key templates and representative calculators | Do not run as a full reset while repair work is active |
| FN-008 | P2 | Mobile/performance/accessibility | ⬜ WAITING | Fresh production PageSpeed/Lighthouse plus manual mobile UX check after functional/SEO changes are stable | Avoid optimizing against stale builds |
| FN-009 | P3 | Final production audit | ⬜ WAITING | All preceding open items closed or explicitly deferred; fresh end-to-end live audit with no unresolved P0/P1 issues | Final gate before expansion work |

## Calculator issue register

Create a child ID under FN-005 for every specific calculator problem. Never add the same problem twice.

| ID | Calculator | Issue | Status | Last evidence |
|---|---|---|---|---|
| FN-005-A | Shoe Size Converter | Previous reports included inaccurate conversion and adult-only coverage | ✅ CLOSED | Live Chrome verification 2026-09-08 confirmed Baby / toddler, Children / youth, Women and Men modes and a working youth conversion |
| FN-005-B | Time Card Calculator | Previous report: result showed time worked but not pay | ✅ CLOSED | Live Chrome verification 2026-09-08 showed $160.00 gross pay for 09:00–17:30, 30-minute break, hourly rate 20, plus Regular pay breakdown |
| FN-005-C | Markup Calculator | Zero-cost selling price previously displayed equivalent margin as `0%` instead of mathematically undefined | ✅ CLOSED | Source fix `f01fde5c20cc35ed124ff772a6d0fbdef2419b66`; live Chrome verification 2026-09-08 confirmed zero-cost equivalent margin displays `Not defined` |
| FN-005-D | Unit/measurement converters | Small valid converted values could display as zero due to two-decimal result formatting | ✅ CLOSED | Precision fix `309122842f9df68d89f43074e671ec45aaf36966`; live Chrome verification 2026-09-08 returned `0.000001 km` for 0.001 m |
| FN-005-E | Commission Calculator | Blank optional base-pay field was rejected by shared required-number validation | ✅ CLOSED | Fix `4a421360a1ce35eb8000c41847fd759e9b8ec5c9`; live Chrome verification 2026-09-08 accepted blank base pay and returned $800.00 for 10,000 sales at 8% |
| FN-005-F | APR Calculator | Repayment validation compared scheduled payments with gross loan amount instead of net cash received | ✅ CLOSED | Fix `518e16add2859d16e026c88d1c1c78d872a7c0ff`; live Chrome verification 2026-09-08 returned `0.40% APR` for 10000 amount, 200 fees, 9800 received, 165 × 60 |
| FN-005-G | Roman Numeral Converter | Decimal inputs within 1–3999 were accepted and silently truncated by conversion loop | ✅ CLOSED | Fix `518e16add2859d16e026c88d1c1c78d872a7c0ff`; live Chrome verification 2026-09-08 rejected 1.5 as non-whole and returned `MMXXVI` for 2026 |
| FN-005-H | Matrix Calculator | Determinant/inverse incorrectly required Matrix B fields although those operations only use Matrix A | ✅ CLOSED | Fix `aef8d028d256a8553ec51892e2ebae913a6c19d5`; live Chrome verification 2026-09-08 returned determinant `-2` with Matrix B fields blank |
| FN-005-I | Percentage Calculator | Blank required numeric inputs could be coerced to zero and return plausible results | ✅ CLOSED | Fix `aef8d028d256a8553ec51892e2ebae913a6c19d5`; live Chrome verification 2026-09-08 rejected blank input, returned 20 for 25% of 80, and preserved true zero as valid |
| FN-005-J | Auto Lease Calculator | Fractional monthly lease terms such as 36.5 were accepted even though lease terms are whole months | ✅ CLOSED | Whole-month validation and UI step merged in `64aca09a25cbd2d2caa98ecb69c4e97b225e2461` (PR #45); live Chrome run `34266278643` on 2026-09-08 confirmed `step=1`, 36.5 rejected, and 36 months returned `$503.61/month` |
| FN-005-K | ROI Calculator | Valid finite returns above 100,000% were rejected by an arbitrary shared business percentage cap | ✅ CLOSED | Guard changed to reject only non-finite ROI in `765b3ea6500291a81d5a83d2fb3b0c84124e1fc8`; full calcstride suite and typecheck passed; all Vercel checks green; live Chrome run `34266278643` on 2026-09-08 confirmed initial 1 → final 2000 returns `199,900%` |
| FN-005-L | Ovulation, Period & Conception Date Estimator | Impossible Gregorian dates could be normalized instead of rejected | ✅ CLOSED | Strict Gregorian validation merged in PR #40; regression rejects 2026-02-30, 2025-02-29 and 2026-04-31; live Chrome run `34266807463` on 2026-09-08 confirmed valid leap day 2024-02-29 produces next period 2024-03-28 and ovulation 2024-03-14 |
| FN-005-M | Profit Margin Calculator | Valid finite negative margins below -100,000% were rejected by an arbitrary percentage cap | ✅ CLOSED | Guard changed to reject only non-finite percentage results in `2afe53104f35a7fd9bce9b5df6a44f54ac65b42a`; full calcstride suite/typecheck passed; all Vercel checks green; live Chrome run `34267127384` confirmed cost 2000 / price 1 returns `-199,900%`, $1,999 gross loss and -99.95% markup |

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
- `FIGURENEST-FUNCTIONAL-AUDIT.md` records calculators that passed without a defect as well as repaired calculators, so the one-pass audit has a durable cursor.

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

1. **FN-005:** Continue from the next unchecked row in `FIGURENEST-FUNCTIONAL-AUDIT.md`; add a child ID only for a fresh confirmed defect.
2. **FN-005:** For each newly confirmed defect, repair -> test -> deploy -> live verify -> close before moving on.
3. **FN-006:** Once the functional ledger reaches every published calculator, begin calculator content-depth and Basic/Advanced UX verification without reopening closed functional issues.

---

### Rule for future agents/automation

Before starting or reporting FigureNest work, read this file and `FIGURENEST-FUNCTIONAL-AUDIT.md` first. Update the existing ID/row instead of creating a duplicate issue. A historical problem is not an outstanding problem until current production evidence confirms it.