# FigureNest AdSense low-value-content release gate

**DO NOT RESUBMIT ADSENSE** until the dedicated live readiness audit passes.

This is a site-wide quality programme, not a metadata-only SEO patch. The purpose is to make every indexable FigureNest destination useful on its own and to remove weak public surfaces before another AdSense review.

## Required exit criteria

- Every public calculator/tool works on desktop and mobile and has a useful, non-thin visible explanation of its purpose and inputs/outputs.
- Where relevant, pages explain methodology/formulas, assumptions, examples and limitations in original FigureNest language.
- Every public tool has useful FAQs and related internal links that strengthen topical clusters rather than creating orphan pages.
- Category and directory destinations contain meaningful guidance and context, not just link grids.
- About, methodology/accuracy, privacy, terms, disclaimer/cookies and other trust surfaces are complete, consistent and easy to reach.
- Unfinished, duplicate, placeholder or genuinely thin public routes are removed, merged or noindexed.
- Canonical URL, title/meta description, breadcrumb/WebApplication/FAQ schema where applicable, catalog/category membership and sitemap exposure agree for each indexable tool.
- File Tools continue to satisfy the shared `.file-tool-page` and `file-tool-buttons.css` UI contract on desktop and mobile, including native file-picker controls.
- A final live crawl/readiness audit verifies rendered content, functionality, mobile/desktop behaviour, canonical/meta/schema/sitemap parity and internal linking with no release-blocking findings.

## Delivery order

1. Establish a repeatable baseline detector and inventory weak surfaces.
2. Repair the highest-impact site-wide templates, trust/category/directory surfaces and shared content patterns first.
3. Work through public tool clusters, prioritising thin pages, weak topical clusters and tools with missing methodology/examples/FAQs/limitations.
4. Remove/merge/noindex pages that cannot justify an indexable standalone destination.
5. Run a full production audit only after remediation has been merged and deployed.
6. Remove this hold only when that live audit passes. AdSense resubmission is outside the release gate until then.

## Expansion hold

Traffic Expansion work may remain in draft branches, but no new Traffic Expansion publication should leapfrog this gate unless it is a necessary quality/security repair. The green but unpublished Loan Amortization work in PR #139 is therefore paused behind this programme.
