# Waste Institute SEO and Rendering Snapshot

**Snapshot date:** 3 October 2026
**Status:** Protected baseline

This document is the reference standard for all future SEO, routing, rendering, sitemap, and published-content changes. Do not alter these settings as part of unrelated work. Any intentional change requires explicit approval and a new dated snapshot.

## Rendering architecture

- Vite builds the React application into `dist/`.
- The build runs `prerender.js` after the Vite bundle is created.
- `prerender.js` generates route-specific HTML files under `dist/` for public hubs, courses, news, memberships, events, verification, and legal pages.
- Each generated page keeps the application JavaScript so normal visitors still receive the interactive React experience.
- Generated public URLs use trailing slashes because production redirects non-slash URLs to slash URLs.
- The Netlify edge function remains a crawler fallback, but build-time route HTML is the primary rendering guarantee.
- The SPA fallback must remain last and must not override existing generated route files.
- The competing `seo-rewrite` edge function is not enabled in `netlify.toml`.

## Canonical URL policy

- The production URL format is `https://wasteinstitute.org/<path>/`.
- The homepage is the only canonical URL without a path slash: `https://wasteinstitute.org/`.
- Canonical tags, Open Graph URLs, JSON-LD URLs, sitemap locations, prerendered links, and navigation links must use the final trailing-slash URL.
- Sitemap URLs must return HTTP 200 directly and must never require a redirect.
- Legacy URLs may redirect only to the final trailing-slash URL.

## Page requirements

Every indexable public page must have:

- One meaningful, visible H1 in the initial HTML response.
- A unique title no longer than 60 characters.
- A unique meta description no longer than 160 characters and long enough to describe the page meaningfully.
- A self-referencing canonical URL matching the final production URL exactly.
- `index, follow` robots instructions.
- At least one relevant internal link to a hub, related content, or a contact/conversion page.
- Useful page copy in the initial HTML, not only after JavaScript runs.
- Open Graph and Twitter title, description, and URL values matching the page.
- Valid JSON-LD where the content type supports it.

Legal and account pages may be rendered for users but must use `noindex, follow` when they are not intended as search landing pages. Noindex pages must not be included in the sitemap.

## Published content requirements

New courses, news articles, memberships, and events must include:

- A stable lowercase hyphenated slug.
- A descriptive page title and H1.
- An SEO title within the 60-character limit or a source value that can be safely truncated.
- An SEO description within the 160-character limit or a source value that can be safely truncated.
- A meaningful body, excerpt, or course description that is present in prerendered HTML.
- Links to the relevant hub and at least one related useful page.
- A featured image or appropriate fallback image where the content type supports it.
- Published status and valid data before the route is added to the sitemap.

Do not publish placeholder titles, empty descriptions, duplicate metadata, or routes that only contain the application shell.

## Sitemap and redirect requirements

- Generate the sitemap from the same published route collection used to generate prerendered pages.
- Exclude noindex, private, admin, authentication, and unpublished routes.
- Confirm every sitemap URL returns HTTP 200 without a redirect.
- Keep legacy redirects targeted and direct; avoid redirect chains.
- Preserve explicit redirects for known legacy certificate and article URLs unless the destination is intentionally changed.

## Required verification before declaring changes complete

1. Run the production build successfully.
2. Inspect generated HTML for the homepage, a hub, one course, one news article, one membership page, one event, and a legal page.
3. Confirm generated HTML contains the expected title, description, canonical, robots directive, H1, body copy, and internal links.
4. Check the production URLs directly with the AhrefsSiteAudit user agent and with redirects disabled.
5. Check both slash and non-slash forms; the slash form must be HTTP 200 and the non-slash behavior must be understood.
6. Fetch the production sitemap and confirm its URLs use trailing slashes and do not redirect.
7. Confirm legacy URLs redirect once to the final canonical URL.
8. Do not call the work fixed if production still serves an older build or if only local generated files pass.

## Protected files and settings

Treat these as part of the baseline:

- `prerender.js`
- `netlify.toml`
- `netlify/edge-functions/prerender.ts`
- `vite.config.ts`
- `public/sitemap.xml`
- `public/_redirects`
- `.bolt/SEO_RENDERING_SNAPSHOT.md`
- `.bolt/skills/seo-rendering-baseline/SKILL.md`

If one of these must change, update this snapshot only after verifying the new behavior in production.
