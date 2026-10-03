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
    { path: '/', type: 'home' },
    { path: '/about', type: 'static' },
    { path: '/courses', type: 'hub' },
    { path: '/membership', type: 'hub' },
    { path: '/news', type: 'hub' },
    { path: '/events', type: 'hub' },
    { path: '/resources', type: 'static' },
    { path: '/contact', type: 'static' },
    { path: '/faq', type: 'static' },
    { path: '/verify', type: 'static' },
    { path: '/privacy', type: 'static', noindex: true },
    { path: '/terms', type: 'static', noindex: true },
    { path: '/cookies', type: 'static', noindex: true },
    { path: '/accessibility', type: 'static', noindex: true },
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
      .select('slug,title,description,seo_title,seo_description,updated_at')
      .eq('published', true)
      .is('deleted_at', null);

    if (courses) {
      courses.forEach(course => {
        routes.push({
          path: `/courses/${course.slug}`,
          lastmod: course.updated_at,
          type: 'course',
          title: course.seo_title || `${course.title} | Waste Institute`,
          description: course.seo_description || course.description || `Professional waste management course: ${course.title}.`,
          content: course.description,
        });
      });
    }

    // Fetch published news articles
    const { data: news } = await supabase
      .from('news_articles')
      .select('slug,title,excerpt,content,seo_title,seo_description,published_at,updated_at')
      .eq('published', true)
      .is('deleted_at', null);

    if (news) {
      news.forEach(article => {
        routes.push({
          path: `/news/${article.slug}`,
          lastmod: article.updated_at || article.published_at,
          type: 'news',
          title: article.seo_title || `${article.title} | Waste Institute`,
          description: article.seo_description || article.excerpt || `Waste management news and insights from Waste Institute: ${article.title}.`,
          content: article.content || article.excerpt,
        });
      });
    }

    // Fetch published membership levels
    const { data: memberships } = await supabase
      .from('membership_levels')
      .select('slug,name,description,meta_title,meta_description,updated_at')
      .eq('published', true);

    if (memberships) {
      memberships.forEach(membership => {
        routes.push({
          path: `/membership/${membership.slug}`,
          lastmod: membership.updated_at,
          type: 'membership',
          title: membership.meta_title || `${membership.name} Membership | Waste Institute`,
          description: membership.meta_description || membership.description || `Explore ${membership.name} membership at Waste Institute.`,
          content: membership.description,
        });
      });
    }

    // Fetch published events
    const { data: events } = await supabase
      .from('events')
      .select('slug,title,excerpt,description,seo_title,seo_description,updated_at,start_date')
      .eq('published', true);

    if (events) {
      events.forEach(event => {
        routes.push({
          path: `/events/${event.slug}`,
          lastmod: event.updated_at || event.start_date,
          type: 'event',
          title: event.seo_title || `${event.title} | Waste Institute`,
          description: event.seo_description || event.excerpt || event.description || `Upcoming waste management event from Waste Institute: ${event.title}.`,
          content: event.description || event.excerpt,
        });
      });
    }

    console.log(`Generated ${routes.length} routes for prerendering`);
    return routes;
  } catch (error) {
    console.error('Error fetching dynamic routes:', error);
    return routes; // Return at least static routes
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncateSeo(value, max) {
  const text = String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3).replace(/\s+\S*$/, '')}...`;
}

function routeMeta(route) {
  const staticMeta = {
    '/': { title: 'Waste Institute | Waste Management Courses & Certifications', description: 'Professional waste management courses and certifications from industry experts. Learn waste legislation, circular economy, hazardous waste handling and more.' },
    '/about': { title: 'About Us | Waste Institute', description: 'Learn about Waste Institute, our mission to provide world-class waste management education, and our industry experts.' },
    '/courses': { title: 'Browse Waste Management Courses | Waste Institute', description: 'Explore waste management courses from introductory modules to advanced professional certifications.' },
    '/membership': { title: 'Membership Levels | Waste Institute', description: 'Join the Waste Institute professional community with membership options for students and waste management professionals.' },
    '/news': { title: 'News & Articles | Waste Institute', description: 'Read the latest waste management, circular economy, sustainability, and environmental compliance news.' },
    '/events': { title: 'Waste Management Events | Waste Institute', description: 'Discover upcoming waste management events, training sessions, and professional opportunities from Waste Institute.' },
    '/resources': { title: 'Learning Resources | Waste Institute', description: 'Access free learning resources, guides, templates, and tools for waste management professionals.' },
    '/contact': { title: 'Contact Us | Waste Institute', description: 'Contact Waste Institute about courses, professional certifications, corporate training, or partnerships.' },
    '/faq': { title: 'Frequently Asked Questions | Waste Institute', description: 'Find answers about Waste Institute courses, certifications, enrolment, pricing, and corporate training.' },
    '/verify': { title: 'Verify a Waste Institute Certificate | Waste Institute', description: 'Verify the authenticity of a Waste Institute course certificate using its certificate number.' },
    '/privacy': { title: 'Privacy Policy | Waste Institute', description: 'Learn how Waste Institute collects, uses, stores, and protects personal information when you use our website and services.' },
    '/terms': { title: 'Terms of Service | Waste Institute', description: 'Read the Waste Institute terms covering accounts, courses, certificates, payments, acceptable use, and your responsibilities.' },
    '/cookies': { title: 'Cookie Policy | Waste Institute', description: 'Learn how Waste Institute uses necessary, preference, and analytics cookies to improve the website experience.' },
    '/accessibility': { title: 'Accessibility Statement | Waste Institute', description: 'Read Waste Institute’s accessibility statement and our commitment to making courses, information, and support usable by everyone.' },
  };
  const fallback = staticMeta[route.path] || { title: 'Waste Management Education | Waste Institute', description: 'Professional waste management education, courses, and resources from Waste Institute.' };
  return {
    title: truncateSeo(route.title || fallback.title, 60),
    description: truncateSeo(route.description || fallback.description, 160),
  };
}

function publicPath(path) {
  return path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
}

function routeLink(route) {
  const meta = routeMeta(route);
  return `<li><a href="${publicPath(route.path)}">${escapeHtml(meta.title.replace(/ \| Waste Institute$/, ''))}</a></li>`;
}

function pageBody(route, routes) {
  const meta = routeMeta(route);
  const childTypes = route.type === 'hub' ? ({ '/courses': ['course'], '/news': ['news'], '/membership': ['membership'], '/events': ['event'] }[route.path] || []) : [];
  const children = routes.filter((candidate) => childTypes.includes(candidate.type));
  const links = children.length ? `<section><h2>Explore Waste Institute</h2><ul>${children.map(routeLink).join('')}</ul></section>` : '';
  const legalContent = {
    '/privacy': 'This privacy policy explains what personal information Waste Institute may collect when you browse the website, create an account, enrol on a course, contact our team, or use membership services. It describes how information is used, how it is protected, when it may be shared, and the choices available to you.',
    '/terms': 'These terms explain how the Waste Institute platform and services may be used. They cover account responsibilities, course enrolment, certificates, payments, communications, intellectual property, acceptable use, and the circumstances in which access may be limited.',
    '/cookies': 'Cookies are small files stored by your browser that help Waste Institute operate the website, remember preferences, understand usage, and improve services. This policy explains the types of cookies that may be used and how you can manage them.',
    '/accessibility': 'Waste Institute is committed to making its website, courses, documents, and support services accessible to as many people as possible. We aim to use clear language, readable layouts, keyboard-friendly controls, meaningful headings, and suitable text alternatives.',
  };
  const content = route.content || legalContent[route.path] ? `<div>${escapeHtml(String(route.content || legalContent[route.path]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())}</div>` : '';
  return `<main><article><h1>${escapeHtml(meta.title.replace(/ \| Waste Institute$/, ''))}</h1><p>${escapeHtml(meta.description)}</p>${content}${links}<nav><a href="/">Home</a> | <a href="${publicPath('/courses')}">Courses</a> | <a href="${publicPath('/news')}">News</a> | <a href="${publicPath('/events')}">Events</a> | <a href="${publicPath('/membership')}">Membership</a> | <a href="${publicPath('/contact')}">Contact</a></nav></article></main>`;
}

function writePrerenderedPages(routes) {
  const template = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf8');
  routes.forEach((route) => {
    const meta = routeMeta(route);
    const canonical = `https://wasteinstitute.org${publicPath(route.path)}`;
    const html = template
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
      .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
      .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`)
      .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`)
      .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`)
      .replace(/<meta name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`)
      .replace(/<meta name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`)
      .replace(/<meta name="robots"[^>]*>\s*/gi, '')
      .replace(/<\/head>/i, `<meta name="robots" content="${route.noindex ? 'noindex, follow' : 'index, follow'}" />\n</head>`)
      .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${pageBody(route, routes)}</div>`);
    const outputPath = route.path === '/' ? join(__dirname, 'dist', 'index.html') : join(__dirname, 'dist', route.path.slice(1), 'index.html');
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html);
  });
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

  const urlEntries = routes.filter((route) => !route.noindex).map(route => {
    const r = typeof route === 'string' ? { path: route, type: 'static' } : route;
    const priority = r.path === '/' ? '1.0' :
                     r.type === 'course' ? '0.8' :
                     r.type === 'news' ? '0.7' :
                     r.type === 'hub' ? '0.7' :
                     r.type === 'event' ? '0.7' :
                     r.type === 'membership' ? '0.6' : '0.6';
    const changefreq = r.path === '/' ? 'daily' :
                       r.type === 'news' ? 'weekly' :
                       r.type === 'event' ? 'weekly' :
                       r.type === 'course' ? 'monthly' :
                       r.type === 'hub' ? 'weekly' : 'monthly';
    const lastmod = r.lastmod ? new Date(r.lastmod).toISOString() : now;

    const imageBlock = r.path === '/' ? heroImages.map(img =>
      `    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${img.title}</image:title>
    </image:image>`
    ).join('\n') : '';

    return `  <url>
    <loc>${baseUrl}${publicPath(r.path)}</loc>
    <lastmod>${lastmod}</lastmod>
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

  // Generate route-specific HTML before the SPA fallback is deployed.
  writePrerenderedPages(routes);

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
