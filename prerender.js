import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync, readFileSync, existsSync, cpSync } from 'fs';
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
    '/events',
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
      .from('news_articles')
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

    // Fetch published events
    const { data: events } = await supabase
      .from('events')
      .select('slug')
      .eq('published', true);

    if (events) {
      events.forEach(event => {
        routes.push(`/events/${event.slug}`);
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
  const baseUrl = 'https://wasteinstitute.org';
  const now = new Date().toISOString();

  const heroImages = [
    { url: `${baseUrl}/wasteinstitute-hero1.jpg`, title: 'Waste Institute Hero 1' },
    { url: `${baseUrl}/wasteinstitute-hero2.jpg`, title: 'Waste Institute Hero 2' },
    { url: `${baseUrl}/wasteinstitute-hero3.jpg`, title: 'Waste Institute Hero 3' },
    { url: `${baseUrl}/wasteinstitute-hero4.jpg`, title: 'Waste Institute Hero 4' },
  ];

  const urlEntries = routes.map(route => {
    const priority = route === '/' ? '1.0' :
                     route.startsWith('/courses/') || route.startsWith('/news/') || route.startsWith('/events/') ? '0.8' :
                     ['/courses', '/news', '/events', '/membership', '/about'].includes(route) ? '0.7' : '0.6';
    const changefreq = route === '/' ? 'daily' :
                       route.startsWith('/news/') || route.startsWith('/events/') ? 'weekly' : 'monthly';

    const imageBlock = route === '/' ? heroImages.map(img =>
      `    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${img.title}</image:title>
    </image:image>`
    ).join('\n') : '';

    return `  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageBlock ? '\n' + imageBlock : ''}
  </url>`;
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}
</urlset>`;

  writeFileSync(join(__dirname, 'dist', 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully');
}

// Copy learn directory to dist
function copyLearnFiles() {
  const learnSource = join(__dirname, 'public', 'learn');
  const learnDest = join(__dirname, 'dist', 'learn');

  try {
    if (existsSync(learnSource)) {
      cpSync(learnSource, learnDest, { recursive: true });
      console.log('Learn files copied to dist/');
    }
  } catch (error) {
    console.warn('Warning: Could not copy learn files:', error.message);
  }
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

  // Copy learn files
  copyLearnFiles();

  console.log(`Prerender complete. ${routes.length} routes prepared.`);
  console.log('Routes list saved to dist/prerendered-routes.json');
}

prerender().catch(error => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
