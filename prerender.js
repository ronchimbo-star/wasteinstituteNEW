import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file if it exists
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const envPath = join(__dirname, '.env');
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });
    supabaseUrl = envVars.VITE_SUPABASE_URL;
    supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Missing Supabase credentials. Generating sitemap with static routes only.');
  supabaseUrl = 'https://placeholder.supabase.co';
  supabaseKey = 'placeholder';
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all dynamic routes from database
async function getDynamicRoutes() {
  const routes = [
    // Static routes
    '/',
    '/about',
    '/courses',
    '/membership',
    '/news',
    '/resources',
    '/contact',
    '/faq',
    '/verify-certificate',
    '/privacy',
    '/terms',
    '/cookies',
    '/accessibility',
  ];

  // Skip database queries if using placeholder credentials
  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.log(`Generated ${routes.length} static routes (database unavailable)`);
    return routes;
  }

  try {
    // Fetch published courses
    const { data: courses } = await supabase
      .from('courses')
      .select('slug')
      .eq('published', true);

    if (courses) {
      courses.forEach(course => {
        routes.push(`/courses/${course.slug}`);
      });
    }

    // Fetch published news articles
    const { data: news } = await supabase
      .from('news')
      .select('slug')
      .eq('published', true);

    if (news) {
      news.forEach(article => {
        routes.push(`/news/${article.slug}`);
      });
    }

    // Fetch published membership levels
    const { data: memberships } = await supabase
      .from('membership_levels')
      .select('slug')
      .eq('active', true);

    if (memberships) {
      memberships.forEach(membership => {
        routes.push(`/membership/${membership.slug}`);
      });
    }

    console.log(`Generated ${routes.length} routes for prerendering`);
    return routes;
  } catch (error) {
    console.error('Error fetching dynamic routes:', error);
    return routes; // Return at least static routes
  }
}

// Generate sitemap
async function generateSitemap(routes) {
  const baseUrl = 'https://www.wasteinstitute.com';
  const now = new Date().toISOString();

  const urlEntries = routes.map(route => {
    const priority = route === '/' ? '1.0' :
                     route.startsWith('/courses/') || route.startsWith('/news/') ? '0.8' : '0.6';
    const changefreq = route === '/' ? 'daily' :
                       route.startsWith('/news/') ? 'weekly' : 'monthly';

    return `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  writeFileSync(join(__dirname, 'dist', 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully');
}

// Main prerender function
async function prerender() {
  console.log('Starting prerender process...');

  const routes = await getDynamicRoutes();

  // Generate sitemap
  await generateSitemap(routes);

  // Save routes list for edge function
  const routesFile = join(__dirname, 'dist', 'prerendered-routes.json');
  writeFileSync(routesFile, JSON.stringify(routes, null, 2));

  console.log(`Prerender complete. ${routes.length} routes prepared.`);
  console.log('Routes list saved to dist/prerendered-routes.json');
}

prerender().catch(error => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
