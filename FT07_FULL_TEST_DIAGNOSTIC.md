# FT-07 full-suite diagnostic

Exit code: 1

```text

> @workspace/calcstride@0.0.0 test /home/runner/work/figurenest/figurenest/artifacts/calcstride
> tsx --test src/lib/*.test.ts

TAP version 13
# Subtest: 401(k) preserves the documented annual-compounding projection
ok 1 - 401(k) preserves the documented annual-compounding projection
  ---
  duration_ms: 16.660189
  type: 'test'
  ...
# Subtest: 401(k) keeps zero-return annual contributions exact
ok 2 - 401(k) keeps zero-return annual contributions exact
  ---
  duration_ms: 0.406893
  type: 'test'
  ...
# Subtest: 401(k) rejects fractional years because deposits are modeled annually
ok 3 - 401(k) rejects fractional years because deposits are modeled annually
  ---
  duration_ms: 0.326334
  type: 'test'
  ...
# Subtest: 401(k) years input advertises whole-year stepping
ok 4 - 401(k) years input advertises whole-year stepping
  ---
  duration_ms: 0.184554
  type: 'test'
  ...
# Subtest: clamps a leap-day anniversary to February 28 in a non-leap year
ok 5 - clamps a leap-day anniversary to February 28 in a non-leap year
  ---
  duration_ms: 16.608302
  type: 'test'
  ...
# Subtest: uses February 29 again when the next birthday year is a leap year
ok 6 - uses February 29 again when the next birthday year is a leap year
  ---
  duration_ms: 0.304642
  type: 'test'
  ...
# Subtest: keeps ordinary birthdays and completed age totals stable
ok 7 - keeps ordinary birthdays and completed age totals stable
  ---
  duration_ms: 0.305763
  type: 'test'
  ...
# Subtest: normalizes month-end borrowing across a shorter February
ok 8 - normalizes month-end borrowing across a shorter February
  ---
  duration_ms: 0.423378
  type: 'test'
  ...
# Subtest: rejects impossible dates and future birth dates
ok 9 - rejects impossible dates and future birth dates
  ---
  duration_ms: 0.193607
  type: 'test'
  ...
# Subtest: uses the fixed FigureNest GA4 measurement ID
ok 10 - uses the fixed FigureNest GA4 measurement ID
  ---
  duration_ms: 0.732595
  type: 'test'
  ...
# Subtest: allows only exact production hosts and indexable routes
ok 11 - allows only exact production hosts and indexable routes
  ---
  duration_ms: 0.590285
  type: 'test'
  ...
# Subtest: filters analytics payloads to safe allowlisted dimensions
ok 12 - filters analytics payloads to safe allowlisted dimensions
  ---
  duration_ms: 0.860445
  type: 'test'
  ...
# Subtest: Annuity accepts terms that resolve to whole monthly payout periods
ok 13 - Annuity accepts terms that resolve to whole monthly payout periods
  ---
  duration_ms: 19.37432
  type: 'test'
  ...
# Subtest: Annuity rejects terms that create fractional monthly payout periods
ok 14 - Annuity rejects terms that create fractional monthly payout periods
  ---
  duration_ms: 0.345892
  type: 'test'
  ...
# Subtest: Annuity annual mode requires whole annual payout periods
ok 15 - Annuity annual mode requires whole annual payout periods
  ---
  duration_ms: 0.483246
  type: 'test'
  ...
# Subtest: Annuity years input steps in whole-month increments
ok 16 - Annuity years input steps in whole-month increments
  ---
  duration_ms: 0.208659
  type: 'test'
  ...
# Subtest: APR accepts a valid positive-cost schedule when total payments exceed net proceeds but not gross loan amount
ok 17 - APR accepts a valid positive-cost schedule when total payments exceed net proceeds but not gross loan amount
  ---
  duration_ms: 27.481544
  type: 'test'
  ...
# Subtest: APR still rejects a schedule that does not repay more than the net cash received
ok 18 - APR still rejects a schedule that does not repay more than the net cash received
  ---
  duration_ms: 0.199396
  type: 'test'
  ...
# Subtest: Auto Loan Basic and Advanced agree when credits fully cover the purchase cost
ok 19 - Auto Loan Basic and Advanced agree when credits fully cover the purchase cost
  ---
  duration_ms: 2.817425
  type: 'test'
  ...
# Subtest: Auto Loan Advanced still rejects credits that exceed purchase cost
ok 20 - Auto Loan Advanced still rejects credits that exceed purchase cost
  ---
  duration_ms: 0.150242
  type: 'test'
  ...
# Subtest: automotive content is complete, distinct, and internally connected
ok 21 - automotive content is complete, distinct, and internally connected
  ---
  duration_ms: 1.081303
  type: 'test'
  ...
# Subtest: automotive examples align with the calculator engines
ok 22 - automotive examples align with the calculator engines
  ---
  duration_ms: 2.311826
  type: 'test'
  ...
# Subtest: the four tools explain separate cost, conversion, and time decisions
ok 23 - the four tools explain separate cost, conversion, and time decisions
  ---
  duration_ms: 0.315777
  type: 'test'
  ...
# Subtest: automotive reset units follow the metric preference
ok 24 - automotive reset units follow the metric preference
  ---
  duration_ms: 1.331784
  type: 'test'
  ...
# Subtest: automotive reset units follow the imperial preference
ok 25 - automotive reset units follow the imperial preference
  ---
  duration_ms: 0.129381
  type: 'test'
  ...
# Subtest: Average Return keeps established normal-period behavior
ok 26 - Average Return keeps established normal-period behavior
  ---
  duration_ms: 16.719527
  type: 'test'
  ...
# Subtest: Average Return accepts an exact 100% loss as a zero growth factor
ok 27 - Average Return accepts an exact 100% loss as a zero growth factor
  ---
  duration_ms: 0.321836
  type: 'test'
  ...
# Subtest: Average Return still rejects impossible losses below 100%
ok 28 - Average Return still rejects impossible losses below 100%
  ---
  duration_ms: 0.351161
  type: 'test'
  ...
# Subtest: Average Return rejects blank and non-finite return inputs
ok 29 - Average Return rejects blank and non-finite return inputs
  ---
  duration_ms: 0.18891
  type: 'test'
  ...
# Subtest: every public route except the homepage has a complete breadcrumb trail
ok 30 - every public route except the homepage has a complete breadcrumb trail
  ---
  duration_ms: 13.168665
  type: 'test'
  ...
# Subtest: every breadcrumb ancestor resolves to a public route
ok 31 - every breadcrumb ancestor resolves to a public route
  ---
  duration_ms: 25.893301
  type: 'test'
  ...
# Subtest: BreadcrumbList schema exactly matches visible breadcrumb metadata
ok 32 - BreadcrumbList schema exactly matches visible breadcrumb metadata
  ---
  duration_ms: 7.343562
  type: 'test'
  ...
# Subtest: representative hierarchies use meaningful section labels
ok 33 - representative hierarchies use meaningful section labels
  ---
  duration_ms: 0.280295
  type: 'test'
  ...
# Subtest: business calculator content is substantial, distinct, and internally connected
ok 34 - business calculator content is substantial, distinct, and internally connected
  ---
  duration_ms: 1.104296
  type: 'test'
  ...
# Subtest: worked business examples remain aligned with calculator outputs
ok 35 - worked business examples remain aligned with calculator outputs
  ---
  duration_ms: 2.567044
  type: 'test'
  ...
# Subtest: business tools explain different denominators and decision types
ok 36 - business tools explain different denominators and decision types
  ---
  duration_ms: 0.394285
  type: 'test'
  ...
# Subtest: Batch 1 business growth calculators have unique SEO and connected content
ok 37 - Batch 1 business growth calculators have unique SEO and connected content
  ---
  duration_ms: 1.110476
  type: 'test'
  ...
# Subtest: ROAS returns a revenue multiple and percentage
ok 38 - ROAS returns a revenue multiple and percentage
  ---
  duration_ms: 1.654111
  type: 'test'
  ...
# Subtest: conversion rate calculates completed conversions over opportunities
ok 39 - conversion rate calculates completed conversions over opportunities
  ---
  duration_ms: 0.204623
  type: 'test'
  ...
# Subtest: CPC calculates spend per click
ok 40 - CPC calculates spend per click
  ---
  duration_ms: 0.503827
  type: 'test'
  ...
# Subtest: CPM calculates spend per thousand impressions
ok 41 - CPM calculates spend per thousand impressions
  ---
  duration_ms: 0.245844
  type: 'test'
  ...
# Subtest: CAC calculates acquisition spend per new customer
ok 42 - CAC calculates acquisition spend per new customer
  ---
  duration_ms: 0.22909
  type: 'test'
  ...
# Subtest: denominator guards reject zero where the formula would divide by zero
ok 43 - denominator guards reject zero where the formula would divide by zero
  ---
  duration_ms: 0.257081
  type: 'test'
  ...
# Subtest: count inputs require whole numbers while monetary inputs may use decimals
ok 44 - count inputs require whole numbers while monetary inputs may use decimals
  ---
  duration_ms: 0.412662
  type: 'test'
  ...
# Subtest: blank, negative, nonnumeric, and oversized values are rejected
ok 45 - blank, negative, nonnumeric, and oversized values are rejected
  ---
  duration_ms: 0.356147
  type: 'test'
  ...
# Subtest: Batch 1 business growth tools are published through the shared catalog
ok 46 - Batch 1 business growth tools are published through the shared catalog
  ---
  duration_ms: 0.999501
  type: 'test'
  ...
# Subtest: Batch 1 business growth tools use the existing Business calculator page/content registry
ok 47 - Batch 1 business growth tools use the existing Business calculator page/content registry
  ---
  duration_ms: 0.167799
  type: 'test'
  ...
# Subtest: Batch 1 business growth tools expose their real two-field forms through coreFields
ok 48 - Batch 1 business growth tools expose their real two-field forms through coreFields
  ---
  duration_ms: 1.670705
  type: 'test'
  ...
# Subtest: shared calculateCore delegates to the Batch 1 business growth formulas
ok 49 - shared calculateCore delegates to the Batch 1 business growth formulas
  ---
  duration_ms: 2.021966
  type: 'test'
  ...
# Subtest: shared calculateCore preserves currency formatting for monetary growth tools
ok 50 - shared calculateCore preserves currency formatting for monetary growth tools
  ---
  duration_ms: 0.499871
  type: 'test'
  ...
# Subtest: shared calculateCore surfaces growth validation errors instead of generic configuration errors
ok 51 - shared calculateCore surfaces growth validation errors instead of generic configuration errors
  ---
  duration_ms: 0.35076
  type: 'test'
  ...
# Subtest: sizes a basic 230 V single-phase copper circuit
ok 52 - sizes a basic 230 V single-phase copper circuit
  ---
  duration_ms: 1.216322
  type: 'test'
  ...
# Subtest: calculates three-phase current from kW, voltage and power factor
ok 53 - calculates three-phase current from kW, voltage and power factor
  ---
  duration_ms: 0.188769
  type: 'test'
  ...
# Subtest: lower supply voltage increases current for the same single-phase power load
ok 54 - lower supply voltage increases current for the same single-phase power load
  ---
  duration_ms: 0.211754
  type: 'test'
  ...
# Subtest: feet and metres give equivalent voltage drop
ok 55 - feet and metres give equivalent voltage drop
  ---
  duration_ms: 0.188068
  type: 'test'
  ...
# Subtest: protective device never exceeds corrected cable ampacity
ok 56 - protective device never exceeds corrected cable ampacity
  ---
  duration_ms: 0.116813
  type: 'test'
  ...
# Subtest: flags a voltage drop above the selected limit
ok 57 - flags a voltage drop above the selected limit
  ---
  duration_ms: 0.278532
  type: 'test'
  ...
# Subtest: rejects invalid electrical inputs
ok 58 - rejects invalid electrical inputs
  ---
  duration_ms: 0.564376
  type: 'test'
  ...
# Subtest: directory has exact published-tool coverage and unique links
ok 59 - directory has exact published-tool coverage and unique links
  ---
  duration_ms: 9.215797
  type: 'test'
  ...
# Subtest: directory destinations use valid calculator, converter, or file-tool route shapes
ok 60 - directory destinations use valid calculator, converter, or file-tool route shapes
  ---
  duration_ms: 0.468244
  type: 'test'
  ...
# Subtest: directory search covers names, categories, descriptions, and keywords
ok 61 - directory search covers names, categories, descriptions, and keywords
  ---
  duration_ms: 12.331194
  type: 'test'
  ...
# Subtest: directory category totals reconcile with the canonical registry
ok 62 - directory category totals reconcile with the canonical registry
  ---
  duration_ms: 0.379212
  type: 'test'
  ...
# Subtest: directory supports A-Z filtering and URL-preserved filter state
ok 63 - directory supports A-Z filtering and URL-preserved filter state
  ---
  duration_ms: 1.172238
  type: 'test'
  ...
# Subtest: full CSV includes inputs and results while results scope omits inputs
ok 64 - full CSV includes inputs and results while results scope omits inputs
  ---
  duration_ms: 1.133229
  type: 'test'
  ...
# Subtest: spreadsheet export neutralizes formula-like cells
ok 65 - spreadsheet export neutralizes formula-like cells
  ---
  duration_ms: 0.166637
  type: 'test'
  ...
# Subtest: Excel and print exports escape HTML-sensitive content
ok 66 - Excel and print exports escape HTML-sensitive content
  ---
  duration_ms: 0.290581
  type: 'test'
  ...
# Subtest: export filename is stable and filesystem-friendly
ok 67 - export filename is stable and filesystem-friendly
  ---
  duration_ms: 0.218304
  type: 'test'
  ...
# Subtest: Commission calculates standard pay and optional base pay correctly
ok 68 - Commission calculates standard pay and optional base pay correctly
  ---
  duration_ms: 17.658338
  type: 'test'
  ...
# Subtest: Commission preserves valid zero and maximum-rate boundaries
ok 69 - Commission preserves valid zero and maximum-rate boundaries
  ---
  duration_ms: 0.407334
  type: 'test'
  ...
# Subtest: Commission rejects blank required fields and out-of-range rates
ok 70 - Commission rejects blank required fields and out-of-range rates
  ---
  duration_ms: 0.258333
  type: 'test'
  ...
# Subtest: compound interest advanced mode preserves ordinary growth behavior
ok 71 - compound interest advanced mode preserves ordinary growth behavior
  ---
  duration_ms: 0.839524
  type: 'test'
  ...
# Subtest: compound interest advanced mode accepts exact supported finance boundaries
ok 72 - compound interest advanced mode accepts exact supported finance boundaries
  ---
  duration_ms: 0.401054
  type: 'test'
  ...
# Subtest: compound interest advanced mode rejects amounts beyond the supported ceiling
ok 73 - compound interest advanced mode rejects amounts beyond the supported ceiling
  ---
  duration_ms: 0.129272
  type: 'test'
  ...
# Subtest: compound interest advanced mode rejects unsupported percentage assumptions
ok 74 - compound interest advanced mode rejects unsupported percentage assumptions
  ---
  duration_ms: 0.091676
  type: 'test'
  ...
# Subtest: compound interest advanced mode rejects horizons beyond 100 years and non-finite inputs
ok 75 - compound interest advanced mode rejects horizons beyond 100 years and non-finite inputs
  ---
  duration_ms: 0.143854
  type: 'test'
  ...
# Subtest: Compound Interest requires a positive horizon made of whole monthly periods
ok 76 - Compound Interest requires a positive horizon made of whole monthly periods
  ---
  duration_ms: 1.84876
  type: 'test'
  ...
# Subtest: Compound Interest normal and zero-rate calculations remain unchanged
ok 77 - Compound Interest normal and zero-rate calculations remain unchanged
  ---
  duration_ms: 0.41819
  type: 'test'
  ...
# Subtest: Advanced monthly growth engine follows the same monthly horizon contract
ok 78 - Advanced monthly growth engine follows the same monthly horizon contract
  ---
  duration_ms: 0.3107
  type: 'test'
  ...
# Subtest: dedicated concrete records are complete, distinct, and metadata-safe
ok 79 - dedicated concrete records are complete, distinct, and metadata-safe
  ---
  duration_ms: 1.452954
  type: 'test'
  ...
# Subtest: worked examples align with the production calculation
ok 80 - worked examples align with the production calculation
  ---
  duration_ms: 4.417096
  type: 'test'
  ...
# Subtest: contextual concrete links resolve to published tools with descriptive copy
ok 81 - contextual concrete links resolve to published tools with descriptive copy
  ---
  duration_ms: 0.226376
  type: 'test'
  ...
# Subtest: general concrete and slab intentionally share math but explain different intents
ok 82 - general concrete and slab intentionally share math but explain different intents
  ---
  duration_ms: 0.624406
  type: 'test'
  ...
# Subtest: bag rounding, footing count, cost units, and metric parity are preserved
ok 83 - bag rounding, footing count, cost units, and metric parity are preserved
  ---
  duration_ms: 1.609115
  type: 'test'
  ...
# Subtest: selected concrete validation rejects blanks, bounds, nonfinite, and fractional count
ok 84 - selected concrete validation rejects blanks, bounds, nonfinite, and fractional count
  ---
  duration_ms: 1.240989
  type: 'test'
  ...
# Subtest: footing input contract matches the repeated-run calculation
ok 85 - footing input contract matches the repeated-run calculation
  ---
  duration_ms: 0.264131
  type: 'test'
  ...
# Subtest: concrete SEO uses content H1, canonical, index status, and exactly one matching FAQ node
ok 86 - concrete SEO uses content H1, canonical, index status, and exactly one matching FAQ node
  ---
  duration_ms: 3.115788
  type: 'test'
  ...
# Subtest: concrete waste breakdown uses the same displayed volume unit as base and order quantity
ok 87 - concrete waste breakdown uses the same displayed volume unit as base and order quantity
  ---
  duration_ms: 18.758318
  type: 'test'
  ...
# Subtest: accepts a current analytics-only consent record
ok 88 - accepts a current analytics-only consent record
  ---
  duration_ms: 1.407716
  type: 'test'
  ...
# Subtest: safely rejects expired, overlong, and malformed consent records
ok 89 - safely rejects expired, overlong, and malformed consent records
  ---
  duration_ms: 0.201228
  type: 'test'
  ...
# Subtest: stores only the analytics choice and expiration
ok 90 - stores only the analytics choice and expiration
  ---
  duration_ms: 0.169752
  type: 'test'
  ...
# Subtest: paint coverage converts between ft²/US gal and m²/L
ok 91 - paint coverage converts between ft²/US gal and m²/L
  ---
  duration_ms: 0.922207
  type: 'test'
  ...
# Subtest: paint container volume converts between US gallons and litres
ok 92 - paint container volume converts between US gallons and litres
  ---
  duration_ms: 0.260136
  type: 'test'
  ...
# Subtest: flooring pack coverage converts between square feet and square metres
ok 93 - flooring pack coverage converts between square feet and square metres
  ---
  duration_ms: 0.203802
  type: 'test'
  ...
# Subtest: mass and bulk-volume advanced construction conversions preserve quantity
ok 94 - mass and bulk-volume advanced construction conversions preserve quantity
  ---
  duration_ms: 0.133267
  type: 'test'
  ...
# Subtest: Concrete Calculator: normal imperial inputs
ok 95 - Concrete Calculator: normal imperial inputs
  ---
  duration_ms: 15.289188
  type: 'test'
  ...
# Subtest: Concrete Calculator: decimal inputs
ok 96 - Concrete Calculator: decimal inputs
  ---
  duration_ms: 0.559329
  type: 'test'
  ...
# Subtest: Concrete Calculator: zero required input
ok 97 - Concrete Calculator: zero required input
  ---
  duration_ms: 0.208699
  type: 'test'
  ...
# Subtest: Concrete Calculator: invalid input
ok 98 - Concrete Calculator: invalid input
  ---
  duration_ms: 0.145556
  type: 'test'
  ...
# Subtest: Concrete Calculator: extreme input remains display-safe
ok 99 - Concrete Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.248708
  type: 'test'
  ...
# Subtest: Concrete Calculator: metric conversion inputs
ok 100 - Concrete Calculator: metric conversion inputs
  ---
  duration_ms: 0.510847
  type: 'test'
  ...
# Subtest: Concrete Slab Calculator: normal imperial inputs
ok 101 - Concrete Slab Calculator: normal imperial inputs
  ---
  duration_ms: 0.348727
  type: 'test'
  ...
# Subtest: Concrete Slab Calculator: decimal inputs
ok 102 - Concrete Slab Calculator: decimal inputs
  ---
  duration_ms: 0.361015
  type: 'test'
  ...
# Subtest: Concrete Slab Calculator: zero required input
ok 103 - Concrete Slab Calculator: zero required input
  ---
  duration_ms: 0.304912
  type: 'test'
  ...
# Subtest: Concrete Slab Calculator: invalid input
ok 104 - Concrete Slab Calculator: invalid input
  ---
  duration_ms: 0.361716
  type: 'test'
  ...
# Subtest: Concrete Slab Calculator: extreme input remains display-safe
ok 105 - Concrete Slab Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.179767
  type: 'test'
  ...
# Subtest: Concrete Slab Calculator: metric conversion inputs
ok 106 - Concrete Slab Calculator: metric conversion inputs
  ---
  duration_ms: 0.361746
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: normal imperial inputs
ok 107 - Concrete Bag Calculator: normal imperial inputs
  ---
  duration_ms: 0.34454
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: decimal inputs
ok 108 - Concrete Bag Calculator: decimal inputs
  ---
  duration_ms: 0.338441
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: zero required input
ok 109 - Concrete Bag Calculator: zero required input
  ---
  duration_ms: 0.08072
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: invalid input
ok 110 - Concrete Bag Calculator: invalid input
  ---
  duration_ms: 0.073259
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: extreme input remains display-safe
ok 111 - Concrete Bag Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.147659
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: metric conversion inputs
ok 112 - Concrete Bag Calculator: metric conversion inputs
  ---
  duration_ms: 0.365241
  type: 'test'
  ...
# Subtest: Concrete Footing Calculator: normal imperial inputs
ok 113 - Concrete Footing Calculator: normal imperial inputs
  ---
  duration_ms: 0.35749
  type: 'test'
  ...
# Subtest: Concrete Footing Calculator: decimal inputs
ok 114 - Concrete Footing Calculator: decimal inputs
  ---
  duration_ms: 0.325623
  type: 'test'
  ...
# Subtest: Concrete Footing Calculator: zero required input
ok 115 - Concrete Footing Calculator: zero required input
  ---
  duration_ms: 0.099318
  type: 'test'
  ...
# Subtest: Concrete Footing Calculator: invalid input
ok 116 - Concrete Footing Calculator: invalid input
  ---
  duration_ms: 0.499861
  type: 'test'
  ...
# Subtest: Concrete Footing Calculator: extreme input remains display-safe
ok 117 - Concrete Footing Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.173337
  type: 'test'
  ...
# Subtest: Concrete Footing Calculator: metric conversion inputs
ok 118 - Concrete Footing Calculator: metric conversion inputs
  ---
  duration_ms: 0.342888
  type: 'test'
  ...
# Subtest: Concrete Cost Calculator: normal imperial inputs
ok 119 - Concrete Cost Calculator: normal imperial inputs
  ---
  duration_ms: 0.82339
  type: 'test'
  ...
# Subtest: Concrete Cost Calculator: decimal inputs
ok 120 - Concrete Cost Calculator: decimal inputs
  ---
  duration_ms: 0.387114
  type: 'test'
  ...
# Subtest: Concrete Cost Calculator: zero required input
ok 121 - Concrete Cost Calculator: zero required input
  ---
  duration_ms: 0.06748
  type: 'test'
  ...
# Subtest: Concrete Cost Calculator: invalid input
ok 122 - Concrete Cost Calculator: invalid input
  ---
  duration_ms: 0.057085
  type: 'test'
  ...
# Subtest: Concrete Cost Calculator: extreme input remains display-safe
ok 123 - Concrete Cost Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.150824
  type: 'test'
  ...
# Subtest: Concrete Cost Calculator: metric conversion inputs
ok 124 - Concrete Cost Calculator: metric conversion inputs
  ---
  duration_ms: 0.460132
  type: 'test'
  ...
# Subtest: Cubic Yard Calculator: normal imperial inputs
ok 125 - Cubic Yard Calculator: normal imperial inputs
  ---
  duration_ms: 0.306985
  type: 'test'
  ...
# Subtest: Cubic Yard Calculator: decimal inputs
ok 126 - Cubic Yard Calculator: decimal inputs
  ---
  duration_ms: 2.360017
  type: 'test'
  ...
# Subtest: Cubic Yard Calculator: zero required input
ok 127 - Cubic Yard Calculator: zero required input
  ---
  duration_ms: 0.095591
  type: 'test'
  ...
# Subtest: Cubic Yard Calculator: invalid input
ok 128 - Cubic Yard Calculator: invalid input
  ---
  duration_ms: 0.076704
  type: 'test'
  ...
# Subtest: Cubic Yard Calculator: extreme input remains display-safe
ok 129 - Cubic Yard Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.341957
  type: 'test'
  ...
# Subtest: Cubic Yard Calculator: metric conversion inputs
ok 130 - Cubic Yard Calculator: metric conversion inputs
  ---
  duration_ms: 0.304892
  type: 'test'
  ...
# Subtest: Square Footage Calculator: normal imperial inputs
ok 131 - Square Footage Calculator: normal imperial inputs
  ---
  duration_ms: 0.325333
  type: 'test'
  ...
# Subtest: Square Footage Calculator: decimal inputs
ok 132 - Square Footage Calculator: decimal inputs
  ---
  duration_ms: 0.306274
  type: 'test'
  ...
# Subtest: Square Footage Calculator: zero required input
ok 133 - Square Footage Calculator: zero required input
  ---
  duration_ms: 0.083714
  type: 'test'
  ...
# Subtest: Square Footage Calculator: invalid input
ok 134 - Square Footage Calculator: invalid input
  ---
  duration_ms: 0.062012
  type: 'test'
  ...
# Subtest: Square Footage Calculator: extreme input remains display-safe
ok 135 - Square Footage Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.320275
  type: 'test'
  ...
# Subtest: Square Footage Calculator: metric conversion inputs
ok 136 - Square Footage Calculator: metric conversion inputs
  ---
  duration_ms: 0.315227
  type: 'test'
  ...
# Subtest: Paint Calculator: normal imperial inputs
ok 137 - Paint Calculator: normal imperial inputs
  ---
  duration_ms: 0.412151
  type: 'test'
  ...
# Subtest: Paint Calculator: decimal inputs
ok 138 - Paint Calculator: decimal inputs
  ---
  duration_ms: 0.33756
  type: 'test'
  ...
# Subtest: Paint Calculator: zero required input
ok 139 - Paint Calculator: zero required input
  ---
  duration_ms: 0.067259
  type: 'test'
  ...
# Subtest: Paint Calculator: invalid input
ok 140 - Paint Calculator: invalid input
  ---
  duration_ms: 0.062192
  type: 'test'
  ...
# Subtest: Paint Calculator: extreme input remains display-safe
ok 141 - Paint Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.381645
  type: 'test'
  ...
# Subtest: Paint Calculator: metric conversion inputs
ok 142 - Paint Calculator: metric conversion inputs
  ---
  duration_ms: 0.340925
  type: 'test'
  ...
# Subtest: Tile Calculator: normal imperial inputs
ok 143 - Tile Calculator: normal imperial inputs
  ---
  duration_ms: 0.321817
  type: 'test'
  ...
# Subtest: Tile Calculator: decimal inputs
ok 144 - Tile Calculator: decimal inputs
  ---
  duration_ms: 0.378862
  type: 'test'
  ...
# Subtest: Tile Calculator: zero required input
ok 145 - Tile Calculator: zero required input
  ---
  duration_ms: 0.08078
  type: 'test'
  ...
# Subtest: Tile Calculator: invalid input
ok 146 - Tile Calculator: invalid input
  ---
  duration_ms: 0.140979
  type: 'test'
  ...
# Subtest: Tile Calculator: extreme input remains display-safe
ok 147 - Tile Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.351901
  type: 'test'
  ...
# Subtest: Tile Calculator: metric conversion inputs
ok 148 - Tile Calculator: metric conversion inputs
  ---
  duration_ms: 0.370199
  type: 'test'
  ...
# Subtest: Flooring Calculator: normal imperial inputs
ok 149 - Flooring Calculator: normal imperial inputs
  ---
  duration_ms: 0.388486
  type: 'test'
  ...
# Subtest: Flooring Calculator: decimal inputs
ok 150 - Flooring Calculator: decimal inputs
  ---
  duration_ms: 0.437808
  type: 'test'
  ...
# Subtest: Flooring Calculator: zero required input
ok 151 - Flooring Calculator: zero required input
  ---
  duration_ms: 0.093318
  type: 'test'
  ...
# Subtest: Flooring Calculator: invalid input
ok 152 - Flooring Calculator: invalid input
  ---
  duration_ms: 0.084365
  type: 'test'
  ...
# Subtest: Flooring Calculator: extreme input remains display-safe
ok 153 - Flooring Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.378821
  type: 'test'
  ...
# Subtest: Flooring Calculator: metric conversion inputs
ok 154 - Flooring Calculator: metric conversion inputs
  ---
  duration_ms: 0.413142
  type: 'test'
  ...
# Subtest: Gravel Calculator: normal imperial inputs
ok 155 - Gravel Calculator: normal imperial inputs
  ---
  duration_ms: 0.381976
  type: 'test'
  ...
# Subtest: Gravel Calculator: decimal inputs
ok 156 - Gravel Calculator: decimal inputs
  ---
  duration_ms: 0.382156
  type: 'test'
  ...
# Subtest: Gravel Calculator: zero required input
ok 157 - Gravel Calculator: zero required input
  ---
  duration_ms: 0.096904
  type: 'test'
  ...
# Subtest: Gravel Calculator: invalid input
ok 158 - Gravel Calculator: invalid input
  ---
  duration_ms: 0.088781
  type: 'test'
  ...
# Subtest: Gravel Calculator: extreme input remains display-safe
ok 159 - Gravel Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.692136
  type: 'test'
  ...
# Subtest: Gravel Calculator: metric conversion inputs
ok 160 - Gravel Calculator: metric conversion inputs
  ---
  duration_ms: 2.893759
  type: 'test'
  ...
# Subtest: Mulch Calculator: normal imperial inputs
ok 161 - Mulch Calculator: normal imperial inputs
  ---
  duration_ms: 0.396067
  type: 'test'
  ...
# Subtest: Mulch Calculator: decimal inputs
ok 162 - Mulch Calculator: decimal inputs
  ---
  duration_ms: 0.326574
  type: 'test'
  ...
# Subtest: Mulch Calculator: zero required input
ok 163 - Mulch Calculator: zero required input
  ---
  duration_ms: 0.079238
  type: 'test'
  ...
# Subtest: Mulch Calculator: invalid input
ok 164 - Mulch Calculator: invalid input
  ---
  duration_ms: 0.06743
  type: 'test'
  ...
# Subtest: Mulch Calculator: extreme input remains display-safe
ok 165 - Mulch Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.342367
  type: 'test'
  ...
# Subtest: Mulch Calculator: metric conversion inputs
ok 166 - Mulch Calculator: metric conversion inputs
  ---
  duration_ms: 0.321156
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: normal imperial inputs
ok 167 - Roof Pitch Calculator: normal imperial inputs
  ---
  duration_ms: 0.356839
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: decimal inputs
ok 168 - Roof Pitch Calculator: decimal inputs
  ---
  duration_ms: 0.342097
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: zero required input
ok 169 - Roof Pitch Calculator: zero required input
  ---
  duration_ms: 0.075572
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: invalid input
ok 170 - Roof Pitch Calculator: invalid input
  ---
  duration_ms: 0.061682
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: extreme input remains display-safe
ok 171 - Roof Pitch Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.29704
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: metric conversion inputs
ok 172 - Roof Pitch Calculator: metric conversion inputs
  ---
  duration_ms: 0.320495
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: normal imperial inputs
ok 173 - Roofing Material Calculator: normal imperial inputs
  ---
  duration_ms: 0.390439
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: decimal inputs
ok 174 - Roofing Material Calculator: decimal inputs
  ---
  duration_ms: 0.310089
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: zero required input
ok 175 - Roofing Material Calculator: zero required input
  ---
  duration_ms: 0.058647
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: invalid input
ok 176 - Roofing Material Calculator: invalid input
  ---
  duration_ms: 0.048572
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: extreme input remains display-safe
ok 177 - Roofing Material Calculator: extreme input remains display-safe
  ---
  duration_ms: 2.089957
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: metric conversion inputs
ok 178 - Roofing Material Calculator: metric conversion inputs
  ---
  duration_ms: 0.300946
  type: 'test'
  ...
# Subtest: Stair Calculator: normal imperial inputs
ok 179 - Stair Calculator: normal imperial inputs
  ---
  duration_ms: 0.387414
  type: 'test'
  ...
# Subtest: Stair Calculator: decimal inputs
ok 180 - Stair Calculator: decimal inputs
  ---
  duration_ms: 0.355717
  type: 'test'
  ...
# Subtest: Stair Calculator: zero required input
ok 181 - Stair Calculator: zero required input
  ---
  duration_ms: 0.05432
  type: 'test'
  ...
# Subtest: Stair Calculator: invalid input
ok 182 - Stair Calculator: invalid input
  ---
  duration_ms: 0.042083
  type: 'test'
  ...
# Subtest: Stair Calculator: extreme input remains display-safe
ok 183 - Stair Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.301477
  type: 'test'
  ...
# Subtest: Stair Calculator: metric conversion inputs
ok 184 - Stair Calculator: metric conversion inputs
  ---
  duration_ms: 0.334486
  type: 'test'
  ...
# Subtest: Board Foot Calculator: normal imperial inputs
ok 185 - Board Foot Calculator: normal imperial inputs
  ---
  duration_ms: 0.297401
  type: 'test'
  ...
# Subtest: Board Foot Calculator: decimal inputs
ok 186 - Board Foot Calculator: decimal inputs
  ---
  duration_ms: 0.282739
  type: 'test'
  ...
# Subtest: Board Foot Calculator: zero required input
ok 187 - Board Foot Calculator: zero required input
  ---
  duration_ms: 0.067019
  type: 'test'
  ...
# Subtest: Board Foot Calculator: invalid input
ok 188 - Board Foot Calculator: invalid input
  ---
  duration_ms: 0.100098
  type: 'test'
  ...
# Subtest: Board Foot Calculator: extreme input remains display-safe
ok 189 - Board Foot Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.307646
  type: 'test'
  ...
# Subtest: Board Foot Calculator: metric conversion inputs
ok 190 - Board Foot Calculator: metric conversion inputs
  ---
  duration_ms: 0.291722
  type: 'test'
  ...
# Subtest: Deck Material Calculator: normal imperial inputs
ok 191 - Deck Material Calculator: normal imperial inputs
  ---
  duration_ms: 0.284141
  type: 'test'
  ...
# Subtest: Deck Material Calculator: decimal inputs
ok 192 - Deck Material Calculator: decimal inputs
  ---
  duration_ms: 0.459621
  type: 'test'
  ...
# Subtest: Deck Material Calculator: zero required input
ok 193 - Deck Material Calculator: zero required input
  ---
  duration_ms: 0.056895
  type: 'test'
  ...
# Subtest: Deck Material Calculator: invalid input
ok 194 - Deck Material Calculator: invalid input
  ---
  duration_ms: 0.041451
  type: 'test'
  ...
# Subtest: Deck Material Calculator: extreme input remains display-safe
ok 195 - Deck Material Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.268067
  type: 'test'
  ...
# Subtest: Deck Material Calculator: metric conversion inputs
ok 196 - Deck Material Calculator: metric conversion inputs
  ---
  duration_ms: 0.28304
  type: 'test'
  ...
# Subtest: Fence Material Calculator: normal imperial inputs
ok 197 - Fence Material Calculator: normal imperial inputs
  ---
  duration_ms: 0.366063
  type: 'test'
  ...
# Subtest: Fence Material Calculator: decimal inputs
ok 198 - Fence Material Calculator: decimal inputs
  ---
  duration_ms: 0.340475
  type: 'test'
  ...
# Subtest: Fence Material Calculator: zero required input
ok 199 - Fence Material Calculator: zero required input
  ---
  duration_ms: 0.090494
  type: 'test'
  ...
# Subtest: Fence Material Calculator: invalid input
ok 200 - Fence Material Calculator: invalid input
  ---
  duration_ms: 0.06716
  type: 'test'
  ...
# Subtest: Fence Material Calculator: extreme input remains display-safe
ok 201 - Fence Material Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.373524
  type: 'test'
  ...
# Subtest: Fence Material Calculator: metric conversion inputs
ok 202 - Fence Material Calculator: metric conversion inputs
  ---
  duration_ms: 0.346554
  type: 'test'
  ...
# Subtest: Drywall Calculator: normal imperial inputs
ok 203 - Drywall Calculator: normal imperial inputs
  ---
  duration_ms: 0.389958
  type: 'test'
  ...
# Subtest: Drywall Calculator: decimal inputs
ok 204 - Drywall Calculator: decimal inputs
  ---
  duration_ms: 0.349659
  type: 'test'
  ...
# Subtest: Drywall Calculator: zero required input
ok 205 - Drywall Calculator: zero required input
  ---
  duration_ms: 0.070144
  type: 'test'
  ...
# Subtest: Drywall Calculator: invalid input
ok 206 - Drywall Calculator: invalid input
  ---
  duration_ms: 0.059609
  type: 'test'
  ...
# Subtest: Drywall Calculator: extreme input remains display-safe
ok 207 - Drywall Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.347415
  type: 'test'
  ...
# Subtest: Drywall Calculator: metric conversion inputs
ok 208 - Drywall Calculator: metric conversion inputs
  ---
  duration_ms: 0.314946
  type: 'test'
  ...
# Subtest: Brick Calculator: normal imperial inputs
ok 209 - Brick Calculator: normal imperial inputs
  ---
  duration_ms: 0.302589
  type: 'test'
  ...
# Subtest: Brick Calculator: decimal inputs
ok 210 - Brick Calculator: decimal inputs
  ---
  duration_ms: 0.351761
  type: 'test'
  ...
# Subtest: Brick Calculator: zero required input
ok 211 - Brick Calculator: zero required input
  ---
  duration_ms: 0.122291
  type: 'test'
  ...
# Subtest: Brick Calculator: invalid input
ok 212 - Brick Calculator: invalid input
  ---
  duration_ms: 0.065136
  type: 'test'
  ...
# Subtest: Brick Calculator: extreme input remains display-safe
ok 213 - Brick Calculator: extreme input remains display-safe
  ---
  duration_ms: 0.339553
  type: 'test'
  ...
# Subtest: Brick Calculator: metric conversion inputs
ok 214 - Brick Calculator: metric conversion inputs
  ---
  duration_ms: 0.346674
  type: 'test'
  ...
# Subtest: Concrete Calculator: known 10 ft × 10 ft × 4 in calculation
ok 215 - Concrete Calculator: known 10 ft × 10 ft × 4 in calculation
  ---
  duration_ms: 0.373794
  type: 'test'
  ...
# Subtest: Roof Pitch Calculator: 6:12 pitch
ok 216 - Roof Pitch Calculator: 6:12 pitch
  ---
  duration_ms: 0.644505
  type: 'test'
  ...
# Subtest: Board Foot Calculator: twelve 2 × 8 × 8 boards
ok 217 - Board Foot Calculator: twelve 2 × 8 × 8 boards
  ---
  duration_ms: 0.340725
  type: 'test'
  ...
# Subtest: Concrete Bag Calculator: worked example requires twelve bags
ok 218 - Concrete Bag Calculator: worked example requires twelve bags
  ---
  duration_ms: 0.460302
  type: 'test'
  ...
# Subtest: Roofing Material Calculator: worked example yields 13.77 squares
ok 219 - Roofing Material Calculator: worked example yields 13.77 squares
  ---
  duration_ms: 0.386403
  type: 'test'
  ...
# Subtest: Drywall Calculator: worked example requires twenty sheets
ok 220 - Drywall Calculator: worked example requires twenty sheets
  ---
  duration_ms: 3.508429
  type: 'test'
  ...
# Subtest: Brick Calculator: worked example requires 1,124 bricks
ok 221 - Brick Calculator: worked example requires 1,124 bricks
  ---
  duration_ms: 0.436557
  type: 'test'
  ...
# Subtest: construction unit conversions preserve linked dimensions and have negligible toggle drift
ok 222 - construction unit conversions preserve linked dimensions and have negligible toggle drift
  ---
  duration_ms: 1.028584
  type: 'test'
  ...
# Subtest: construction converts area, cubic, paint liquid, and gravel mass/rates both ways
ok 223 - construction converts area, cubic, paint liquid, and gravel mass/rates both ways
  ---
  duration_ms: 0.196171
  type: 'test'
  ...
# Subtest: audited construction conversions use practical editable precision
ok 224 - audited construction conversions use practical editable precision
  ---
  duration_ms: 3.640845
  type: 'test'
  ...
# Subtest: converter cluster content is complete, distinct, and uses valid defaults
ok 225 - converter cluster content is complete, distinct, and uses valid defaults
  ---
  duration_ms: 1.346315
  type: 'test'
  ...
# Subtest: unit hub covers every dedicated category and dedicated pages link back across the cluster
ok 226 - unit hub covers every dedicated category and dedicated pages link back across the cluster
  ---
  duration_ms: 0.738214
  type: 'test'
  ...
# Subtest: worked examples match the converter output users see
ok 227 - worked examples match the converter output users see
  ---
  duration_ms: 0.306835
  type: 'test'
  ...
# Subtest: temperature starts at room temperature and converts cleanly across systems
ok 228 - temperature starts at room temperature and converts cleanly across systems
  ---
  duration_ms: 0.367445
  type: 'test'
  ...
# Subtest: small valid conversions are not rounded to zero
ok 229 - small valid conversions are not rounded to zero
  ---
  duration_ms: 16.968186
  type: 'test'
  ...
# Subtest: extremely small and large conversions remain meaningful
ok 230 - extremely small and large conversions remain meaningful
  ---
  duration_ms: 0.402357
  type: 'test'
  ...
# Subtest: normal converter results stay readable
ok 231 - normal converter results stay readable
  ---
  duration_ms: 0.273265
  type: 'test'
  ...
# Subtest: core calculator blank input regression
ok 232 - core calculator blank input regression
  ---
  duration_ms: 1.056355
  type: 'test'
  ...
# Subtest: loan handles amortization, totals, and zero interest
ok 233 - loan handles amortization, totals, and zero interest
  ---
  duration_ms: 1.895349
  type: 'test'
  ...
# Subtest: mortgage includes taxes and insurance while retaining loan totals
ok 234 - mortgage includes taxes and insurance while retaining loan totals
  ---
  duration_ms: 0.327085
  type: 'test'
  ...
# Subtest: finance calculations remain stable at extremely small nonzero rates
ok 235 - finance calculations remain stable at extremely small nonzero rates
  ---
  duration_ms: 0.588121
  type: 'test'
  ...
# Subtest: finance calculations reject unreasonable and overflow-scale inputs clearly
ok 236 - finance calculations reject unreasonable and overflow-scale inputs clearly
  ---
  duration_ms: 0.366924
  type: 'test'
  ...
# Subtest: finance calculations never display non-finite or negative interest results
ok 237 - finance calculations never display non-finite or negative interest results
  ---
  duration_ms: 0.605568
  type: 'test'
  ...
# Subtest: savings and compound interest support zero rates
ok 238 - savings and compound interest support zero rates
  ---
  duration_ms: 0.342808
  type: 'test'
  ...
# Subtest: VAT add and remove are inverse operations
ok 239 - VAT add and remove are inverse operations
  ---
  duration_ms: 0.363268
  type: 'test'
  ...
# Subtest: business calculators return accurate headline and decision details
ok 240 - business calculators return accurate headline and decision details
  ---
  duration_ms: 0.662602
  type: 'test'
  ...
# Subtest: business calculators handle meaningful zero, loss, and rounding cases
ok 241 - business calculators handle meaningful zero, loss, and rounding cases
  ---
  duration_ms: 1.343612
  type: 'test'
  ...
# Subtest: business calculators reject incomplete, undefined, invalid, and unsafe inputs
ok 242 - business calculators reject incomplete, undefined, invalid, and unsafe inputs
  ---
  duration_ms: 0.57364
  type: 'test'
  ...
# Subtest: age, working days, and invalid values are handled explicitly
ok 243 - age, working days, and invalid values are handled explicitly
  ---
  duration_ms: 0.327265
  type: 'test'
  ...
# Subtest: converters work in both directions and protect reciprocal inputs
ok 244 - converters work in both directions and protect reciprocal inputs
  ---
  duration_ms: 0.188088
  type: 'test'
  ...
# Subtest: automotive calculators return accurate decision details and meaningful zero states
ok 245 - automotive calculators return accurate decision details and meaningful zero states
  ---
  duration_ms: 0.480191
  type: 'test'
  ...
# Subtest: automotive calculators reject incomplete, undefined, and unsafe outputs
ok 246 - automotive calculators reject incomplete, undefined, and unsafe outputs
  ---
  duration_ms: 0.218634
  type: 'test'
  ...
# Subtest: core converter cluster uses accurate linear factors in both directions
ok 247 - core converter cluster uses accurate linear factors in both directions
  ---
  duration_ms: 3.614036
  type: 'test'
  ...
# Subtest: temperature formulas handle landmarks and reject values below absolute zero
ok 248 - temperature formulas handle landmarks and reject values below absolute zero
  ---
  duration_ms: 0.235149
  type: 'test'
  ...
# Subtest: converter cluster rejects invalid selections and non-finite or overflowing values
ok 249 - converter cluster rejects invalid selections and non-finite or overflowing values
  ---
  duration_ms: 0.115711
  type: 'test'
  ...
# Subtest: forward and reverse dates have equal magnitudes and explicit order
ok 250 - forward and reverse dates have equal magnitudes and explicit order
  ---
  duration_ms: 2.393016
  type: 'test'
  ...
# Subtest: same date supports exclusive and inclusive counting
ok 251 - same date supports exclusive and inclusive counting
  ---
  duration_ms: 0.521813
  type: 'test'
  ...
# Subtest: inclusive counting adds exactly one calendar day
ok 252 - inclusive counting adds exactly one calendar day
  ---
  duration_ms: 0.322718
  type: 'test'
  ...
# Subtest: leap years and February 29 anniversaries use clamped arithmetic
ok 253 - leap years and February 29 anniversaries use clamped arithmetic
  ---
  duration_ms: 0.361666
  type: 'test'
  ...
# Subtest: month ends clamp before remaining days are counted
ok 254 - month ends clamp before remaining days are counted
  ---
  duration_ms: 0.456226
  type: 'test'
  ...
# Subtest: whole-month view is independently consistent when year-first leap-day clamping differs
ok 255 - whole-month view is independently consistent when year-first leap-day clamping differs
  ---
  duration_ms: 0.211804
  type: 'test'
  ...
# Subtest: inclusive counting carries consistently across month and year boundaries
ok 256 - inclusive counting carries consistently across month and year boundaries
  ---
  duration_ms: 0.272454
  type: 'test'
  ...
# Subtest: reverse month-end dates preserve every forward breakdown and counting convention
ok 257 - reverse month-end dates preserve every forward breakdown and counting convention
  ---
  duration_ms: 0.318962
  type: 'test'
  ...
# Subtest: year boundaries and DST-adjacent calendar dates retain exact day totals
ok 258 - year boundaries and DST-adjacent calendar dates retain exact day totals
  ---
  duration_ms: 0.448164
  type: 'test'
  ...
# Subtest: invalid formats and impossible dates return errors without numeric leakage
ok 259 - invalid formats and impossible dates return errors without numeric leakage
  ---
  duration_ms: 0.603154
  type: 'test'
  ...
# Subtest: the conventional four-digit calendar year range is supported
ok 260 - the conventional four-digit calendar year range is supported
  ---
  duration_ms: 0.247036
  type: 'test'
  ...
# Subtest: date calculator adds calendar units with Gregorian month-end and leap-day clamping
ok 261 - date calculator adds calendar units with Gregorian month-end and leap-day clamping
  ---
  duration_ms: 0.408605
  type: 'test'
  ...
# Subtest: date calculator subtracts exactly across boundaries and rejects invalid or out-of-range requests
ok 262 - date calculator subtracts exactly across boundaries and rejects invalid or out-of-range requests
  ---
  duration_ms: 1.676425
  type: 'test'
  ...
# Subtest: date calculator rejects safe-integer offsets that overflow the JavaScript Date range
ok 263 - date calculator rejects safe-integer offsets that overflow the JavaScript Date range
  ---
  duration_ms: 0.197273
  type: 'test'
  ...
# Subtest: shared content is substantial and links only the relevant date tools
ok 264 - shared content is substantial and links only the relevant date tools
  ---
  duration_ms: 0.180617
  type: 'test'
  ...
# Subtest: loan scenarios include fees, balloon, and faster payoff from extra payments
ok 265 - loan scenarios include fees, balloon, and faster payoff from extra payments
  ---
  duration_ms: 1.347617
  type: 'test'
  ...
# Subtest: mortgage decision adds ownership costs and reports interest savings
ok 266 - mortgage decision adds ownership costs and reports interest savings
  ---
  duration_ms: 0.315057
  type: 'test'
  ...
# Subtest: retirement decision separates contributions, growth, and inflation-adjusted value
ok 267 - retirement decision separates contributions, growth, and inflation-adjusted value
  ---
  duration_ms: 0.426011
  type: 'test'
  ...
# Subtest: budget decision totals categories and builds an emergency target
ok 268 - budget decision totals categories and builds an emergency target
  ---
  duration_ms: 0.73548
  type: 'test'
  ...
# Subtest: credit card extra payments reduce payoff time and interest
ok 269 - credit card extra payments reduce payoff time and interest
  ---
  duration_ms: 0.346113
  type: 'test'
  ...
# Subtest: auto loan advanced scenario includes rebate, balloon and ownership costs
ok 270 - auto loan advanced scenario includes rebate, balloon and ownership costs
  ---
  duration_ms: 0.26966
  type: 'test'
  ...
# Subtest: mortgage payoff scenario applies a lump sum and delayed extra payments
ok 271 - mortgage payoff scenario applies a lump sum and delayed extra payments
  ---
  duration_ms: 0.334646
  type: 'test'
  ...
# Subtest: mortgage payoff advanced mode validates start month and lump-sum boundaries
ok 272 - mortgage payoff advanced mode validates start month and lump-sum boundaries
  ---
  duration_ms: 0.234728
  type: 'test'
  ...
# Subtest: compound growth accounts for fees, inflation and increasing contributions
ok 273 - compound growth accounts for fees, inflation and increasing contributions
  ---
  duration_ms: 0.491188
  type: 'test'
  ...
# Subtest: savings target reports the target gap and required monthly deposit
ok 274 - savings target reports the target gap and required monthly deposit
  ---
  duration_ms: 0.542985
  type: 'test'
  ...
# Subtest: savings advanced scenario rejects values outside hardened finance limits
ok 275 - savings advanced scenario rejects values outside hardened finance limits
  ---
  duration_ms: 1.746398
  type: 'test'
  ...
# Subtest: APR advanced scenario includes upfront and final charges
ok 276 - APR advanced scenario includes upfront and final charges
  ---
  duration_ms: 0.268207
  type: 'test'
  ...
# Subtest: FT-07 DOCX picker rule requires .docx plus ZIP signature
ok 277 - FT-07 DOCX picker rule requires .docx plus ZIP signature
  ---
  duration_ms: 1.631027
  type: 'test'
  ...
# Subtest: FT-07 accepts a bounded ordinary DOCX ZIP package
ok 278 - FT-07 accepts a bounded ordinary DOCX ZIP package
  ---
  duration_ms: 1.418021
  type: 'test'
  ...
# Subtest: FT-07 rejects generic ZIPs that are not DOCX packages
ok 279 - FT-07 rejects generic ZIPs that are not DOCX packages
  ---
  duration_ms: 0.582683
  type: 'test'
  ...
# Subtest: FT-07 rejects path traversal, encryption and unsupported compression
ok 280 - FT-07 rejects path traversal, encryption and unsupported compression
  ---
  duration_ms: 1.188661
  type: 'test'
  ...
# Subtest: FT-07 rejects macro, ActiveX, embedded-object and custom UI payloads
ok 281 - FT-07 rejects macro, ActiveX, embedded-object and custom UI payloads
  ---
  duration_ms: 1.00524
  type: 'test'
  ...
# Subtest: FT-07 rejects suspicious compression ratios and oversized entries
ok 282 - FT-07 rejects suspicious compression ratios and oversized entries
  ---
  duration_ms: 1.645609
  type: 'test'
  ...
# Subtest: FT-07 rejects duplicate case-insensitive package entry names
ok 283 - FT-07 rejects duplicate case-insensitive package entry names
  ---
  duration_ms: 0.409718
  type: 'test'
  ...
# Subtest: FT-07 rejects ZIP Unicode-path aliases before a downstream ZIP reader can rename entries
ok 284 - FT-07 rejects ZIP Unicode-path aliases before a downstream ZIP reader can rename entries
  ---
  duration_ms: 1.295109
  type: 'test'
  ...
# Subtest: FT-07 inspects DEFLATE metadata locally and allows ordinary external hyperlinks without fetching them
ok 285 - FT-07 inspects DEFLATE metadata locally and allows ordinary external hyperlinks without fetching them
  ---
  duration_ms: 46.411168
  type: 'test'
  ...
# Subtest: FT-07 rejects forged declared sizes using actual DEFLATE output for document and media entries
ok 286 - FT-07 rejects forged declared sizes using actual DEFLATE output for document and media entries
  ---
  duration_ms: 24.381892
  type: 'test'
  ...
# Subtest: FT-07 rejects hidden stored payload bytes outside declared local and central sizes
ok 287 - FT-07 rejects hidden stored payload bytes outside declared local and central sizes
  ---
  duration_ms: 0.876278
  type: 'test'
  ...
# Subtest: FT-07 rejects renamed macro-enabled packages by content type
ok 288 - FT-07 rejects renamed macro-enabled packages by content type
  ---
  duration_ms: 3.056039
  type: 'test'
  ...
# Subtest: FT-07 rejects non-hyperlink external document resources
ok 289 - FT-07 rejects non-hyperlink external document resources
  ---
  duration_ms: 0.856379
  type: 'test'
  ...
# Subtest: FT-07 rejects javascript external hyperlinks before any HTML renderer sees them
ok 290 - FT-07 rejects javascript external hyperlinks before any HTML renderer sees them
  ---
  duration_ms: 3.423093
  type: 'test'
  ...
# Subtest: FT-07 rejects ambiguous UTF-16 metadata XML before conversion
ok 291 - FT-07 rejects ambiguous UTF-16 metadata XML before conversion
  ---
  duration_ms: 0.447062
  type: 'test'
  ...
# Subtest: allows only embedded raster image data URLs for generated DOCX preview resources
ok 292 - allows only embedded raster image data URLs for generated DOCX preview resources
  ---
  duration_ms: 1.338233
  type: 'test'
  ...
# Subtest: allows only explicitly approved preview hyperlink protocols
ok 293 - allows only explicitly approved preview hyperlink protocols
  ---
  duration_ms: 0.295638
  type: 'test'
  ...
# Subtest: calculates stable PDF page offsets without dropping a trailing partial page
ok 294 - calculates stable PDF page offsets without dropping a trailing partial page
  ---
  duration_ms: 1.083956
  type: 'test'
  ...
# Subtest: rejects invalid PDF pagination dimensions before export
ok 295 - rejects invalid PDF pagination dimensions before export
  ---
  duration_ms: 0.465089
  type: 'test'
  ...
# Subtest: publication fixtures 1–6 and 8 produce the required semantic HTML with external access disabled
ok 296 - publication fixtures 1–6 and 8 produce the required semantic HTML with external access disabled
  ---
  duration_ms: 151.226837
  type: 'test'
  ...
# Subtest: Electricity exposes a whole-number HTML step for day count
ok 297 - Electricity exposes a whole-number HTML step for day count
  ---
  duration_ms: 0.94529
  type: 'test'
  ...
# Subtest: Electricity still accepts its standard 30-day scenario
ok 298 - Electricity still accepts its standard 30-day scenario
  ---
  duration_ms: 16.732537
  type: 'test'
  ...
# Subtest: Electricity rejects fractional day counts rather than silently rounding them
ok 299 - Electricity rejects fractional day counts rather than silently rounding them
  ---
  duration_ms: 0.261037
  type: 'test'
  ...
# Subtest: Phase Three A keeps normal decimal stepping for other numeric fields
ok 300 - Phase Three A keeps normal decimal stepping for other numeric fields
  ---
  duration_ms: 0.132296
  type: 'test'
  ...
# Subtest: EV Charging Time does not round a positive duration down to zero
ok 301 - EV Charging Time does not round a positive duration down to zero
  ---
  duration_ms: 1.545861
  type: 'test'
  ...
# Subtest: EV Charging Time preserves an actual zero-energy duration as zero
ok 302 - EV Charging Time preserves an actual zero-energy duration as zero
  ---
  duration_ms: 0.260036
  type: 'test'
  ...
# Subtest: EV Charging Time keeps ordinary duration formatting unchanged
ok 303 - EV Charging Time keeps ordinary duration formatting unchanged
  ---
  duration_ms: 0.204923
  type: 'test'
  ...
# Subtest: lightweight catalogue metadata exactly matches every full expansion definition
ok 304 - lightweight catalogue metadata exactly matches every full expansion definition
  ---
  duration_ms: 2.232678
  type: 'test'
  ...
# Subtest: lightweight route manifests match definitions and preserve Phase Three C precedence
ok 305 - lightweight route manifests match definitions and preserve Phase Three C precedence
  ---
  duration_ms: 0.47947
  type: 'test'
  ...
# Subtest: homepage entry modules do not value-import full expansion definitions
ok 306 - homepage entry modules do not value-import full expansion definitions
  ---
  duration_ms: 0.770953
  type: 'test'
  ...
# Subtest: FT-01 file-job state machine permits only deterministic lifecycle transitions
ok 307 - FT-01 file-job state machine permits only deterministic lifecycle transitions
  ---
  duration_ms: 1.492462
  type: 'test'
  ...
# Subtest: FT-01 central resource caps enforce published starting safety limits
ok 308 - FT-01 central resource caps enforce published starting safety limits
  ---
  duration_ms: 0.243271
  type: 'test'
  ...
# Subtest: FT-01 validates extension, MIME, magic bytes, empty files and device limits locally
ok 309 - FT-01 validates extension, MIME, magic bytes, empty files and device limits locally
  ---
  duration_ms: 4.099685
  type: 'test'
  ...
# Subtest: FT-01 loads bytes in memory, supports cancellation and allows explicit buffer cleanup
ok 310 - FT-01 loads bytes in memory, supports cancellation and allows explicit buffer cleanup
  ---
  duration_ms: 0.537977
  type: 'test'
  ...
# Subtest: FT-01 object URL registry revokes every tracked URL exactly once
ok 311 - FT-01 object URL registry revokes every tracked URL exactly once
  ---
  duration_ms: 0.261648
  type: 'test'
  ...
# Subtest: FT-01 worker session transfers bytes, obeys AbortSignal, times out and terminates idempotently
ok 312 - FT-01 worker session transfers bytes, obeys AbortSignal, times out and terminates idempotently
  ---
  duration_ms: 15.962505
  type: 'test'
  ...
# Subtest: FT-01 production foundation has no network, persistence or logging surface
ok 313 - FT-01 production foundation has no network, persistence or logging surface
  ---
  duration_ms: 0.479691
  type: 'test'
  ...
# Subtest: FT-01 shared picker keeps native file input, keyboard buttons, live status, cancel/reset and no public route wiring
ok 314 - FT-01 shared picker keeps native file input, keyboard buttons, live status, cancel/reset and no public route wiring
  ---
  duration_ms: 0.300365
  type: 'test'
  ...
# Subtest: finance calculator content is substantial, distinct, and tool-specific
ok 315 - finance calculator content is substantial, distinct, and tool-specific
  ---
  duration_ms: 1.62602
  type: 'test'
  ...
# Subtest: worked finance examples stay aligned with calculator outputs
ok 316 - worked finance examples stay aligned with calculator outputs
  ---
  duration_ms: 2.015457
  type: 'test'
  ...
# Subtest: finance edge cases fail clearly or produce finite results
ok 317 - finance edge cases fail clearly or produce finite results
  ---
  duration_ms: 0.689803
  type: 'test'
  ...
# Subtest: Fuel Cost keeps cost per mile unchanged for imperial distance
ok 318 - Fuel Cost keeps cost per mile unchanged for imperial distance
  ---
  duration_ms: 0.772284
  type: 'test'
  ...
# Subtest: Fuel Cost converts cost per mile to the lower cost per kilometre
ok 319 - Fuel Cost converts cost per mile to the lower cost per kilometre
  ---
  duration_ms: 0.184083
  type: 'test'
  ...
# Subtest: Heat Index preserves the normal NOAA Rothfusz example
ok 320 - Heat Index preserves the normal NOAA Rothfusz example
  ---
  duration_ms: 17.556848
  type: 'test'
  ...
# Subtest: Heat Index accepts hot dry air and reaches the NOAA low-humidity adjustment
ok 321 - Heat Index accepts hot dry air and reaches the NOAA low-humidity adjustment
  ---
  duration_ms: 0.36452
  type: 'test'
  ...
# Subtest: Heat Index uses the NOAA simple approximation when the initial heat index is below 80 F
ok 322 - Heat Index uses the NOAA simple approximation when the initial heat index is below 80 F
  ---
  duration_ms: 0.321887
  type: 'test'
  ...
# Subtest: Heat Index keeps humidity bounds and warm-temperature applicability explicit
ok 323 - Heat Index keeps humidity bounds and warm-temperature applicability explicit
  ---
  duration_ms: 0.250871
  type: 'test'
  ...
# Subtest: Home & Construction exposes the published Electrical calculators as a related field
ok 324 - Home & Construction exposes the published Electrical calculators as a related field
  ---
  duration_ms: 1.600112
  type: 'test'
  ...
# Subtest: Home Equity Loan rejects a zero-length repayment term
ok 325 - Home Equity Loan rejects a zero-length repayment term
  ---
  duration_ms: 1.145798
  type: 'test'
  ...
# Subtest: Home Equity Loan rejects terms that do not resolve to whole monthly payments
ok 326 - Home Equity Loan rejects terms that do not resolve to whole monthly payments
  ---
  duration_ms: 0.250561
  type: 'test'
  ...
# Subtest: Home Equity Loan keeps valid whole-month terms
ok 327 - Home Equity Loan keeps valid whole-month terms
  ---
  duration_ms: 15.733236
  type: 'test'
  ...
# Subtest: FT-05 image rules require PNG/JPEG signatures rather than filename alone
ok 328 - FT-05 image rules require PNG/JPEG signatures rather than filename alone
  ---
  duration_ms: 1.32274
  type: 'test'
  ...
# Subtest: FT-05 fit-image pages preserve image aspect and cap extreme PDF page dimensions
ok 329 - FT-05 fit-image pages preserve image aspect and cap extreme PDF page dimensions
  ---
  duration_ms: 0.237412
  type: 'test'
  ...
# Subtest: FT-05 A4 auto chooses orientation and contains image inside the page
ok 330 - FT-05 A4 auto chooses orientation and contains image inside the page
  ---
  duration_ms: 0.155751
  type: 'test'
  ...
# Subtest: FT-05 validates decoded pixel and format resource guards
ok 331 - FT-05 validates decoded pixel and format resource guards
  ---
  duration_ms: 0.446231
  type: 'test'
  ...
# Subtest: FT-05 exports images in exact input order to a reopenable PDF
ok 332 - FT-05 exports images in exact input order to a reopenable PDF
  ---
  duration_ms: 20.430247
  type: 'test'
  ...
# Subtest: FT-05 cancellation stops PDF creation without returning partial output
ok 333 - FT-05 cancellation stops PDF creation without returning partial output
  ---
  duration_ms: 1.375839
  type: 'test'
  ...
# Subtest: FT-05 conversion core has no network, persistence or runtime CDN calls
ok 334 - FT-05 conversion core has no network, persistence or runtime CDN calls
  ---
  duration_ms: 0.320104
  type: 'test'
  ...
# Subtest: Interest Rate preserves a small positive solved rate instead of displaying 0%
ok 335 - Interest Rate preserves a small positive solved rate instead of displaying 0%
  ---
  duration_ms: 2.002727
  type: 'test'
  ...
# Subtest: Interest Rate still displays an exact zero-rate case as 0%
ok 336 - Interest Rate still displays an exact zero-rate case as 0%
  ---
  duration_ms: 1.701601
  type: 'test'
  ...
# Subtest: Loan required fields reject blanks instead of coercing them to zero
ok 337 - Loan required fields reject blanks instead of coercing them to zero
  ---
  duration_ms: 1.30264
  type: 'test'
  ...
# Subtest: other core finance calculators also reject blank required fields
ok 338 - other core finance calculators also reject blank required fields
  ---
  duration_ms: 0.180036
  type: 'test'
  ...
# Subtest: Loan term must map to a whole number of monthly payment periods
ok 339 - Loan term must map to a whole number of monthly payment periods
  ---
  duration_ms: 1.196933
  type: 'test'
  ...
# Subtest: advanced amortization follows the same whole-month contract
ok 340 - advanced amortization follows the same whole-month contract
  ---
  duration_ms: 0.292694
  type: 'test'
  ...
# Subtest: markup keeps ordinary selling-price and margin output unchanged
ok 341 - markup keeps ordinary selling-price and margin output unchanged
  ---
  duration_ms: 1.99698
  type: 'test'
  ...
# Subtest: markup reports zero-cost equivalent margin as undefined instead of 0%
ok 342 - markup reports zero-cost equivalent margin as undefined instead of 0%
  ---
  duration_ms: 0.330971
  type: 'test'
  ...
# Subtest: markup still treats zero markup on a positive cost as a defined 0% margin
ok 343 - markup still treats zero markup on a positive cost as a defined 0% margin
  ---
  duration_ms: 0.368997
  type: 'test'
  ...
# Subtest: Big Number Calculator preserves exact arbitrary-precision integer arithmetic
ok 344 - Big Number Calculator preserves exact arbitrary-precision integer arithmetic
  ---
  duration_ms: 1.939604
  type: 'test'
  ...
# Subtest: Big Number Calculator rejects malformed, blank, over-limit, decimal, exponent and zero-divisor input
ok 345 - Big Number Calculator rejects malformed, blank, over-limit, decimal, exponent and zero-divisor input
  ---
  duration_ms: 15.657293
  type: 'test'
  ...
# Subtest: Distance Calculator covers reference, signed, decimal, zero-distance and axis-aligned cases
ok 346 - Distance Calculator covers reference, signed, decimal, zero-distance and axis-aligned cases
  ---
  duration_ms: 1.346285
  type: 'test'
  ...
# Subtest: Distance Calculator rejects blank, non-finite and out-of-bound coordinates
ok 347 - Distance Calculator rejects blank, non-finite and out-of-bound coordinates
  ---
  duration_ms: 0.214618
  type: 'test'
  ...
# Subtest: Math mini-cluster is published through the existing registries and remains unitless
ok 348 - Math mini-cluster is published through the existing registries and remains unitless
  ---
  duration_ms: 0.881256
  type: 'test'
  ...
# Subtest: matrix determinant and inverse ignore unused Matrix B inputs
ok 349 - matrix determinant and inverse ignore unused Matrix B inputs
  ---
  duration_ms: 18.182405
  type: 'test'
  ...
# Subtest: matrix two-matrix operations still require valid Matrix B inputs
ok 350 - matrix two-matrix operations still require valid Matrix B inputs
  ---
  duration_ms: 0.214809
  type: 'test'
  ...
# Subtest: Mileage exposes an explicit measurement-system selector
ok 351 - Mileage exposes an explicit measurement-system selector
  ---
  duration_ms: 1.181201
  type: 'test'
  ...
# Subtest: Mileage preserves US-customary MPG calculation
ok 352 - Mileage preserves US-customary MPG calculation
  ---
  duration_ms: 0.544097
  type: 'test'
  ...
# Subtest: Mileage calculates metric consumption without mixing units
ok 353 - Mileage calculates metric consumption without mixing units
  ---
  duration_ms: 0.190933
  type: 'test'
  ...
# Subtest: Mortgage term must resolve to whole monthly payment periods
ok 354 - Mortgage term must resolve to whole monthly payment periods
  ---
  duration_ms: 2.576448
  type: 'test'
  ...
# Subtest: Mortgage advanced scenario follows the same whole-month term contract
ok 355 - Mortgage advanced scenario follows the same whole-month term contract
  ---
  duration_ms: 0.585357
  type: 'test'
  ...
# Subtest: Ohm’s Law labels identify the actual known quantities for every operation
ok 356 - Ohm’s Law labels identify the actual known quantities for every operation
  ---
  duration_ms: 1.000042
  type: 'test'
  ...
# Subtest: Ohm’s Law keeps non-Ohm fields and unknown modes on their declared labels
ok 357 - Ohm’s Law keeps non-Ohm fields and unknown modes on their declared labels
  ---
  duration_ms: 0.184894
  type: 'test'
  ...
# Subtest: Ohm’s Law calculates all four supported relationships
ok 358 - Ohm’s Law calculates all four supported relationships
  ---
  duration_ms: 16.609604
  type: 'test'
  ...
# Subtest: Ohm’s Law rejects zero divisors but accepts zero in multiplication relationships
ok 359 - Ohm’s Law rejects zero divisors but accepts zero in multiplication relationships
  ---
  duration_ms: 0.572398
  type: 'test'
  ...
# Subtest: basic overtime ignores hidden advanced-only values
ok 360 - basic overtime ignores hidden advanced-only values
  ---
  duration_ms: 0.790161
  type: 'test'
  ...
# Subtest: advanced overtime ignores hidden basic-only overtime hours
ok 361 - advanced overtime ignores hidden basic-only overtime hours
  ---
  duration_ms: 0.171494
  type: 'test'
  ...
# Subtest: each overtime mode still rejects invalid values that are active in that mode
ok 362 - each overtime mode still rejects invalid values that are active in that mode
  ---
  duration_ms: 0.150422
  type: 'test'
  ...
# Subtest: parsePdfPageSelection handles all, ranges, duplicates and ordering
ok 363 - parsePdfPageSelection handles all, ranges, duplicates and ordering
  ---
  duration_ms: 1.926765
  type: 'test'
  ...
# Subtest: safePdfBaseName removes the extension and unsafe filename characters
ok 364 - safePdfBaseName removes the extension and unsafe filename characters
  ---
  duration_ms: 0.366944
  type: 'test'
  ...
# Subtest: textItemsToPlainText preserves explicit PDF text line endings
ok 365 - textItemsToPlainText preserves explicit PDF text line endings
  ---
  duration_ms: 0.241798
  type: 'test'
  ...
# Subtest: assembleExtractedPdfText keeps deterministic page separators and empty-page markers
ok 366 - assembleExtractedPdfText keeps deterministic page separators and empty-page markers
  ---
  duration_ms: 0.150333
  type: 'test'
  ...
# Subtest: createStoredZip emits a valid ZIP envelope with both filenames
ok 367 - createStoredZip emits a valid ZIP envelope with both filenames
  ---
  duration_ms: 0.645767
  type: 'test'
  ...
# Subtest: FT-04 page plan supports rotate, reorder, delete and immutable undo/redo
ok 368 - FT-04 page plan supports rotate, reorder, delete and immutable undo/redo
  ---
  duration_ms: 2.125369
  type: 'test'
  ...
# Subtest: FT-04 prevents deleting every page and rejects invalid page plans or rotations
ok 369 - FT-04 prevents deleting every page and rejects invalid page plans or rotations
  ---
  duration_ms: 0.576514
  type: 'test'
  ...
# Subtest: FT-04 export plan preserves page identity for annotations after reorder, rotation and deletion
ok 370 - FT-04 export plan preserves page identity for annotations after reorder, rotation and deletion
  ---
  duration_ms: 68.317181
  type: 'test'
  ...
# Subtest: FT-04 adds user rotation to a page that already has source rotation
ok 371 - FT-04 adds user rotation to a page that already has source rotation
  ---
  duration_ms: 9.115699
  type: 'test'
  ...
# Subtest: FT-04 editor wires preview, controls and export through stable source-page identity
ok 372 - FT-04 editor wires preview, controls and export through stable source-page identity
  ---
  duration_ms: 0.76936
  type: 'test'
  ...
# Subtest: FT-02 PDF rule requires a real PDF signature
ok 373 - FT-02 PDF rule requires a real PDF signature
  ---
  duration_ms: 1.575135
  type: 'test'
  ...
# Subtest: FT-02 coordinate transforms remain stable across zoom and PDF.js-style Y inversion
ok 374 - FT-02 coordinate transforms remain stable across zoom and PDF.js-style Y inversion
  ---
  duration_ms: 0.542173
  type: 'test'
  ...
# Subtest: FT-02 releases every acquired PDF.js page after success, cancellation and render failure
ok 375 - FT-02 releases every acquired PDF.js page after success, cancellation and render failure
  ---
  duration_ms: 1.072029
  type: 'test'
  ...
# Subtest: FT-02 edit objects clamp to page bounds and use useful defaults
ok 376 - FT-02 edit objects clamp to page bounds and use useful defaults
  ---
  duration_ms: 0.349097
  type: 'test'
  ...
# Subtest: FT-03 annotation objects use bounded defaults and reviewed stamp values
ok 377 - FT-03 annotation objects use bounded defaults and reviewed stamp values
  ---
  duration_ms: 0.258523
  type: 'test'
  ...
# Subtest: FT-02 history supports immutable commit, undo, redo and redo invalidation for every object kind
ok 378 - FT-02 history supports immutable commit, undo, redo and redo invalidation for every object kind
  ---
  duration_ms: 3.280802
  type: 'test'
  ...
# Subtest: FT-02 resource guards enforce PDF page and uploaded image limits
ok 379 - FT-02 resource guards enforce PDF page and uploaded image limits
  ---
  duration_ms: 0.362517
  type: 'test'
  ...
# Subtest: FT-02 exports typed text, date, check and drawn signature into a reopenable PDF
ok 380 - FT-02 exports typed text, date, check and drawn signature into a reopenable PDF
  ---
  duration_ms: 76.043641
  type: 'test'
  ...
# Subtest: FT-03 exports highlight, freehand and reviewed stamp annotations into a reopenable PDF
ok 381 - FT-03 exports highlight, freehand and reviewed stamp annotations into a reopenable PDF
  ---
  duration_ms: 13.494959
  type: 'test'
  ...
# Subtest: FT-03 embeds an uploaded PNG media object into a reopenable PDF
ok 382 - FT-03 embeds an uploaded PNG media object into a reopenable PDF
  ---
  duration_ms: 19.009731
  type: 'test'
  ...
# Subtest: FT-02 rejects malformed edits instead of exporting ambiguous output
ok 383 - FT-02 rejects malformed edits instead of exporting ambiguous output
  ---
  duration_ms: 7.914619
  type: 'test'
  ...
# Subtest: FT-02 core contains no upload, persistence, analytics or runtime CDN calls
ok 384 - FT-02 core contains no upload, persistence, analytics or runtime CDN calls
  ---
  duration_ms: 0.469385
  type: 'test'
  ...
# Subtest: FT-02 cancellation destroys the active PDF.js task and releases retained bytes
ok 385 - FT-02 cancellation destroys the active PDF.js task and releases retained bytes
  ---
  duration_ms: 0.628802
  type: 'test'
  ...
# Subtest: FT-02 editor page has no document upload, persistence, or logging path
ok 386 - FT-02 editor page has no document upload, persistence, or logging path
  ---
  duration_ms: 1.21439
  type: 'test'
  ...
# Subtest: FT-02 core and shared file foundation stay free of network and persistence APIs
ok 387 - FT-02 core and shared file foundation stay free of network and persistence APIs
  ---
  duration_ms: 0.374665
  type: 'test'
  ...
# Subtest: percentage calculator validates required numeric inputs
ok 388 - percentage calculator validates required numeric inputs
  ---
  duration_ms: 2.499735
  type: 'test'
  ...
# Subtest: percentage change identifies increases and absolute change
ok 389 - percentage change identifies increases and absolute change
  ---
  duration_ms: 1.473744
  type: 'test'
  ...
# Subtest: percentage change identifies decreases and no change
ok 390 - percentage change identifies decreases and no change
  ---
  duration_ms: 0.187769
  type: 'test'
  ...
# Subtest: percentage change rejects a zero or non-finite baseline without invalid output
ok 391 - percentage change rejects a zero or non-finite baseline without invalid output
  ---
  duration_ms: 0.277652
  type: 'test'
  ...
# Subtest: percentage difference uses absolute difference divided by average
ok 392 - percentage difference uses absolute difference divided by average
  ---
  duration_ms: 0.151464
  type: 'test'
  ...
# Subtest: percentage difference rejects negative values and a zero average
ok 393 - percentage difference rejects negative values and a zero average
  ---
  duration_ms: 0.187468
  type: 'test'
  ...
# Subtest: reverse percentage handles increase and decrease directions
ok 394 - reverse percentage handles increase and decrease directions
  ---
  duration_ms: 0.14854
  type: 'test'
  ...
# Subtest: reverse percentage validates rates and never exposes non-finite results
ok 395 - reverse percentage validates rates and never exposes non-finite results
  ---
  duration_ms: 0.25651
  type: 'test'
  ...
# Subtest: finite boundary inputs remain accurate or fail without non-finite output
ok 396 - finite boundary inputs remain accurate or fail without non-finite output
  ---
  duration_ms: 0.423318
  type: 'test'
  ...
# Subtest: shared content supplies formulas, instructions, examples, FAQs, and related tools
ok 397 - shared content supplies formulas, instructions, examples, FAQs, and related tools
  ---
  duration_ms: 0.564948
  type: 'test'
  ...
# Subtest: Personal Loan keeps the standard 5-year amortization result
ok 398 - Personal Loan keeps the standard 5-year amortization result
  ---
  duration_ms: 16.045849
  type: 'test'
  ...
# Subtest: Personal Loan rejects a zero-length repayment term
ok 399 - Personal Loan rejects a zero-length repayment term
  ---
  duration_ms: 0.338792
  type: 'test'
  ...
# Subtest: Personal Loan rejects terms that do not resolve to whole monthly payments
ok 400 - Personal Loan rejects terms that do not resolve to whole monthly payments
  ---
  duration_ms: 0.287656
  type: 'test'
  ...
# Subtest: Personal Loan accepts a valid three-month term
ok 401 - Personal Loan accepts a valid three-month term
  ---
  duration_ms: 0.363168
  type: 'test'
  ...
# Subtest: Personal Loan term input exposes a one-month browser step and positive minimum
ok 402 - Personal Loan term input exposes a one-month browser step and positive minimum
  ---
  duration_ms: 0.80945
  type: 'test'
  ...
# Subtest: Personal Loan amount and rate retain decimal input support
ok 403 - Personal Loan amount and rate retain decimal input support
  ---
  duration_ms: 0.139316
  type: 'test'
  ...
# Subtest: credit-card payoff reports payoff cost without overstating the final payment
ok 404 - credit-card payoff reports payoff cost without overstating the final payment
  ---
  duration_ms: 17.869271
  type: 'test'
  ...
# Subtest: credit-card zero-APR payoff does not invent interest
ok 405 - credit-card zero-APR payoff does not invent interest
  ---
  duration_ms: 0.476466
  type: 'test'
  ...
# Subtest: credit-card payoff never reports the 1200-month safety cap as a completed payoff
ok 406 - credit-card payoff never reports the 1200-month safety cap as a completed payoff
  ---
  duration_ms: 0.764132
  type: 'test'
  ...
# Subtest: credit-card still rejects payments that do not exceed first-month interest
ok 407 - credit-card still rejects payments that do not exceed first-month interest
  ---
  duration_ms: 0.200577
  type: 'test'
  ...
# Subtest: Commission treats a blank optional base-pay field as zero
ok 408 - Commission treats a blank optional base-pay field as zero
  ---
  duration_ms: 1.682303
  type: 'test'
  ...
# Subtest: Commission preserves explicit base pay and required fields
ok 409 - Commission preserves explicit base pay and required fields
  ---
  duration_ms: 0.178925
  type: 'test'
  ...
# Subtest: Auto Lease requires a whole-number monthly term
ok 410 - Auto Lease requires a whole-number monthly term
  ---
  duration_ms: 16.662403
  type: 'test'
  ...
# Subtest: Bond exposes and enforces whole annual coupon periods
ok 411 - Bond exposes and enforces whole annual coupon periods
  ---
  duration_ms: 0.470176
  type: 'test'
  ...
# Subtest: Other Phase Four calculators keep blank values and field constraints untouched
ok 412 - Other Phase Four calculators keep blank values and field constraints untouched
  ---
  duration_ms: 0.309829
  type: 'test'
  ...
# Subtest: phase four publishes 15 canonical definition-driven tools with API parity
ok 413 - phase four publishes 15 canonical definition-driven tools with API parity
  ---
  duration_ms: 8.1989
  type: 'test'
  ...
# Subtest: requested Phase Four priority pages have substantial unique and safe registry prose
ok 414 - requested Phase Four priority pages have substantial unique and safe registry prose
  ---
  duration_ms: 1.506372
  type: 'test'
  ...
# Subtest: phase four known outputs and invalid input handling are deterministic
ok 415 - phase four known outputs and invalid input handling are deterministic
  ---
  duration_ms: 1.171086
  type: 'test'
  ...
# Subtest: shoe size shared engine covers child stages, women and men without silent rounding
ok 416 - shoe size shared engine covers child stages, women and men without silent rounding
  ---
  duration_ms: 0.354385
  type: 'test'
  ...
# Subtest: APR treats fees as withheld proceeds rather than financed principal
ok 417 - APR treats fees as withheld proceeds rather than financed principal
  ---
  duration_ms: 0.380524
  type: 'test'
  ...
# Subtest: phase 3A formulas and transformations produce known answers
ok 418 - phase 3A formulas and transformations produce known answers
  ---
  duration_ms: 3.468931
  type: 'test'
  ...
# Subtest: Base64 handles UTF-8 round trips and rejects malformed input
ok 419 - Base64 handles UTF-8 round trips and rejects malformed input
  ---
  duration_ms: 0.885532
  type: 'test'
  ...
# Subtest: IP subnet calculations validate IPv4 and IPv6 accurately
ok 420 - IP subnet calculations validate IPv4 and IPv6 accurately
  ---
  duration_ms: 0.642982
  type: 'test'
  ...
# Subtest: secure passwords use supplied cryptographic bytes and include every enabled class
ok 421 - secure passwords use supplied cryptographic bytes and include every enabled class
  ---
  duration_ms: 0.784502
  type: 'test'
  ...
# Subtest: phase 3A boundary and applicability errors are explicit
ok 422 - phase 3A boundary and applicability errors are explicit
  ---
  duration_ms: 0.273536
  type: 'test'
  ...
# Subtest: phase 3A metadata is unique, substantive, local, and indexable
ok 423 - phase 3A metadata is unique, substantive, local, and indexable
  ---
  duration_ms: 3.881302
  type: 'test'
  ...
# Subtest: horsepower intent is consolidated without competing canonical pages
ok 424 - horsepower intent is consolidated without competing canonical pages
  ---
  duration_ms: 0.186376
  type: 'test'
  ...
# Subtest: Phase 3B catalog metadata stays synchronized from the canonical source
ok 425 - Phase 3B catalog metadata stays synchronized from the canonical source
  ---
  duration_ms: 1.525731
  type: 'test'
  ...
# Subtest: all Phase 3B routes have unique registry, substantive content, metadata, and schema
ok 426 - all Phase 3B routes have unique registry, substantive content, metadata, and schema
  ---
  duration_ms: 6.581463
  type: 'test'
  ...
# Subtest: binary and hexadecimal conversions validate signed width and exact integer representations
ok 427 - binary and hexadecimal conversions validate signed width and exact integer representations
  ---
  duration_ms: 1.688533
  type: 'test'
  ...
# Subtest: circle, factors, GCF, LCM, and prime factorization cover their formulas and domain errors
ok 428 - circle, factors, GCF, LCM, and prime factorization cover their formulas and domain errors
  ---
  duration_ms: 1.205636
  type: 'test'
  ...
# Subtest: confidence, exponent, half-life, logarithm, division, statistics, sequences, and combinatorics validate known results
ok 429 - confidence, exponent, half-life, logarithm, division, statistics, sequences, and combinatorics validate known results
  ---
  duration_ms: 1.688862
  type: 'test'
  ...
# Subtest: matrix multiplication supports valid rectangular dimensions
ok 430 - matrix multiplication supports valid rectangular dimensions
  ---
  duration_ms: 0.592588
  type: 'test'
  ...
# Subtest: matrix multiplication rejects incompatible dimensions and malformed shapes
ok 431 - matrix multiplication rejects incompatible dimensions and malformed shapes
  ---
  duration_ms: 0.272544
  type: 'test'
  ...
# Subtest: matrix addition and subtraction require and handle equal dimensions
ok 432 - matrix addition and subtraction require and handle equal dimensions
  ---
  duration_ms: 0.657815
  type: 'test'
  ...
# Subtest: matrix determinant and inverse enforce square A and reject singular matrices
ok 433 - matrix determinant and inverse enforce square A and reject singular matrices
  ---
  duration_ms: 0.961265
  type: 'test'
  ...
# Subtest: every Probability Calculator mode has valid explanatory defaults
ok 434 - every Probability Calculator mode has valid explanatory defaults
  ---
  duration_ms: 1.143995
  type: 'test'
  ...
# Subtest: Phase 3C reconciles approved, expanded, existing, and rejected intents without duplicate pages
ok 435 - Phase 3C reconciles approved, expanded, existing, and rejected intents without duplicate pages
  ---
  duration_ms: 1.341579
  type: 'test'
  ...
# Subtest: all approved Phase 3C pages have useful content, sources, safety guidance, canonical metadata, and synchronized schemas
ok 436 - all approved Phase 3C pages have useful content, sources, safety guidance, canonical metadata, and synchronized schemas
  ---
  duration_ms: 3.564433
  type: 'test'
  ...
# Subtest: BAC and body surface area equations match known examples and reject unsafe ranges
ok 437 - BAC and body surface area equations match known examples and reject unsafe ranges
  ---
  duration_ms: 1.145077
  type: 'test'
  ...
# Subtest: BMI, reference weight, historical height formulas, and lean mass remain respectful and bounded
ok 438 - BMI, reference weight, historical height formulas, and lean mass remain respectful and bounded
  ---
  duration_ms: 0.703051
  type: 'test'
  ...
# Subtest: 2021 race-free CKD-EPI eGFR is labeled exactly and validates its adult domain
ok 439 - 2021 race-free CKD-EPI eGFR is labeled exactly and validates its adult domain
  ---
  duration_ms: 0.275778
  type: 'test'
  ...
# Subtest: macro and TDEE formulas validate splits, activity factors, and pregnancy exclusions
ok 440 - macro and TDEE formulas validate splits, activity factors, and pregnancy exclusions
  ---
  duration_ms: 0.572869
  type: 'test'
  ...
# Subtest: molecular weight parser handles elements and nested groups while rejecting unsupported notation
ok 441 - molecular weight parser handles elements and nested groups while rejecting unsupported notation
  ---
  duration_ms: 1.098258
  type: 'test'
  ...
# Subtest: cycle estimator consolidates period, ovulation, and conception dates without contraceptive claims
ok 442 - cycle estimator consolidates period, ovulation, and conception dates without contraceptive claims
  ---
  duration_ms: 0.430548
  type: 'test'
  ...
# Subtest: target heart rate implements the cited simple AHA percentage method
ok 443 - target heart rate implements the cited simple AHA percentage method
  ---
  duration_ms: 0.450998
  type: 'test'
  ...
# Subtest: all Phase 3C defaults calculate safely without NaN, infinity, diagnosis, or endorsement claims
ok 444 - all Phase 3C defaults calculate safely without NaN, infinity, diagnosis, or endorsement claims
  ---
  duration_ms: 2.184938
  type: 'test'
  ...
# Subtest: phase two formulas produce known answers
ok 445 - phase two formulas produce known answers
  ---
  duration_ms: 24.379989
  type: 'test'
  ...
# Subtest: phase two invalid and boundary cases are explicit
ok 446 - phase two invalid and boundary cases are explicit
  ---
  duration_ms: 0.360224
  type: 'test'
  ...
# Subtest: time duration has dedicated elapsed-time guidance
ok 447 - time duration has dedicated elapsed-time guidance
  ---
  duration_ms: 0.663233
  type: 'test'
  ...
# Subtest: phase two metadata is unique, substantive, and linked
ok 448 - phase two metadata is unique, substantive, and linked
  ---
  duration_ms: 7.543549
  type: 'test'
  ...
# Subtest: pregnancy-conception rejects impossible Gregorian calendar dates
ok 449 - pregnancy-conception rejects impossible Gregorian calendar dates
  ---
  duration_ms: 1.093541
  type: 'test'
  ...
# Subtest: pregnancy-conception accepts a real leap-day last-period date
ok 450 - pregnancy-conception accepts a real leap-day last-period date
  ---
  duration_ms: 0.746877
  type: 'test'
  ...
# Subtest: every named priority calculator has substantial, distinct, appropriately safe registry prose
ok 451 - every named priority calculator has substantial, distinct, appropriately safe registry prose
  ---
  duration_ms: 27.559852
  type: 'test'
  ...
# Subtest: auto loan includes tax and fees before amortizing the financed amount
ok 452 - auto loan includes tax and fees before amortizing the financed amount
  ---
  duration_ms: 2.665029
  type: 'test'
  ...
# Subtest: auto loan requires a whole-number monthly term
ok 453 - auto loan requires a whole-number monthly term
  ---
  duration_ms: 0.732595
  type: 'test'
  ...
# Subtest: simple interest follows I = P r t and supports fractional years
ok 454 - simple interest follows I = P r t and supports fractional years
  ---
  duration_ms: 0.440072
  type: 'test'
  ...
# Subtest: interest rate solver recovers a known amortizing rate
ok 455 - interest rate solver recovers a known amortizing rate
  ---
  duration_ms: 0.374575
  type: 'test'
  ...
# Subtest: interest rate requires a whole number of monthly payments
ok 456 - interest rate requires a whole number of monthly payments
  ---
  duration_ms: 0.356348
  type: 'test'
  ...
# Subtest: mortgage amortization returns an independently checked payment snapshot
ok 457 - mortgage amortization returns an independently checked payment snapshot
  ---
  duration_ms: 0.476586
  type: 'test'
  ...
# Subtest: mortgage amortization remains stable near the end of supported high-rate schedules
ok 458 - mortgage amortization remains stable near the end of supported high-rate schedules
  ---
  duration_ms: 0.522595
  type: 'test'
  ...
# Subtest: mortgage amortization requires discrete monthly schedule periods
ok 459 - mortgage amortization requires discrete monthly schedule periods
  ---
  duration_ms: 1.283071
  type: 'test'
  ...
# Subtest: mortgage payoff compares recurring extra principal with the baseline
ok 460 - mortgage payoff compares recurring extra principal with the baseline
  ---
  duration_ms: 0.665616
  type: 'test'
  ...
# Subtest: priority finance calculators reject non-finite, negative, and unsupported values
ok 461 - priority finance calculators reject non-finite, negative, and unsupported values
  ---
  duration_ms: 0.605257
  type: 'test'
  ...
# Subtest: Priority One expansion has unique routes and working defaults
ok 462 - Priority One expansion has unique routes and working defaults
  ---
  duration_ms: 29.507097
  type: 'test'
  ...
# Subtest: Priority One safety content is specific to finance, health, and manual currency assumptions
ok 463 - Priority One safety content is specific to finance, health, and manual currency assumptions
  ---
  duration_ms: 0.501573
  type: 'test'
  ...
# Subtest: Priority One consequential calculators provide valid official-context sources
ok 464 - Priority One consequential calculators provide valid official-context sources
  ---
  duration_ms: 0.434294
  type: 'test'
  ...
# Subtest: Priority One validation and known formula cases
ok 465 - Priority One validation and known formula cases
  ---
  duration_ms: 1.067572
  type: 'test'
  ...
# Subtest: Investment Calculator keeps normal growth and rejects non-finite projections
ok 466 - Investment Calculator keeps normal growth and rejects non-finite projections
  ---
  duration_ms: 0.581472
  type: 'test'
  ...
# Subtest: simple probability preserves valid whole outcome counts
ok 467 - simple probability preserves valid whole outcome counts
  ---
  duration_ms: 18.33461
  type: 'test'
  ...
# Subtest: simple probability rejects fractional favorable or total counts
ok 468 - simple probability rejects fractional favorable or total counts
  ---
  duration_ms: 0.369788
  type: 'test'
  ...
# Subtest: probability-valued modes preserve decimal probabilities
ok 469 - probability-valued modes preserve decimal probabilities
  ---
  duration_ms: 0.421604
  type: 'test'
  ...
# Subtest: probability input contracts match the selected model
ok 470 - probability input contracts match the selected model
  ---
  duration_ms: 0.716712
  type: 'test'
  ...
# Subtest: Profit Margin accepts valid finite negative margins below -100,000 percent
ok 471 - Profit Margin accepts valid finite negative margins below -100,000 percent
  ---
  duration_ms: 1.474836
  type: 'test'
  ...
# Subtest: Profit Margin still rejects non-finite results
ok 472 - Profit Margin still rejects non-finite results
  ---
  duration_ms: 0.245424
  type: 'test'
  ...
# Subtest: parseRequiredNumber distinguishes missing input from an intentional zero
ok 473 - parseRequiredNumber distinguishes missing input from an intentional zero
  ---
  duration_ms: 0.742821
  type: 'test'
  ...
# Subtest: retirement advanced scenario preserves ordinary projections
ok 474 - retirement advanced scenario preserves ordinary projections
  ---
  duration_ms: 1.892664
  type: 'test'
  ...
# Subtest: retirement advanced scenario rejects unsupported finance boundaries
ok 475 - retirement advanced scenario rejects unsupported finance boundaries
  ---
  duration_ms: 0.28956
  type: 'test'
  ...
# Subtest: retirement advanced scenario keeps exact supported limits valid
ok 476 - retirement advanced scenario keeps exact supported limits valid
  ---
  duration_ms: 0.599599
  type: 'test'
  ...
# Subtest: ROI accepts mathematically valid finite returns above 100,000 percent
ok 477 - ROI accepts mathematically valid finite returns above 100,000 percent
  ---
  duration_ms: 2.495758
  type: 'test'
  ...
# Subtest: ROI still rejects non-finite calculations instead of displaying Infinity
ok 478 - ROI still rejects non-finite calculations instead of displaying Infinity
  ---
  duration_ms: 0.390749
  type: 'test'
  ...
# Subtest: Roman numeral converter accepts only whole numbers from 1 through 3999
ok 479 - Roman numeral converter accepts only whole numbers from 1 through 3999
  ---
  duration_ms: 1.481626
  type: 'test'
  ...
# Subtest: salary calculation preserves the standard full-time example
ok 480 - salary calculation preserves the standard full-time example
  ---
  duration_ms: 1.012811
  type: 'test'
  ...
# Subtest: salary converter annualizes common source pay periods
ok 481 - salary converter annualizes common source pay periods
  ---
  duration_ms: 0.210372
  type: 'test'
  ...
# Subtest: salary converter rejects annualized totals above the supported boundary
ok 482 - salary converter rejects annualized totals above the supported boundary
  ---
  duration_ms: 0.130754
  type: 'test'
  ...
# Subtest: advanced salary prorates unpaid weeks and then adds bonus
ok 483 - advanced salary prorates unpaid weeks and then adds bonus
  ---
  duration_ms: 0.214598
  type: 'test'
  ...
# Subtest: salary calculation rejects impossible work schedules
ok 484 - salary calculation rejects impossible work schedules
  ---
  duration_ms: 0.149391
  type: 'test'
  ...
# Subtest: salary calculation rejects unsupported amounts and computed totals
ok 485 - salary calculation rejects unsupported amounts and computed totals
  ---
  duration_ms: 0.158285
  type: 'test'
  ...
# Subtest: salary calculation accepts the exact supported amount boundary
ok 486 - salary calculation accepts the exact supported amount boundary
  ---
  duration_ms: 0.277031
  type: 'test'
  ...
# Subtest: savings math handles zero interest exactly
ok 487 - savings math handles zero interest exactly
  ---
  duration_ms: 0.943668
  type: 'test'
  ...
# Subtest: savings math compounds monthly contributions at month end
ok 488 - savings math compounds monthly contributions at month end
  ---
  duration_ms: 0.22217
  type: 'test'
  ...
# Subtest: savings math rejects unsupported finance ranges
ok 489 - savings math rejects unsupported finance ranges
  ---
  duration_ms: 0.243872
  type: 'test'
  ...
# Subtest: savings math remains stable at extremely small nonzero rates
ok 490 - savings math remains stable at extremely small nonzero rates
  ---
  duration_ms: 0.162641
  type: 'test'
  ...
# Subtest: every measured or monetary tool has specific capability copy
not ok 491 - every measured or monetary tool has specific capability copy
  ---
  duration_ms: 2.610398
  type: 'test'
  location: '/home/runner/work/figurenest/figurenest/artifacts/calcstride/src/lib/seo-capabilities.test.ts:1:487'
  failureType: 'testCodeFailure'
  error: 'docx-to-pdf is missing an applicability classification'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  operator: '=='
  stack: |-
    TestContext.<anonymous> (/home/runner/work/figurenest/figurenest/artifacts/calcstride/src/lib/seo-capabilities.test.ts:13:12)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.start (node:internal/test_runner/test:944:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
  ...
# Subtest: currency language is limited to monetary tools and explains the no-FX boundary
not ok 492 - currency language is limited to monetary tools and explains the no-FX boundary
  ---
  duration_ms: 0.92423
  type: 'test'
  location: '/home/runner/work/figurenest/figurenest/artifacts/calcstride/src/lib/seo-capabilities.test.ts:1:893'
  failureType: 'testCodeFailure'
  error: "Cannot read properties of undefined (reading 'monetary')"
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
  stack: |-
    TestContext.<anonymous> (/home/runner/work/figurenest/figurenest/artifacts/calcstride/src/lib/seo-capabilities.test.ts:25:23)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
    Test.run (node:internal/test_runner/test:1101:12)
    async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)
  ...
# Subtest: capability metadata is unique, useful in search, and applied to canonical calculator records
ok 493 - capability metadata is unique, useful in search, and applied to canonical calculator records
  ---
  duration_ms: 17.972183
  type: 'test'
  ...
# Subtest: visible finance and converter FAQs remain synchronized with FAQ schema
ok 494 - visible finance and converter FAQs remain synchronized with FAQ schema
  ---
  duration_ms: 4.072055
  type: 'test'
  ...
# Subtest: representative converter links use descriptive labels and canonical tool routes
ok 495 - representative converter links use descriptive labels and canonical tool routes
  ---
  duration_ms: 0.315728
  type: 'test'
  ...
# Subtest: shoe size catalog and SEO describe the dedicated child-capable converter
ok 496 - shoe size catalog and SEO describe the dedicated child-capable converter
  ---
  duration_ms: 2.132831
  type: 'test'
  ...
# Subtest: shoe size converter exposes unambiguous child stages
ok 497 - shoe size converter exposes unambiguous child stages
  ---
  duration_ms: 1.656505
  type: 'test'
  ...
# Subtest: each stage keeps regional inputs unique and exact
ok 498 - each stage keeps regional inputs unique and exact
  ---
  duration_ms: 1.527804
  type: 'test'
  ...
# Subtest: the child-stage tables remain contiguous by EU reference size
ok 499 - the child-stage tables remain contiguous by EU reference size
  ---
  duration_ms: 0.413833
  type: 'test'
  ...
# Subtest: API and local fallback catalogs expose the same published tools
ok 500 - API and local fallback catalogs expose the same published tools
  ---
  duration_ms: 1.868669
  type: 'test'
  ...
# Subtest: API and local fallback catalogs expose the same non-empty categories
ok 501 - API and local fallback catalogs expose the same non-empty categories
  ---
  duration_ms: 0.252915
  type: 'test'
  ...
# Subtest: every public non-construction category has substantive visible guide content and FAQ schema
ok 502 - every public non-construction category has substantive visible guide content and FAQ schema
  ---
  duration_ms: 1.197034
  type: 'test'
  ...
# Subtest: new category guides describe every published tool in their category
ok 503 - new category guides describe every published tool in their category
  ---
  duration_ms: 0.247157
  type: 'test'
  ...
# Subtest: category guide tool descriptions use published tool identities
ok 504 - category guide tool descriptions use published tool identities
  ---
  duration_ms: 0.384349
  type: 'test'
  ...
# Subtest: homepage and finance category metadata describe the current catalogue
ok 505 - homepage and finance category metadata describe the current catalogue
  ---
  duration_ms: 0.298793
  type: 'test'
  ...
# Subtest: every public meta description is complete, unique, and snippet-safe
ok 506 - every public meta description is complete, unique, and snippet-safe
  ---
  duration_ms: 9.95324
  type: 'test'
  ...
# Subtest: all site-wide tool and category counts derive from published tool pages
ok 507 - all site-wide tool and category counts derive from published tool pages
  ---
  duration_ms: 0.265143
  type: 'test'
  ...
# Subtest: every catalog category has one indexable discovery route in the sitemap
ok 508 - every catalog category has one indexable discovery route in the sitemap
  ---
  duration_ms: 0.389227
  type: 'test'
  ...
# Subtest: homepage inventory metadata is dynamic and contains no stale legacy totals
ok 509 - homepage inventory metadata is dynamic and contains no stale legacy totals
  ---
  duration_ms: 0.465951
  type: 'test'
  ...
# Subtest: tool slugs, names, descriptions, and destinations are unique
ok 510 - tool slugs, names, descriptions, and destinations are unique
  ---
  duration_ms: 0.170433
  type: 'test'
  ...
# Subtest: tool metadata has no malformed, generic, or duplicated descriptions
ok 511 - tool metadata has no malformed, generic, or duplicated descriptions
  ---
  duration_ms: 6.763082
  type: 'test'
  ...
# Subtest: canonical related-tool graph covers every published tool with reciprocal semantic links
ok 512 - canonical related-tool graph covers every published tool with reciprocal semantic links
  ---
  duration_ms: 1.43723
  type: 'test'
  ...
# Subtest: voltage drop has one electrical canonical route and no unpublished math duplicate
ok 513 - voltage drop has one electrical canonical route and no unpublished math duplicate
  ---
  duration_ms: 0.228809
  type: 'test'
  ...
# Subtest: public URLs use a stable trailing-slash convention without changing route keys
ok 514 - public URLs use a stable trailing-slash convention without changing route keys
  ---
  duration_ms: 0.1148
  type: 'test'
  ...
# Subtest: only the canonical production hostname is indexable
ok 515 - only the canonical production hostname is indexable
  ---
  duration_ms: 0.110524
  type: 'test'
  ...
# Subtest: legacy and hostname redirects collapse into one query-preserving 301 target
ok 516 - legacy and hostname redirects collapse into one query-preserving 301 target
  ---
  duration_ms: 0.433392
  type: 'test'
  ...
# Subtest: public SEO includes one production-host-gated AdSense publisher tag after denied consent defaults
ok 517 - public SEO includes one production-host-gated AdSense publisher tag after denied consent defaults
  ---
  duration_ms: 0.47934
  type: 'test'
  ...
# Subtest: recognized private routes stay noindex without becoming 404 pages
ok 518 - recognized private routes stay noindex without becoming 404 pages
  ---
  duration_ms: 0.409637
  type: 'test'
  ...
# Subtest: every SEO head uses the absolute accessible 1200 by 630 social card
ok 519 - every SEO head uses the absolute accessible 1200 by 630 social card
  ---
  duration_ms: 0.275168
  type: 'test'
  ...
# Subtest: percentage and image scaling pages have distinct specific metadata
ok 520 - percentage and image scaling pages have distinct specific metadata
  ---
  duration_ms: 0.291522
  type: 'test'
  ...
# Subtest: PWA metadata uses the FigureNest identity without changing public routes
ok 521 - PWA metadata uses the FigureNest identity without changing public routes
  ---
  duration_ms: 0.277872
  type: 'test'
  ...
# Subtest: PWA offline behavior is network-first and bypasses private, auth, and API requests
ok 522 - PWA offline behavior is network-first and bypasses private, auth, and API requests
  ---
  duration_ms: 1.473324
  type: 'test'
  ...
# Subtest: SEO accepts legacy slash variants and redirects the retired construction category
ok 523 - SEO accepts legacy slash variants and redirects the retired construction category
  ---
  duration_ms: 0.105887
  type: 'test'
  ...
# Subtest: percentage change has dedicated indexable SEO and FAQ schema
ok 524 - percentage change has dedicated indexable SEO and FAQ schema
  ---
  duration_ms: 0.132697
  type: 'test'
  ...
# Subtest: date duration has dedicated indexable SEO and shared FAQ schema
ok 525 - date duration has dedicated indexable SEO and shared FAQ schema
  ---
  duration_ms: 0.24998
  type: 'test'
  ...
# Subtest: loan, mortgage, and compound interest have distinct indexable SEO and visible FAQ schema
ok 526 - loan, mortgage, and compound interest have distinct indexable SEO and visible FAQ schema
  ---
  duration_ms: 0.289259
  type: 'test'
  ...
# Subtest: age, working days, salary, and overtime have distinct indexable SEO and visible FAQ schema
ok 527 - age, working days, salary, and overtime have distinct indexable SEO and visible FAQ schema
  ---
  duration_ms: 0.288968
  type: 'test'
  ...
# Subtest: core converter cluster has distinct indexable SEO and schema synchronized with visible FAQs
ok 528 - core converter cluster has distinct indexable SEO and schema synchronized with visible FAQs
  ---
  duration_ms: 0.414955
  type: 'test'
  ...
# Subtest: business calculator cluster has distinct indexable SEO and visible FAQ schema
ok 529 - business calculator cluster has distinct indexable SEO and visible FAQ schema
  ---
  duration_ms: 0.465209
  type: 'test'
  ...
# Subtest: automotive energy cluster has distinct indexable SEO and visible FAQ schema
ok 530 - automotive energy cluster has distinct indexable SEO and visible FAQ schema
  ---
  duration_ms: 0.273545
  type: 'test'
  ...
# Subtest: percentage change and date duration remain sitemap-listed and internally discoverable
ok 531 - percentage change and date duration remain sitemap-listed and internally discoverable
  ---
  duration_ms: 0.220006
  type: 'test'
  ...
# Subtest: every catalog destination matches its slug and route family
ok 532 - every catalog destination matches its slug and route family
  ---
  duration_ms: 0.184914
  type: 'test'
  ...
# Subtest: construction related links all resolve to published construction tools
ok 533 - construction related links all resolve to published construction tools
  ---
  duration_ms: 0.197813
  type: 'test'
  ...
# Subtest: sitemap exactly matches all indexable app pages
ok 534 - sitemap exactly matches all indexable app pages
  ---
  duration_ms: 0.544747
  type: 'test'
  ...
# Subtest: every literal internal link points to an indexable route or the home search anchor
ok 535 - every literal internal link points to an indexable route or the home search anchor
  ---
  duration_ms: 0.763581
  type: 'test'
  ...
# Subtest: article registry is substantial, unique, connected, and metadata-safe
ok 536 - article registry is substantial, unique, connected, and metadata-safe
  ---
  duration_ms: 0.367975
  type: 'test'
  ...
# Subtest: article worked examples match their stated formulas and rounding convention
ok 537 - article worked examples match their stated formulas and rounding convention
  ---
  duration_ms: 0.392642
  type: 'test'
  ...
# Subtest: article and homepage schemas stay aligned with visible FAQ registries
ok 538 - article and homepage schemas stay aligned with visible FAQ registries
  ---
  duration_ms: 0.611085
  type: 'test'
  ...
# Subtest: homepage guide previews cover the complete article collection
ok 539 - homepage guide previews cover the complete article collection
  ---
  duration_ms: 0.125436
  type: 'test'
  ...
# Subtest: user-facing sources contain no retired demo or preview content
ok 540 - user-facing sources contain no retired demo or preview content
  ---
  duration_ms: 2.824786
  type: 'test'
  ...
# Subtest: Social Security full retirement age follows SSA birth-year cohorts
ok 541 - Social Security full retirement age follows SSA birth-year cohorts
  ---
  duration_ms: 0.91048
  type: 'test'
  ...
# Subtest: Social Security delayed credits are cohort-aware instead of assuming FRA 67 for everyone
ok 542 - Social Security delayed credits are cohort-aware instead of assuming FRA 67 for everyone
  ---
  duration_ms: 0.279755
  type: 'test'
  ...
# Subtest: Social Security early-retirement reduction matches the FRA-67 cohort at age 62
ok 543 - Social Security early-retirement reduction matches the FRA-67 cohort at age 62
  ---
  duration_ms: 0.14163
  type: 'test'
  ...
# Subtest: Social Security keeps the FRA-67 default deterministic and rejects unsupported input
ok 544 - Social Security keeps the FRA-67 default deterministic and rejects unsupported input
  ---
  duration_ms: 0.177804
  type: 'test'
  ...
# Subtest: Social Security required input parsing distinguishes blank PIA from a deliberate zero
ok 545 - Social Security required input parsing distinguishes blank PIA from a deliberate zero
  ---
  duration_ms: 0.280596
  type: 'test'
  ...
# Subtest: SpeechRecognitionAdapter
    # Subtest: isSupported returns false if no SpeechRecognition available
    ok 1 - isSupported returns false if no SpeechRecognition available
      ---
      duration_ms: 0.496846
      type: 'test'
      ...
    # Subtest: start throws error if not supported
    ok 2 - start throws error if not supported
      ---
      duration_ms: 5.004005
      type: 'test'
      ...
    1..2
ok 546 - SpeechRecognitionAdapter
  ---
  duration_ms: 6.361978
  type: 'test'
  ...
# Subtest: Student Loan required inputs reject blanks without rejecting explicit zero
ok 547 - Student Loan required inputs reject blanks without rejecting explicit zero
  ---
  duration_ms: 0.800246
  type: 'test'
  ...
# Subtest: Student Loan term accepts positive whole monthly payment counts
ok 548 - Student Loan term accepts positive whole monthly payment counts
  ---
  duration_ms: 0.185695
  type: 'test'
  ...
# Subtest: Student Loan term rejects zero, blanks, non-finite values, and fractional months
ok 549 - Student Loan term rejects zero, blanks, non-finite values, and fractional months
  ---
  duration_ms: 0.156752
  type: 'test'
  ...
# Subtest: Time Calculator accepts durations that resolve to whole minutes
ok 550 - Time Calculator accepts durations that resolve to whole minutes
  ---
  duration_ms: 0.97834
  type: 'test'
  ...
# Subtest: Time Calculator rejects sub-minute precision its HH:MM result cannot represent
ok 551 - Time Calculator rejects sub-minute precision its HH:MM result cannot represent
  ---
  duration_ms: 0.153727
  type: 'test'
  ...
# Subtest: blank or non-numeric values remain the core calculator validation responsibility
ok 552 - blank or non-numeric values remain the core calculator validation responsibility
  ---
  duration_ms: 0.157143
  type: 'test'
  ...
# Subtest: rejects an empty field instead of silently treating it as zero
ok 553 - rejects an empty field instead of silently treating it as zero
  ---
  duration_ms: 0.808638
  type: 'test'
  ...
# Subtest: preserves explicit zero and normal decimal values
ok 554 - preserves explicit zero and normal decimal values
  ---
  duration_ms: 0.137073
  type: 'test'
  ...
# Subtest: time-zone rejects a nonexistent local wall time during the spring DST gap
ok 555 - time-zone rejects a nonexistent local wall time during the spring DST gap
  ---
  duration_ms: 19.298248
  type: 'test'
  ...
# Subtest: time-zone converts a valid post-transition local time with the new DST offset
ok 556 - time-zone converts a valid post-transition local time with the new DST offset
  ---
  duration_ms: 1.22088
  type: 'test'
  ...
# Subtest: time-zone rejects an ambiguous repeated local wall time during the autumn DST fold
ok 557 - time-zone rejects an ambiguous repeated local wall time during the autumn DST fold
  ---
  duration_ms: 0.987794
  type: 'test'
  ...
# Subtest: tire size compares two complete sidewall sizes instead of requiring a precomputed reference diameter
ok 558 - tire size compares two complete sidewall sizes instead of requiring a precomputed reference diameter
  ---
  duration_ms: 2.829914
  type: 'test'
  ...
# Subtest: unit registry round-trips every published unit via its canonical value
ok 559 - unit registry round-trips every published unit via its canonical value
  ---
  duration_ms: 1.135803
  type: 'test'
  ...
# Subtest: conversions distinguish US and imperial liquid and fuel-economy units
ok 560 - conversions distinguish US and imperial liquid and fuel-economy units
  ---
  duration_ms: 0.170834
  type: 'test'
  ...
# Subtest: cross-unit conversions are bidirectional without material drift
ok 561 - cross-unit conversions are bidirectional without material drift
  ---
  duration_ms: 0.238974
  type: 'test'
  ...
# Subtest: absolute-zero validation covers below, exact, and above boundaries on every temperature scale
ok 562 - absolute-zero validation covers below, exact, and above boundaries on every temperature scale
  ---
  duration_ms: 0.28302
  type: 'test'
  ...
# Subtest: measurement systems provide useful cross-system converter pairs without changing represented values
ok 563 - measurement systems provide useful cross-system converter pairs without changing represented values
  ---
  duration_ms: 0.743322
  type: 'test'
  ...
# Subtest: converted input display removes binary artifacts without changing canonical precision
ok 564 - converted input display removes binary artifacts without changing canonical precision
  ---
  duration_ms: 0.588532
  type: 'test'
  ...
# Subtest: currency formatting uses the selected denomination without scaling
ok 565 - currency formatting uses the selected denomination without scaling
  ---
  duration_ms: 1.370531
  type: 'test'
  ...
# Subtest: applicability classifies every published tool and validates stored preferences
not ok 566 - applicability classifies every published tool and validates stored preferences
  ---
  duration_ms: 1.642584
  type: 'test'
  location: '/home/runner/work/figurenest/figurenest/artifacts/calcstride/src/lib/units-preferences.test.ts:1:4302'
  failureType: 'testCodeFailure'
  error: 'missing docx-to-pdf'
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: true
  operator: '=='
  stack: |-
    TestContext.<anonymous> (/home/runner/work/figurenest/figurenest/artifacts/calcstride/src/lib/units-preferences.test.ts:104:45)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.processPendingSubtests (node:internal/test_runner/test:744:18)
    Test.postRun (node:internal/test_runner/test:1173:19)
    Test.run (node:internal/test_runner/test:1101:12)
    async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
  ...
# Subtest: VA Mortgage keeps a normal financed-loan scenario valid
ok 567 - VA Mortgage keeps a normal financed-loan scenario valid
  ---
  duration_ms: 17.014355
  type: 'test'
  ...
# Subtest: VA Mortgage rejects a down payment greater than the home price
ok 568 - VA Mortgage rejects a down payment greater than the home price
  ---
  duration_ms: 0.366123
  type: 'test'
  ...
# Subtest: VA Mortgage allows a fully paid purchase without inventing negative financing
ok 569 - VA Mortgage allows a fully paid purchase without inventing negative financing
  ---
  duration_ms: 0.311612
  type: 'test'
  ...
# Subtest: VAT add mode reports gross price and VAT amount consistently
ok 570 - VAT add mode reports gross price and VAT amount consistently
  ---
  duration_ms: 3.006105
  type: 'test'
  ...
# Subtest: VAT remove mode reports the pre-VAT net price in the breakdown
ok 571 - VAT remove mode reports the pre-VAT net price in the breakdown
  ---
  duration_ms: 0.580401
  type: 'test'
  ...
# Subtest: Voltage Drop keeps feet unchanged for the legacy calculator contract
ok 572 - Voltage Drop keeps feet unchanged for the legacy calculator contract
  ---
  duration_ms: 2.187682
  type: 'test'
  ...
# Subtest: Voltage Drop converts metres to feet before the legacy formula runs
ok 573 - Voltage Drop converts metres to feet before the legacy formula runs
  ---
  duration_ms: 0.228007
  type: 'test'
  ...
# Subtest: work and date content is substantial, distinct, and internally connected
ok 574 - work and date content is substantial, distinct, and internally connected
  ---
  duration_ms: 2.154343
  type: 'test'
  ...
# Subtest: age and working-days examples match the existing calendar engines
ok 575 - age and working-days examples match the existing calendar engines
  ---
  duration_ms: 0.891321
  type: 'test'
  ...
# Subtest: salary and overtime examples match the existing pay engines
ok 576 - salary and overtime examples match the existing pay engines
  ---
  duration_ms: 1.121762
  type: 'test'
  ...
# Subtest: work and date invalid and edge inputs fail explicitly
ok 577 - work and date invalid and edge inputs fail explicitly
  ---
  duration_ms: 0.390749
  type: 'test'
  ...
# Subtest: salary and overtime reject unreasonable or overflowing finite inputs
ok 578 - salary and overtime reject unreasonable or overflowing finite inputs
  ---
  duration_ms: 0.581471
  type: 'test'
  ...
# Subtest: basic overtime mode uses entered overtime hours directly
ok 579 - basic overtime mode uses entered overtime hours directly
  ---
  duration_ms: 0.808147
  type: 'test'
  ...
# Subtest: advanced overtime mode derives regular and overtime hours from threshold
ok 580 - advanced overtime mode derives regular and overtime hours from threshold
  ---
  duration_ms: 0.127339
  type: 'test'
  ...
# Subtest: advanced overtime mode pays all hours at regular rate below the threshold
ok 581 - advanced overtime mode pays all hours at regular rate below the threshold
  ---
  duration_ms: 0.103113
  type: 'test'
  ...
# Subtest: overtime math rejects impossible weekly hours and invalid multipliers
ok 582 - overtime math rejects impossible weekly hours and invalid multipliers
  ---
  duration_ms: 0.090223
  type: 'test'
  ...
# Subtest: counts an inclusive Monday-Friday range
ok 583 - counts an inclusive Monday-Friday range
  ---
  duration_ms: 1.662834
  type: 'test'
  ...
# Subtest: reversed endpoints produce the same result
ok 584 - reversed endpoints produce the same result
  ---
  duration_ms: 0.166417
  type: 'test'
  ...
# Subtest: basic mode always restores the standard Monday-Friday schedule
ok 585 - basic mode always restores the standard Monday-Friday schedule
  ---
  duration_ms: 0.172916
  type: 'test'
  ...
# Subtest: advanced mode excludes each valid active date once
ok 586 - advanced mode excludes each valid active date once
  ---
  duration_ms: 0.309058
  type: 'test'
  ...
# Subtest: malformed advanced workweek schedules are rejected instead of coercing blank tokens to Sunday
ok 587 - malformed advanced workweek schedules are rejected instead of coercing blank tokens to Sunday
  ---
  duration_ms: 0.254167
  type: 'test'
  ...
# Subtest: invalid manually excluded dates are rejected instead of silently ignored
ok 588 - invalid manually excluded dates are rejected instead of silently ignored
  ---
  duration_ms: 0.190342
  type: 'test'
  ...
# Subtest: large ranges use bounded arithmetic and retain inclusive semantics
ok 589 - large ranges use bounded arithmetic and retain inclusive semantics
  ---
  duration_ms: 0.360424
  type: 'test'
  ...
1..589
# tests 591
# suites 0
# pass 588
# fail 3
# cancelled 0
# skipped 0
# todo 0
# duration_ms 9198.0727
/home/runner/work/figurenest/figurenest/artifacts/calcstride:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @workspace/calcstride@0.0.0 test: `tsx --test src/lib/*.test.ts`
Exit status 1

```
