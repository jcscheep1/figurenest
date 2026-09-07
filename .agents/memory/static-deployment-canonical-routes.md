---
name: Static deployment canonical routes
description: Canonical URL and moved-route constraints for Replit static deployments
---

Use trailing slashes for canonical directory routes on Replit static deployments. Static rewrite rules preserve the visible URL and cannot emit a `Location` response; that header is reserved.

**Why:** A generated static site can make links, canonicals, and sitemap entries internally consistent while still relying on the host's directory redirect behavior. Legacy moved URLs need an explicit fallback rather than being mistaken for an HTTP redirect. Replit does not automatically redirect between an apex custom domain and its `www` hostname.

**How to apply:** Keep directory-route links and SEO URLs trailing-slash consistent. For an old moved path, use a noindex page canonicalized to the destination with a hydration-safe browser redirect and no-JavaScript fallback, or switch to a dynamic server when a true custom HTTP redirect is mandatory. For apex/`www` canonicalization, add both custom domains and their Replit-provided DNS records, then configure the permanent redirect at the DNS provider.