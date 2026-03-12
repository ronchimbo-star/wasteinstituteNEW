import type { Context } from "https://edge.netlify.com";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')!;
const supabaseKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Detect if request is from a crawler
function isCrawler(userAgent: string): boolean {
  const crawlers = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot'
  ];

  const ua = userAgent.toLowerCase();
  return crawlers.some(crawler => ua.includes(crawler));
}

// Fetch course data from Supabase
async function getCourseData(slug: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// Fetch news article data from Supabase
async function getNewsData(slug: string) {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// Fetch membership level data from Supabase
async function getMembershipData(slug: string) {
  const { data, error } = await supabase
    .from('membership_levels')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

// Generate SEO-friendly HTML for courses
function generateCourseHTML(course: any, baseUrl: string): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Waste Institute",
      "url": baseUrl
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${course.seo_title || course.title + ' | Waste Institute'}</title>
  <meta name="description" content="${course.seo_description || course.description}">
  <link rel="canonical" href="${baseUrl}/courses/${course.slug}">
  <meta property="og:title" content="${course.seo_title || course.title}">
  <meta property="og:description" content="${course.seo_description || course.description}">
  <meta property="og:url" content="${baseUrl}/courses/${course.slug}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${course.image_url || baseUrl + '/og-image.jpg'}">
  <meta property="og:site_name" content="Waste Institute">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root">
    <article>
      <h1>${course.title}</h1>
      <p>${course.description}</p>
      ${course.syllabus ? `<section><h2>Course Syllabus</h2><div>${course.syllabus}</div></section>` : ''}
    </article>
  </div>
</body>
</html>`;
}

// Generate SEO-friendly HTML for news articles
function generateNewsHTML(article: any, baseUrl: string): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "datePublished": article.published_at,
    "author": {
      "@type": "Person",
      "name": article.author_name
    },
    "publisher": {
      "@type": "Organization",
      "name": "Waste Institute",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/white-icon.png`
      }
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.seo_title || article.title + ' | Waste Institute'}</title>
  <meta name="description" content="${article.seo_description || article.excerpt}">
  <link rel="canonical" href="${baseUrl}/news/${article.slug}">
  <meta property="og:title" content="${article.seo_title || article.title}">
  <meta property="og:description" content="${article.seo_description || article.excerpt}">
  <meta property="og:url" content="${baseUrl}/news/${article.slug}">
  <meta property="og:type" content="article">
  <meta property="og:image" content="${article.featured_image || baseUrl + '/og-image.jpg'}">
  <meta property="og:site_name" content="Waste Institute">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root">
    <article>
      <h1>${article.title}</h1>
      <p>${article.excerpt}</p>
      <div>${article.content}</div>
    </article>
  </div>
</body>
</html>`;
}

// Generate SEO-friendly HTML for membership levels
function generateMembershipHTML(membership: any, baseUrl: string): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": membership.title,
    "description": membership.description,
    "offers": {
      "@type": "Offer",
      "price": membership.annual_price,
      "priceCurrency": "GBP"
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${membership.seo_title || membership.title + ' | Waste Institute'}</title>
  <meta name="description" content="${membership.seo_description || membership.description}">
  <link rel="canonical" href="${baseUrl}/membership/${membership.slug}">
  <meta property="og:title" content="${membership.seo_title || membership.title}">
  <meta property="og:description" content="${membership.seo_description || membership.description}">
  <meta property="og:url" content="${baseUrl}/membership/${membership.slug}">
  <meta property="og:type" content="website">
  <meta property="og:image" content="${baseUrl}/og-image.jpg">
  <meta property="og:site_name" content="Waste Institute">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="module" crossorigin src="/assets/index.js"></script>
  <link rel="stylesheet" href="/assets/index.css">
</head>
<body>
  <div id="root">
    <article>
      <h1>${membership.title}</h1>
      <p>${membership.description}</p>
      ${membership.benefits ? `<section><h2>Benefits</h2><div>${membership.benefits}</div></section>` : ''}
    </article>
  </div>
</body>
</html>`;
}

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;
  const baseUrl = 'https://www.wasteinstitute.com';

  // Only prerender for crawlers
  if (!isCrawler(userAgent)) {
    return context.next();
  }

  // Skip static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt'];
  if (staticExtensions.some(ext => pathname.endsWith(ext))) {
    return context.next();
  }

  try {
    // Handle course detail pages
    if (pathname.startsWith('/courses/') && pathname !== '/courses/') {
      const slug = pathname.replace('/courses/', '').replace('/', '');
      const course = await getCourseData(slug);

      if (course) {
        const html = generateCourseHTML(course, baseUrl);
        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=3600, s-maxage=3600',
            'x-prerendered': 'true'
          }
        });
      }
    }

    // Handle news article pages
    if (pathname.startsWith('/news/') && pathname !== '/news/') {
      const slug = pathname.replace('/news/', '').replace('/', '');
      const article = await getNewsData(slug);

      if (article) {
        const html = generateNewsHTML(article, baseUrl);
        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=3600, s-maxage=3600',
            'x-prerendered': 'true'
          }
        });
      }
    }

    // Handle membership detail pages
    if (pathname.startsWith('/membership/') && pathname !== '/membership/') {
      const slug = pathname.replace('/membership/', '').replace('/', '');
      const membership = await getMembershipData(slug);

      if (membership) {
        const html = generateMembershipHTML(membership, baseUrl);
        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'public, max-age=3600, s-maxage=3600',
            'x-prerendered': 'true'
          }
        });
      }
    }
  } catch (error) {
    console.error('Prerender error:', error);
  }

  // Fall back to normal rendering
  return context.next();
};

export const config = { path: "/*" };
