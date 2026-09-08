# FigureNest Functional Audit Ledger

**Purpose:** durable one-pass production cursor for FN-005.
**Rule:** a calculator is marked complete here only after production behavior has been exercised directly. Clean passes are recorded as well as repaired failures, so completed calculators are not repeatedly re-audited.

## Status meanings

- ✅ **AUDITED** — current production behavior passed the recorded cases.
- ✅ **AUDITED + REPAIRED** — a defect was found, repaired, deployed and live-verified.
- ⬜ **PENDING** — not yet production-audited in this one-pass ledger.

## Completed production audit rows

| Calculator | Route | Status | Production evidence |
|---|---|---|---|
| Shoe Size Converter | `/converters/shoe-size` | ✅ AUDITED + REPAIRED | Run `34265387711`: baby/toddler, youth, women and men modes exposed; youth conversion returned EU result; FN-005-A closed |
| Time Card Calculator | `/calculators/date-time/time-card` | ✅ AUDITED + REPAIRED | Run `34265387711`: 09:00–17:30 with 30-minute break and rate 20 returned $160.00 gross pay; FN-005-B closed |
| Markup Calculator | `/calculators/business/markup` | ✅ AUDITED + REPAIRED | Run `34265387711`: zero-cost case shows equivalent margin `Not defined`; FN-005-C closed |
| Length Converter | `/converters/length` | ✅ AUDITED + REPAIRED | Run `34265387711`: 0.001 m -> 0.000001 km without rounding to zero; FN-005-D closure evidence for precision defect |
| Commission Calculator | `/calculators/business/commission` | ✅ AUDITED + REPAIRED | Run `34265387711`: blank optional base pay accepted; 10,000 sales at 8% -> $800.00; FN-005-E closed |
| APR Calculator | `/calculators/finance/apr` | ✅ AUDITED + REPAIRED | Run `34265387711`: 10000 face, 200 fees, 9800 received, 165 x 60 -> 0.40% APR; FN-005-F closed |
| Roman Numeral Converter | `/converters/roman-numeral` | ✅ AUDITED + REPAIRED | Run `34265387711`: 1.5 rejected; 2026 -> MMXXVI; FN-005-G closed |
| Matrix Calculator | `/calculators/math/matrix` | ✅ AUDITED + REPAIRED | Run `34265387711`: determinant of [[1,2],[3,4]] -> -2 with Matrix B blank; FN-005-H closed |
| Percentage Calculator | `/calculators/finance/percentage` | ✅ AUDITED + REPAIRED | Run `34265387711`: blank rejected, 25% of 80 -> 20, true zero remains valid; FN-005-I closed |
| Auto Lease Calculator | `/calculators/finance/auto-lease` | ✅ AUDITED + REPAIRED | Run `34266278643`: term step=1; 36.5 months rejected; 36 months -> $503.61/month; FN-005-J closed |
| ROI Calculator | `/calculators/business/roi` | ✅ AUDITED + REPAIRED | Run `34266278643`: initial 1 -> final 2000 returns 199,900%; FN-005-K closed |
| Ovulation, Period & Conception Date Estimator | `/calculators/health/pregnancy-conception` | ✅ AUDITED + REPAIRED | Run `34266807463`: valid leap day 2024-02-29 -> next period 2024-03-28, ovulation 2024-03-14; strict impossible-date regressions merged in PR #40; FN-005-L closed |
| Profit Margin Calculator | `/calculators/business/profit-margin` | ✅ AUDITED + REPAIRED | Run `34267127384`: cost 2000 / price 1 -> -199,900%, $1,999 gross loss, -99.95% markup; FN-005-M closed |
| Break-Even Calculator | `/calculators/business/break-even` | ✅ AUDITED | Run `34267127384`: 12000/80/32 -> 250 units; price=variable rejected; 100/10/4 rounds 16.666... up to 17 units with $166.67 exact and $170.00 whole-unit revenue |
| Loan Calculator | `/calculators/finance/loan` | ✅ AUDITED + REPAIRED | Run `34268276394`: normal 24000 @ 7.2% / 5y remains $477.50; blank principal/rate/term rejected; zero rate remains valid; 5.01y rejected; 5.5y / 66 months accepted; UI step is one month; Advanced follows the same whole-month contract; FN-005-N and FN-005-O closed |
| Investment Calculator | `/calculators/finance/investment` | ✅ AUDITED + REPAIRED | Run `34269010115`: normal 25000 @ 6.5% / 5y -> `$34,570.43`, zero return -> `$25,000.00`, blank/negative inputs rejected, fractional years explicitly supported, extreme finite overflow rejected without `$∞`, mobile/a11y/internal-link and SEO/content checks passed; repair `c9923462763dcdadc70a8322a24459bff53f8ec6`; FN-005-P closed |
| Mortgage Calculator | `/calculators/finance/mortgage` | ✅ AUDITED + REPAIRED | Run `34269240781`: normal 360000/72000/6.5%/30y + tax/insurance -> `$2,345.36`; zero rate and invalid inputs passed; 30.01y rejected; 30.5y / 366 months accepted; UI step is one month; Advanced baseline matches Basic and rejects the same invalid term; repair `ac3d33a2cd58854d183c92daf36ee1ba7acc92fc`; FN-005-Q closed |

## Audit cursor

The **Business** category is fully covered in this ledger: ROI, Profit Margin, Markup, Break-Even, and Commission.

The systematic **Money & Finance** pass is active. Percentage, APR, Auto Lease, Loan, Investment, and Mortgage are complete and must not be retested unless fresh production evidence proves regression.

Continue with genuinely unchecked published calculators. For each calculator, verify at minimum:

1. a representative normal calculation,
2. at least one meaningful zero/boundary case,
3. at least one invalid-input case,
4. result details/units and rounding where applicable,
5. visible mode-dependent behavior where applicable.

If a fresh production defect is found, add the next FN-005 child ID in `FIGURENEST-STATUS.md`, repair it through CODE -> TEST -> DEPLOY -> LIVE VERIFY -> CLOSE, then mark the calculator complete here.

### Next audit target

**Compound Interest Calculator** — `/calculators/finance/compound-interest`

A separate 401(k) repair is already active; do not duplicate that work. Continue the Money & Finance pass with Compound Interest while skipping completed rows above.