# FigureNest analytics

FigureNest uses one analytics provider: Google Analytics 4, with measurement ID
`G-DXVBC2FNSS` defined as a source-code constant. It is disabled by default and
loads only after explicit analytics consent on `figurenest.com` or
`www.figurenest.com`, and only for public, indexable routes.

Advertising storage, ad user data, ad personalization, and analytics storage
default to denied. The custom FigureNest panel updates analytics storage only,
so it cannot grant or overwrite advertising consent. Google signals and
analytics ad-personalization signals are disabled. Preview, development,
private, error, and other noindex routes never load GA4.

The consent record expires after 180 days. Withdrawing analytics consent sends
a denied update, removes the loader, and clears accessible `_ga` cookies.

Page views use canonical URLs without query strings or fragments. The app sends
one initial page view after consent and one for each distinct canonical SPA
route. The GA tag configuration disables its automatic page view on load.

Before republishing, the GA4 web data stream must also have Enhanced
Measurement's **Page changes based on browser history events** option disabled.
Google documents that Enhanced Measurement can otherwise emit its own SPA page
views even when `send_page_view` is `false`, causing duplicates and potentially
using the browser URL instead of FigureNest's canonical URL.

Custom events are restricted in `src/lib/analytics.ts` to an allowlist of event
names and privacy-safe dimensions. Never send calculator inputs, calculated
values, search terms, form contents, email addresses, identifiers, or other
free-form visitor content.

Replit Publishing Analytics (which injects Umami) must remain disabled before
republishing. The server-rendered head also sets `umami.disabled=1` before an
injected tracker can execute as a defense in depth safeguard.

## AdSense and certified advertising consent

Public, indexable documents contain one authoritative Auto ads bootstrap for
publisher `ca-pub-8048023190382309`. It appends the official AdSense publisher
script only when `window.location.hostname` is exactly `figurenest.com` or
`www.figurenest.com`. There are no hard-coded ad units or placeholder boxes.

Before republishing, configure and publish a Google-certified European
regulations message for the site in AdSense Privacy & messaging, including
Consent Mode for advertising purposes and its revocation entry point. The
FigureNest analytics banner is intentionally independent and must never be
described as a certified advertising CMP.