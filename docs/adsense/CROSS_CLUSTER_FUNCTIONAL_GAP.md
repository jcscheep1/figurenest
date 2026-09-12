# AdSense cross-cluster functional gate

Status: **release blocking / DO NOT RESUBMIT**

Reconciled against production `main` `35f6a90a173ba93d6a221d9c598ba3bf34ab6134` on 2026-09-12.

## Why this gate remains open

The existing `scripts/adsense-live-functional-sampling.mjs` browser matrix covers home, directory, finance, salary/work, construction, math, date/time, temperature conversion, the File Tools category, Image Converter, and trust pages at desktop 1440px and mobile 390px widths.

It does not yet exercise all of the representative clusters required by the final AdSense readiness programme. In particular, the current matrix has no functional Health calculator, no functional Electrical/Science calculator, and no PDF Sign & Edit route check.

Public production editorial sampling shows the Health and Electrical category pages are substantive content destinations rather than thin link lists, so this is a functional/mobile QA coverage gap rather than a category-content failure.

## Required matrix expansion

Before this gate can pass, the browser suite must cover at minimum:

- one Health calculator such as BMR or BMI;
- one Electrical or Science calculator such as Ohm's Law or Density;
- `/file-tools/pdf-sign-edit/` in addition to the existing Image Converter sample.

For representative calculators verify:

- exactly one visible H1 inside one main landmark;
- correct canonical, title/meta and JSON-LD;
- substantial visible route-specific guidance;
- no horizontal overflow at 390px mobile width;
- a focusable required input;
- a trusted input change causes the displayed result to change;
- reset is present and keyboard-operable where the shared calculator contract requires it;
- no browser runtime exceptions.

For PDF Sign & Edit verify the mandatory File Tool contract:

- page renders inside `.file-tool-page`;
- native file picker is visible and has usable contrast;
- normal/upload/convert/download/reset enabled actions use the shared FigureNest blue action system with contrasting text;
- disabled actions are clearly grey;
- destructive actions remain red;
- mobile action targets are at least 44px high;
- no horizontal overflow at 390px;
- local-processing/privacy behavior remains intact.

## Duplicate-intent follow-up

After functional sampling passes, explicitly review close Health intents before the final live audit, especially:

- Adult BMI & Reference Weight Range Calculator vs BMI Screening Calculator.

Keep both indexable only if the user intent, visible guidance and result behavior are materially distinct. Otherwise merge, canonicalize, noindex or remove the weaker route with evidence.

## Exit condition

This gate closes only after the expanded exact-head browser suite passes on desktop and mobile and any discovered defects are repaired. The final full live AdSense-readiness audit must still pass afterward. Passing this gate alone is not permission to resubmit AdSense.
