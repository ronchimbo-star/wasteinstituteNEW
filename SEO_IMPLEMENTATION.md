# SEO Implementation for Waste Institute

## Overview

This project now includes comprehensive SEO optimization for search engine crawlers, with dynamic content prerendering for courses, news articles, and membership pages.

## How It Works

### 1. Dynamic Prerendering for Crawlers

**Edge Function: `netlify/edge-functions/prerender.ts`**

When a search engine crawler visits the site:
- Detects crawler user agents (Google, Bing, Facebook, Twitter, etc.)
- Fetches real-time data from Supabase
- Generates SEO-optimized HTML with proper meta tags, structured data (JSON-LD), and content
- Returns fully-rendered HTML to the crawler
- Regular users still get the fast SPA experience

Supported dynamic routes:
- `/courses/{slug}` - Course pages with structured Course schema
- `/news/{slug}` - News articles with structured Article schema
- `/membership/{slug}` - Membership levels with structured Product schema

### 2. Static Meta Tag Injection

**Edge Function: `netlify/edge-functions/seo-rewrite.ts`**

For all HTML responses:
- Injects proper title tags
- Adds meta descriptions
- Sets canonical URLs
- Includes Open Graph tags for social sharing
- Adds Twitter Card tags
- Includes JSON-LD structured data where appropriate

Static routes with custom SEO:
- Home, About, Courses, News, Resources, Contact, FAQ
- Privacy, Terms, Cookies, Accessibility pages
- All membership level pages

### 3. Build-Time Sitemap Generation

**Script: `prerender.js`**

During build:
- Connects to Supabase to fetch all published content
- Generates comprehensive sitemap.xml with:
  - All static pages
  - All published courses
  - All published news articles
  - All active membership levels
- Sets appropriate priority and change frequency for each URL type
- Saves route list for reference

## Files

```
/prerender.js                              # Build-time sitemap generator
/netlify/edge-functions/prerender.ts       # Runtime crawler detection & prerendering
/netlify/edge-functions/seo-rewrite.ts     # Meta tag injection for all pages
/dist/sitemap.xml                          # Generated sitemap (created at build)
/dist/prerendered-routes.json              # List of all routes (created at build)
```

## SEO Features

### Meta Tags
- Title tags optimized for each page
- Unique meta descriptions
- Canonical URLs
- Open Graph tags for social media
- Twitter Card tags

### Structured Data (JSON-LD)
- Organization schema on homepage
- Course schema for course pages
- Article schema for news posts
- Product schema for membership levels
- FAQ schema on FAQ page

### Crawler Optimization
- Real-time database content for crawlers
- Full HTML with H1 tags and semantic markup
- Proper heading hierarchy
- Image alt attributes
- Caching headers (1 hour) for performance

## Testing

### Test Crawler Detection
```bash
# Test as Googlebot
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://your-site.com/courses/some-course

# Should return full HTML with course content
```

### Verify Sitemap
Visit: `https://your-site.com/sitemap.xml`

Should include all pages with proper priority and change frequency.

### Verify Meta Tags
Use tools like:
- Google Search Console
- Facebook Sharing Debugger
- Twitter Card Validator
- Schema.org Validator

## Build Process

```json
{
  "build": "vite build && node prerender.js",
  "postbuild": "node prerender.js"
}
```

The build process:
1. Vite builds the React SPA
2. Prerender script connects to Supabase
3. Fetches all dynamic content (courses, news, memberships)
4. Generates sitemap.xml with all routes
5. Saves routes list to prerendered-routes.json

## Environment Variables

Required for build-time sitemap generation:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are automatically available in Netlify edge functions.

## Performance

- **For Users**: Full SPA experience, no slowdown
- **For Crawlers**: Pre-rendered HTML served with 1-hour cache
- **CDN Caching**: Edge functions cached at CDN level
- **Database Queries**: Only executed for crawler requests

## Benefits

1. **Better Search Rankings**: Crawlers see full content with proper HTML structure
2. **Social Sharing**: Rich previews on Facebook, Twitter, LinkedIn
3. **Dynamic Content**: Always fresh data from database for crawlers
4. **Fast User Experience**: No impact on SPA performance
5. **Automatic Updates**: Sitemap regenerated on every deployment
6. **Comprehensive Coverage**: All dynamic routes automatically included

## Future Enhancements

Potential improvements:
- Add robots.txt generation
- Implement breadcrumb schema
- Add video schema for course content
- Generate RSS feed for news
- Add pagination schema for listing pages
- Implement hreflang tags for internationalization
