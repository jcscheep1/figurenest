# Take-Home Pay Calculator — production audit closure

Date: 2026-09-08
Route: `/calculators/salary-work/take-home-pay`
Status: ✅ AUDITED
GitHub Actions run: `34279636065`

Production browser verification passed:

- Default `2500` gross / `22%` entered tax / `100` deductions -> `$1,850.00`.
- True-zero boundary `0 / 0 / 0` -> `$0.00` and remains valid.
- `100%` entered tax with zero deductions -> `$0.00`.
- Deductions exceeding after-tax gross are rejected rather than returning a negative take-home value.
- Blank required gross pay is rejected and the input is exposed as `aria-invalid=true`.
- No unsupported Basic/Advanced switch is rendered for this focused calculator.
- Canonical URL and JSON-LD are present.
- Related-tool internal links are rendered.
- Production page exposes 755 visible words including formula/method, limitations and FAQ content.
- At a 390px viewport there is no horizontal overflow and the result remains visible.

Source contract confirmed before the live run:

`Net pay = gross pay − gross pay × entered tax rate − entered deductions`.

Required numeric Phase Four inputs reject blank, non-finite and out-of-range values before calculation. The page renderer supplies associated field IDs, error/result announcements, copy/reset behavior, methodology, limitations, FAQ, sources when available and related-tool links.

No production defect was reproduced, so no calculator formula/UI repair was required. Treat this calculator as closed unless new regression evidence appears.
