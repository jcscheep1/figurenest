# Calculator Expansion 01 — Finance Gap Research

Status: **BUILD / AMORTIZATION ACTIVE**

Base production main: `cf5221ab3f61daac3a6b63e855b0290a0327f4fc`

## Why this lane now

FT-13 HEIC→JPG closed NOT PUBLISHABLE without exposing a route. FigureNest can therefore return to calculator/content expansion without waiting on a decoder ecosystem change.

The live FigureNest directory currently has 180 published tools across 15 categories. Money & Finance already covers mortgages, loans, savings, interest, tax, VAT and related planning tools. It also already covers debt-payoff intent through the published **Credit Card Payoff Calculator** and **Debt Consolidation Calculator**, whose catalog tags explicitly include debt payoff. A second generic debt-payoff route would therefore duplicate an existing canonical intent and is not an approved follow-on lane.

A dedicated **general loan amortization schedule** remains a genuine gap. FigureNest has a mortgage-specific amortization tool, but not a loan-agnostic schedule that accepts principal, annual interest rate, term and optional recurring extra principal and returns a full repayment schedule.

Current search-result evidence shows amortization remains an established calculator intent in 2026. Competing calculators expose monthly schedules, total interest, payoff timing and extra-payment modelling. This is a better next expansion direction than another thin percentage/unit variant because it adds distinct user intent and materially deeper output.

## Active candidate — Loan Amortization Calculator

Proposed canonical: `/calculators/amortization-calculator`

Primary intent: generate a fixed-rate amortization schedule from principal, annual interest rate and term for a general loan, distinct from the existing mortgage-specific amortization route.

Minimum useful v1:

- principal;
- annual interest rate;
- years/months term;
- optional start date;
- optional recurring extra monthly principal;
- monthly payment;
- total interest and total repayment;
- payoff date;
- month-by-month and/or year-by-year principal/interest/balance schedule;
- CSV export only if it reuses FigureNest's existing spreadsheet-safety contract rather than introducing a local export variant.

Correctness gates:

- 0% rate path must avoid divide-by-zero and return principal / payment-count;
- reject negative principal/rate/term and non-finite values;
- whole positive payment-count boundary;
- last-payment rounding must not create a negative residual balance;
- extra payment must reduce balance only after scheduled interest and must stop after payoff;
- independently verify representative reference schedules and aggregate totals;
- make clear the tool models a fixed-rate fully amortizing loan and does not reproduce lender-specific fees, daily-interest conventions or APR fee treatment.

SEO/content contract before publication:

- search-intent H1/title/meta centered on “amortization calculator” and “loan amortization schedule”;
- useful visible explanation of principal vs interest and why the mix changes over time;
- FAQs covering extra payments, 0% loans, APR vs interest rate, early payoff and rounding;
- WebApplication + FAQ + breadcrumb schema;
- related links to Loan, Mortgage, Auto Loan, Mortgage Amortization and Compound Interest tools where applicable;
- non-thin visible schedule guidance and no financial-advice claims.

## Duplicate-intent guard — do not add a generic Debt Payoff Calculator

The repository's existing intent-consolidation note and published catalog make the current boundary explicit:

- `/calculators/finance/debt-consolidation` already carries the `debt payoff` intent and compares a current constant-payment payoff with a consolidation loan;
- `/calculators/finance/credit-card` already provides an explicit credit-card payoff experience;
- creating `/calculators/debt-payoff-calculator` now would fragment search intent and internal linking rather than add a distinct capability.

If future evidence supports a materially different multi-debt avalanche/snowball planner, it must first demonstrate a non-overlapping user intent and canonical strategy. Until then, strengthen the existing debt-consolidation/payoff surface instead of publishing a duplicate route.

## Priority decision

**Build the Loan Amortization Calculator first and treat it as the only approved public route in this lane.**

Reasons:

1. It adds a genuine general-loan schedule capability that is distinct from the mortgage-specific amortization tool.
2. The amortization engine is reusable for future fixed-rate loan experiences without adding third-party runtime dependencies.
3. It naturally strengthens internal linking across the existing Money & Finance cluster.
4. The calculation surface is deterministic and can be regression-locked before publication.

After amortization is production-green, perform a fresh catalog/search-gap review for the next genuinely distinct calculator/content lane. Do **not** automatically advance to a generic debt-payoff calculator.

## Implementation state

The branch now contains a reusable fixed-rate amortization schedule engine plus focused regression fixtures covering a representative 100,000 / 6% / 360-month schedule, zero-interest behavior, recurring extra principal, invalid/non-finite values and zero residual balance at payoff. That exact implementation head passed Validate FigureNest and both authoritative Vercel preview statuses before public-route work began.

## Preflight before publication wiring

- Reconcile current main and branch head again immediately before each write; never overwrite a newer concurrent head.
- Keep the canonical public intent distinct from the existing mortgage-amortization route.
- Reuse current currency preferences and spreadsheet-safe export helpers rather than inventing local variants.
- Keep schedule logic covered by focused reference fixtures.
- Publish route, catalog, SEO, sitemap/category parity and internal links as one coherent release surface.
- Run full Validate FigureNest and authoritative Vercel preview checks on the exact publication head before merge.
- After merge verify production H1/title/meta/canonical/schema, sitemap/catalog/category presence, related links, calculations and responsive schedule rendering.