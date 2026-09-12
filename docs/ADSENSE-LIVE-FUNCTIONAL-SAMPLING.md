# AdSense live desktop/mobile functional sampling

Status: **release gate — do not resubmit AdSense until completed and the full live rendered audit is green.**

Base production commit when this lane started: `3b2dc770c24cbd45e36df35e93fdfcef457bef85`.

## Purpose

This lane complements the rendered-content audit with real interaction QA. It is not a substitute for full automated validation and it does not lower the site-wide content thresholds. Each sampled route must be checked at both a narrow mobile viewport and a desktop viewport, then representative findings must be expanded across the affected shared family before AdSense resubmission.

## Required checks for every sample

- Page loads without console-visible or user-visible fatal errors.
- H1, intro/guidance, result area and related links are readable without horizontal clipping or overlapping controls.
- Keyboard focus is visible and primary controls can be reached and operated.
- Numeric/text inputs accept valid values, reject invalid/cleared required values honestly, and update the result without stale output.
- Selects, toggles, copy/share/reset/download actions remain usable on touch-sized mobile controls and desktop.
- Canonical URL, page title, meta description and JSON-LD remain present in the rendered page.
- Internal links to category, methodology/trust and related tools resolve to the intended canonical route.
- Cookie/privacy controls do not cover the primary action permanently or make the page unusable.

## File Tool contract checks

Every sampled File Tool must additionally verify:

- The public tool is wrapped by `.file-tool-page`.
- Shared `file-tool-buttons.css` styling is active.
- Enabled upload/convert/download/reset actions are visibly blue with contrasting text.
- Disabled actions are visibly grey; destructive actions remain red.
- The browser-native file-picker button is visible and usable at mobile and desktop widths.
- Selecting, processing, resetting and removing a supported local file does not create a file-content upload request.
- Privacy copy does not overclaim beyond the tested local-processing behavior.

## First representative sampling tranche

| Surface | Route | Mobile | Desktop | Functional focus |
| --- | --- | --- | --- | --- |
| Home | `/` | pending | pending | navigation, category discovery, trust/footer links |
| All tools directory | `/calculators/` | pending | pending | search, sorting/filtering, category links, editorial guidance |
| Money & Finance | `/category/finance/` | pending | pending | rich category content, related guides, finance tool discovery |
| Salary & Work | `/calculators/salary-work/salary/` | pending | pending | currency selector, schedule inputs, result updates |
| Home & Construction | `/calculators/construction/brick/` | pending | pending | metric/imperial controls, multi-input layout, result breakdown |
| Math & Statistics | `/calculators/math/circle/` | pending | pending | select + numeric input, result breakdown, methodology |
| Date & Time | `/calculators/date-time/age/` | pending | pending | date inputs, reset, responsive result and FAQ |
| Converter | `/converters/temperature/` | pending | pending | from/to selectors, numeric conversion, reset action |
| File Tools category | `/category/file-tools/` | pending | pending | category guidance and File Tool discovery |
| Image Converter | `/file-tools/image-converter/` | pending | pending | native picker, blue action-button contract, local conversion/reset |
| About | `/about/` | pending | pending | strengthened operator/trust/corrections content |
| Terms | `/terms/` | pending | pending | strengthened use/file-tool/availability content |
| Disclaimer | `/disclaimer/` | pending | pending | strengthened domain/fidelity/current-data limitations |
| Methodology | `/methodology/` | pending | pending | accuracy methodology and internal trust links |

## Expansion rule

A failure on a shared calculator family, shared form/control component, category template, trust template, or File Tool action system blocks AdSense readiness for the whole affected family. Fix the shared source, rerun repository validation and rendered-site audit, then repeat the representative mobile/desktop sample. Do not mark only the sampled URL as fixed when the same component is reused elsewhere.

## Exit criteria

This lane can be marked complete only when:

1. the representative matrix is green on mobile and desktop;
2. any shared-component defect discovered by sampling is repaired and regression-protected;
3. File Tool button/file-picker/local-processing behavior is green on both viewports;
4. the rendered AdSense audit remains green across the complete public sitemap;
5. production canonical/meta/schema/sitemap/catalog/category parity is reconfirmed; and
6. no unfinished, duplicate, placeholder or genuinely thin public route remains eligible for indexing.

AdSense review must remain on hold until these criteria and the broader site-wide content programme are complete.
