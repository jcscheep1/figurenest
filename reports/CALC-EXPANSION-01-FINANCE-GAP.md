# Calculator Expansion 01 — Finance Gap Research

Status: **RESEARCH / SAFE NEXT LANE**

Base production main: `cf5221ab3f61daac3a6b63e855b0290a0327f4fc`

## Why this lane now

FT-13 HEIC→JPG closed NOT PUBLISHABLE without exposing a route. FigureNest can therefore return to calculator/content expansion without waiting on a decoder ecosystem change.

The live FigureNest directory currently has 180 published tools across 15 categories. Money & Finance already covers mortgages, loans, savings, interest, tax, VAT and related planning tools, but there is no dedicated **loan amortization schedule** or **multi-debt payoff** tool in the published directory.

Current search-result evidence shows both intents remain established calculator categories in 2026:

- Calculator.net publishes a dedicated Amortization Calculator with monthly schedule, total interest and optional extra payments.
- Calculator.net publishes a dedicated Debt Payoff Calculator focused on multiple debts and avalanche ordering.
- Newer competitors such as Loans.net, DebtBloom and Tweakee also expose amortization/debt-payoff schedules, payoff dates and extra-payment modelling.

This is a better next expansion direction than another thin percentage/unit variant because it adds distinct user intent and materially deeper output.

## Candidate A — Loan Amortization Calculator

Proposed canonical: `/calculators/amortization-calculator`

Primary intent: generate a fixed-rate amortization schedule from principal, APR and term.

Minimum useful v1:

- principal;
- annual interest rate;
- years/months term;
- optional start date;
- optional recurring extra monthly principal;
- monthly payment;
- total interest and total repayment;
- payoff date;
- month-by-month or year-by-year principal/interest/balance schedule;
- CSV export using the existing spreadsheet-safety contract.

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
- related links to Loan, Mortgage, Auto Loan, Student Loan and Compound Interest tools where applicable;
- non-thin visible schedule guidance and no financial-advice claims.

## Candidate B — Debt Payoff Calculator

Proposed canonical: `/calculators/debt-payoff-calculator`

Primary intent: model payoff of multiple debts and compare avalanche vs snowball ordering.

Minimum useful v1:

- multiple debts with label, balance, APR and minimum payment;
- extra monthly payment;
- avalanche and snowball modes;
- deterministic rollover of freed minimum payments;
- payoff order, debt-free month/date, total interest and total paid;
- warning when a minimum payment does not cover monthly interest;
- optional comparison summary showing interest/time difference between strategies.

Correctness gates:

- no infinite loop when payment <= interest accrual;
- stable ordering for equal APR/balance cases;
- exact rollover once a debt reaches zero;
- no overpayment leakage into a cleared balance;
- explicit assumptions around fixed APR and fixed minimum payment inputs;
- bounded simulation horizon and finite-number checks.

## Priority decision

**Build Candidate A first: Loan Amortization Calculator.**

Reasons:

1. It has a simpler correctness surface than multi-debt payoff while still adding substantial distinct value.
2. The amortization engine and schedule can later be reused by debt payoff, mortgage-extra-payment and loan-payoff experiences.
3. It naturally strengthens internal linking across the existing Money & Finance cluster.
4. It can ship without new third-party runtime dependencies.

Candidate B should follow only after Candidate A's schedule engine and rounding behavior are production-green.

## Preflight before implementation

- Reconcile current main and open finance PRs again before writing code.
- Confirm no existing hidden/alias amortization route or engine would create duplicate intent.
- Reuse current currency preferences and spreadsheet-safe export helpers rather than inventing local variants.
- Add focused reference fixtures before production wiring.
- Keep the first PR isolated to one canonical tool and shared schedule logic only where demonstrably reusable.
- Run full Validate FigureNest and authoritative Vercel preview checks on the exact head before merge.
