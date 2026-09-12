# AdSense rendered-site audit phase

Status: **IN PROGRESS — DO NOT RESUBMIT ADSENSE**

This phase follows the merged static baseline. It audits every canonical URL in the generated sitemap against the actual prerendered HTML, not only source-file patterns.

The gate checks build coverage, unique titles/descriptions/canonicals, sitemap/noindex consistency, one main landmark and H1, minimum useful main-content thresholds, placeholder language, and JSON-LD coverage for category and tool routes. Its JSON artifact is the repair queue for subsequent batches.

Passing this automated gate is necessary but not sufficient for AdSense resubmission. Desktop/mobile visual and functional sampling, trust-page editorial review, duplicate-intent review and a final live production audit remain mandatory.
