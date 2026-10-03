---
name: seo-rendering-baseline
description: Preserve the Waste Institute SEO and rendering baseline whenever building, changing, or publishing pages, courses, news, memberships, events, routes, metadata, sitemaps, redirects, or prerendering. Use this skill before any SEO, content-generation, routing, Netlify, or rendering change so future work cannot silently reintroduce the audited failures.
---

# Waste Institute SEO and Rendering Baseline

Use `.bolt/SEO_RENDERING_SNAPSHOT.md` as the authoritative project baseline. Treat it as protected: do not change the rendering architecture, URL format, metadata rules, sitemap behavior, or verification process during unrelated work.

## Required rules

- Keep build-time route HTML generation as the primary rendering path. Every public sitemap route must have route-specific initial HTML with a meaningful H1, body copy, metadata, and internal links.
- Keep the React application scripts in generated HTML so prerendered pages remain interactive for normal visitors.
- Keep the Netlify edge prerender as a fallback, not the only rendering mechanism.
- Use trailing-slash production URLs everywhere except the homepage. Canonicals, sitemap locations, JSON-LD URLs, Open Graph URLs, navigation links, and generated content links must match the final URL exactly.
- Keep the SPA fallback after static files and generated route files. It must not replace an existing prerendered page.
- Keep the competing SEO rewrite function disabled unless a verified replacement is explicitly approved.
- Limit titles to 60 characters and descriptions to 160 characters. Do not hide empty or duplicate metadata behind generic defaults when meaningful source content exists.
- Give every indexable page one H1, useful initial HTML content, and at least one relevant internal link.
- Keep legal, authentication, dashboard, admin, unpublished, and other non-landing pages out of the sitemap. Use `noindex, follow` where appropriate.
- Generate the sitemap from the same published route collection used by prerendering. Never add a URL that redirects, is unpublished, is missing, or has a different canonical URL.
- Preserve direct, single-hop redirects for known legacy URLs.

## Content generation

Before publishing a course, news article, membership, or event, require a stable slug, page title, H1, concise SEO title, concise SEO description, meaningful body or excerpt, a relevant image or fallback, and links to its hub and related useful pages. Do not generate placeholder content or publish a route that depends on JavaScript to expose its core text.

## Verification gate

Before declaring any related change complete:

1. Run the production build.
2. Inspect generated HTML for the homepage, a hub, a course, a news article, a membership page, an event, and a legal page.
3. Confirm each sample has the expected title, description, canonical, robots directive, H1, body copy, and links.
4. Check the production URLs directly with the AhrefsSiteAudit user agent, both with redirects disabled and after following redirects.
5. Confirm the trailing-slash production URL returns HTTP 200 directly.
6. Confirm every sitemap URL returns HTTP 200 without a redirect and uses the same trailing-slash canonical.
7. Confirm legacy URLs redirect once to the final URL.
8. If production still serves an older build, report the deployment blocker and do not claim the audit is fixed.

If a proposed change conflicts with this baseline, stop and ask for explicit approval before changing it, then update the dated snapshot only after the new behavior has passed production checks.
