---
name: PWA cache boundary
description: Safety rule for offline caching around public and private FigureNest traffic.
---

The service worker may intercept and cache only explicitly known public navigations and static app assets. Authentication pages, private/control surfaces, APIs, and unknown future routes must remain network-owned and bypass Cache Storage entirely. Successful public responses marked `private` or `no-store` must also remain uncached.

**Why:** Broad same-origin GET caching can persist authenticated or private responses, later exposing stale private content or breaking sign-in state. An explicit public allowlist fails safely when new route families are added.

**How to apply:** When adding public route families or install assets, extend the public allowlist deliberately. When adding private or API route families, keep them outside the allowlist and add a regression case confirming the worker does not intercept them.