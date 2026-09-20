import type { Context } from "https://edge.netlify.com";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const BASE_URL = "https://wasteinstitute.org";

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const url = Deno.env.get("VITE_SUPABASE_URL");
    const key = Deno.env.get("VITE_SUPABASE_ANON_KEY");
    if (!url || !key) throw new Error("Missing Supabase credentials");
    supabase = createClient(url, key);
  }
  return supabase;
}

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const crawlers = [
    "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
    "yandexbot", "facebookexternalhit", "twitterbot", "linkedinbot",
    "whatsapp", "telegrambot", "applebot", "petalbot", "seznambot",
    "bytespider", "googleother", "crawler",
    "spider", "bot/", "indexer", "archive.org",
    // AI crawlers — explicitly served prerendered HTML
    "gptbot", "chatgpt-user", "oai-searchbot", "oai-search",
    "claudebot", "claude-web", "anthropic-ai", "anthropic",
    "perplexitybot", "perplexity",
    "google-extended", "ccbot",
    "applebot-extended", "amazonbot",
  ];
  return crawlers.some((c) => ua.includes(c));
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.substring(0, max - 3) + "...";
}

function navLinks(): string {
  return `<nav style="display:flex;flex-wrap:wrap;gap:1rem;padding:1rem 0;font-family:sans-serif">
<a href="${BASE_URL}/">Home</a>
<a href="${BASE_URL}/courses">Courses</a>
<a href="${BASE_URL}/news">News</a>
<a href="${BASE_URL}/events">Events</a>
<a href="${BASE_URL}/membership">Membership</a>
<a href="${BASE_URL}/resources">Resources</a>
<a href="${BASE_URL}/about">About</a>
<a href="${BASE_URL}/contact">Contact</a>
<a href="${BASE_URL}/faq">FAQ</a>
</nav>`;
}

function pageShell(
  title: string,
  description: string,
  canonical: string,
  bodyHtml: string,
  jsonLd: object[],
  ogType = "website",
  ogImage?: string
): string {
  const img = ogImage || `${BASE_URL}/og-image.jpg`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:type" content="${esc(ogType)}">
<meta property="og:image" content="${esc(img)}">
<meta property="og:site_name" content="Waste Institute">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(img)}">
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${jsonLd.map((d) => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join("\n")}
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:0 auto;padding:1.5rem;line-height:1.6;color:#1f2937">
${navLinks()}
<div id="root">
${bodyHtml}
</div>
</body>
</html>`;
}

// --- Data fetchers ---

async function getCourseWithModules(slug: string) {
  const client = getSupabaseClient();
  const { data: course } = await client
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!course) return null;

  const { data: modules } = await client
    .from("modules")
    .select("id,title,description,display_order")
    .eq("course_id", course.id)
    .order("display_order");

  const moduleIds = (modules || []).map((m: any) => m.id);
  let lessonsByModule: Record<string, any[]> = {};
  if (moduleIds.length > 0) {
    const { data: lessons } = await client
      .from("lessons")
      .select("module_id,title,duration,display_order")
      .in("module_id", moduleIds)
      .order("display_order");
    (lessons || []).forEach((l: any) => {
      if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
      lessonsByModule[l.module_id].push(l);
    });
  }

  let sectorName = "";
  if (course.sector_id) {
    const { data: sector } = await client
      .from("sectors")
      .select("name")
      .eq("id", course.sector_id)
      .maybeSingle();
    if (sector) sectorName = sector.name;
  }

  let prereqTitles: string[] = [];
  if (course.prerequisites && course.prerequisites.length > 0) {
    const { data: prereqs } = await client
      .from("courses")
      .select("title,slug")
      .in("id", course.prerequisites);
    prereqTitles = (prereqs || []).map((p: any) => p.title);
  }

  return { course, modules: modules || [], lessonsByModule, sectorName, prereqTitles };
}

async function getNewsArticle(slug: string) {
  const client = getSupabaseClient();
  const { data } = await client
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}

async function getEvent(slug: string) {
  const client = getSupabaseClient();
  const { data } = await client
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

async function getMembershipLevel(slug: string) {
  const client = getSupabaseClient();
  const { data } = await client
    .from("membership_levels")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

async function getCourseList() {
  const client = getSupabaseClient();
  const { data } = await client
    .from("courses")
    .select("id,title,slug,description,level,duration,price,featured_image,sector_id")
    .eq("published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return data || [];
}

async function getNewsList() {
  const client = getSupabaseClient();
  const { data } = await client
    .from("news_articles")
    .select("id,title,slug,excerpt,featured_image,published_at")
    .eq("published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(20);
  return data || [];
}

async function getEventList() {
  const client = getSupabaseClient();
  const { data } = await client
    .from("events")
    .select("id,title,slug,excerpt,event_type,start_date,end_date,location,is_online,price")
    .eq("published", true)
    .order("start_date", { ascending: true });
  return data || [];
}

async function getMembershipList() {
  const client = getSupabaseClient();
  const { data } = await client
    .from("membership_levels")
    .select("slug,name,description,annual_fee,monthly_fee")
    .eq("published", true)
    .order("display_order");
  return data || [];
}

async function getSectors() {
  const client = getSupabaseClient();
  const { data } = await client
    .from("sectors")
    .select("id,name,slug,description,icon")
    .order("display_order");
  return data || [];
}

// --- HTML generators ---

function renderCoursePage(data: any): string {
  const { course, modules, lessonsByModule, sectorName, prereqTitles } = data;
  const title = course.seo_title || `${course.title} | Waste Institute`;
  const desc = course.seo_description || truncate(stripHtml(course.description), 160);
  const canonical = `${BASE_URL}/courses/${course.slug}`;

  const moduleHtml = modules
    .map((m: any, i: number) => {
      const lessons = lessonsByModule[m.id] || [];
      const lessonHtml = lessons
        .map(
          (l: any, li: number) =>
            `<li>${esc(li + 1)}. ${esc(l.title)}${l.duration ? ` (${esc(l.duration)} min)` : ""}</li>`
        )
        .join("");
      return `<section><h2>Module ${i + 1}: ${esc(m.title)}</h2>${m.description ? `<p>${esc(m.description)}</p>` : ""}${lessonHtml ? `<ul>${lessonHtml}</ul>` : ""}</section>`;
    })
    .join("");

  const prereqHtml = prereqTitles.length
    ? `<section><h2>Prerequisites</h2><p>This course requires completion of: ${prereqTitles.map(esc).join(", ")}</p></section>`
    : "";

  const body = `<article>
<h1>${esc(course.title)}</h1>
<p><strong>Level:</strong> ${esc(course.level)} | <strong>Duration:</strong> ${esc(course.duration || "Self-paced")} | <strong>Price:</strong> ${course.price > 0 ? `£${course.price}` : "Free"}${sectorName ? ` | <strong>Sector:</strong> ${esc(sectorName)}` : ""}</p>
<p>${esc(course.description)}</p>
${course.target_audience ? `<p><strong>Target audience:</strong> ${esc(course.target_audience)}</p>` : ""}
${prereqHtml}
<section><h2>Course Content</h2>${moduleHtml || "<p>Modules coming soon.</p>"}</section>
<nav style="margin-top:2rem"><a href="${BASE_URL}/courses">← Back to all courses</a> | <a href="${BASE_URL}/membership">View membership options</a> | <a href="${BASE_URL}/contact">Contact us about this course</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: desc,
      provider: { "@type": "Organization", name: "Waste Institute", url: BASE_URL },
      courseMode: "online",
      url: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Courses", item: `${BASE_URL}/courses` },
        { "@type": "ListItem", position: 3, name: course.title, item: canonical },
      ],
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd, "website", course.featured_image || undefined);
}

function renderNewsPage(article: any): string {
  const title = article.seo_title || `${article.title} | Waste Institute`;
  const desc = article.seo_description || truncate(stripHtml(article.excerpt || article.content), 160);
  const canonical = `${BASE_URL}/news/${article.slug}`;
  const cleanContent = stripHtml(article.content);

  const body = `<article>
<h1>${esc(article.title)}</h1>
<p><strong>Published:</strong> ${article.published_at ? new Date(article.published_at).toLocaleDateString("en-GB") : ""}</p>
${article.excerpt ? `<p><em>${esc(article.excerpt)}</em></p>` : ""}
<div>${cleanContent}</div>
<nav style="margin-top:2rem"><a href="${BASE_URL}/news">← Back to all articles</a> | <a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/membership">Membership</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: desc,
      datePublished: article.published_at,
      author: { "@type": "Organization", name: "Waste Institute" },
      publisher: {
        "@type": "Organization",
        name: "Waste Institute",
        logo: { "@type": "ImageObject", url: `${BASE_URL}/white-icon.png` },
      },
      mainEntityOfPage: canonical,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "News", item: `${BASE_URL}/news` },
        { "@type": "ListItem", position: 3, name: article.title, item: canonical },
      ],
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd, "article", article.featured_image || undefined);
}

function renderEventPage(event: any): string {
  const title = event.seo_title || `${event.title} | Waste Institute`;
  const desc = event.seo_description || truncate(stripHtml(event.excerpt || event.description), 160);
  const canonical = `${BASE_URL}/events/${event.slug}`;
  const startDate = new Date(event.start_date).toLocaleString("en-GB");

  const body = `<article>
<h1>${esc(event.title)}</h1>
<p><strong>Date:</strong> ${esc(startDate)}${event.end_date ? ` to ${esc(new Date(event.end_date).toLocaleString("en-GB"))}` : ""}</p>
<p><strong>Type:</strong> ${esc(event.event_type)} | <strong>Location:</strong> ${event.is_online ? "Online" : esc(event.location || "TBC")} | <strong>Price:</strong> ${event.price > 0 ? `£${event.price}` : "Free"}</p>
${event.excerpt ? `<p><em>${esc(event.excerpt)}</em></p>` : ""}
<div>${stripHtml(event.description)}</div>
<nav style="margin-top:2rem"><a href="${BASE_URL}/events">← Back to all events</a> | <a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/contact">Contact us</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: desc,
      startDate: event.start_date,
      ...(event.end_date ? { endDate: event.end_date } : {}),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: event.is_online
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location: event.is_online
        ? { "@type": "VirtualLocation", url: event.online_link || BASE_URL }
        : { "@type": "Place", name: event.location, address: event.address },
      organizer: { "@type": "Organization", name: event.organiser_name, url: BASE_URL },
      offers: {
        "@type": "Offer",
        price: event.price.toString(),
        priceCurrency: event.currency,
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Events", item: `${BASE_URL}/events` },
        { "@type": "ListItem", position: 3, name: event.title, item: canonical },
      ],
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd, "website", event.featured_image || undefined);
}

function renderMembershipPage(m: any): string {
  const title = m.meta_title || `${m.name} Membership | Waste Institute`;
  const desc = m.meta_description || truncate(stripHtml(m.description), 160);
  const canonical = `${BASE_URL}/membership/${m.slug}`;

  const benefits = m.benefits ? stripHtml(m.benefits) : "";
  const body = `<article>
<h1>${esc(m.name)} Membership</h1>
<p><strong>Price:</strong> ${m.annual_fee ? `£${m.annual_fee}/year` : "Free"}</p>
<p>${esc(m.description)}</p>
${benefits ? `<section><h2>Benefits</h2><div>${benefits}</div></section>` : ""}
<nav style="margin-top:2rem"><a href="${BASE_URL}/membership">← All membership levels</a> | <a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/contact">Contact us</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${m.name} Membership`,
      description: desc,
      offers: { "@type": "Offer", price: (m.annual_fee || 0).toString(), priceCurrency: "GBP" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Membership", item: `${BASE_URL}/membership` },
        { "@type": "ListItem", position: 3, name: `${m.name} Membership`, item: canonical },
      ],
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd);
}

function renderCourseListPage(courses: any[], sectors: any[]): string {
  const title = "Browse Waste Management Courses | Waste Institute";
  const desc = "Explore our full catalogue of waste management courses. From introductory modules to advanced certifications, learn from leading industry professionals.";
  const canonical = `${BASE_URL}/courses`;

  const sectorLinks = sectors
    .map((s) => `<a href="${BASE_URL}/courses?sector=${esc(s.slug)}">${esc(s.name)}</a>`)
    .join(" | ");

  const courseLinks = courses
    .map(
      (c) =>
        `<article><h2><a href="${BASE_URL}/courses/${esc(c.slug)}">${esc(c.title)}</a></h2><p>${esc(truncate(stripHtml(c.description), 200))}</p><p><strong>Level:</strong> ${esc(c.level)} | <strong>Duration:</strong> ${esc(c.duration || "Self-paced")} | <strong>Price:</strong> ${c.price > 0 ? `£${c.price}` : "Free"}</p></article>`
    )
    .join("");

  const body = `<article>
<h1>Course Catalog</h1>
<p>Explore our comprehensive collection of waste management courses designed by industry experts.</p>
${sectorLinks ? `<nav style="margin:1rem 0">${sectorLinks}</nav>` : ""}
${courseLinks || "<p>No courses available yet.</p>"}
<nav style="margin-top:2rem"><a href="${BASE_URL}/membership">View membership options</a> | <a href="${BASE_URL}/news">Read latest news</a> | <a href="${BASE_URL}/contact">Contact us</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Waste Management Courses",
      itemListElement: courses.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
        url: `${BASE_URL}/courses/${c.slug}`,
      })),
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd);
}

function renderNewsListPage(articles: any[]): string {
  const title = "News & Articles | Waste Institute";
  const desc = "Latest news, research and articles on waste management, circular economy, sustainability and environmental compliance from Waste Institute.";
  const canonical = `${BASE_URL}/news`;

  const articleLinks = articles
    .map(
      (a) =>
        `<article><h2><a href="${BASE_URL}/news/${esc(a.slug)}">${esc(a.title)}</a></h2><p>${esc(truncate(stripHtml(a.excerpt), 200))}</p><p><small>${a.published_at ? new Date(a.published_at).toLocaleDateString("en-GB") : ""}</small></p></article>`
    )
    .join("");

  const body = `<article>
<h1>News & Articles</h1>
<p>Stay updated with the latest insights, trends, and innovations in waste management and circular economy.</p>
${articleLinks || "<p>No articles published yet.</p>"}
<nav style="margin-top:2rem"><a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/events">Upcoming events</a> | <a href="${BASE_URL}/membership">Membership</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Waste Institute News",
      itemListElement: articles.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
        url: `${BASE_URL}/news/${a.slug}`,
      })),
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd);
}

function renderEventListPage(events: any[]): string {
  const title = "Events & Webinars | Waste Institute";
  const desc = "Attend Waste Institute workshops, webinars, conferences, and networking events. Connect with waste management professionals and expand your expertise.";
  const canonical = `${BASE_URL}/events`;

  const eventLinks = events
    .map(
      (e) =>
        `<article><h2><a href="${BASE_URL}/events/${esc(e.slug)}">${esc(e.title)}</a></h2><p>${esc(truncate(stripHtml(e.excerpt), 200))}</p><p><small>${new Date(e.start_date).toLocaleString("en-GB")} | ${e.is_online ? "Online" : esc(e.location || "TBC")} | ${e.price > 0 ? `£${e.price}` : "Free"}</small></p></article>`
    )
    .join("");

  const body = `<article>
<h1>Events & Webinars</h1>
<p>Connect with industry experts, learn new skills, and grow your professional network.</p>
${eventLinks || "<p>No events scheduled yet. Check back soon!</p>"}
<nav style="margin-top:2rem"><a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/membership">Membership</a> | <a href="${BASE_URL}/contact">Contact us</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Waste Institute Events",
      itemListElement: events.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.title,
        url: `${BASE_URL}/events/${e.slug}`,
      })),
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd);
}

function renderMembershipListPage(levels: any[]): string {
  const title = "Membership Levels | Waste Institute";
  const desc = "Join the Waste Institute professional community. Choose from Student, Affiliate, Associate, Technical, Chartered, or Fellowship membership.";
  const canonical = `${BASE_URL}/membership`;

  const levelLinks = levels
    .map(
      (m) =>
        `<article><h2><a href="${BASE_URL}/membership/${esc(m.slug)}">${esc(m.name)} Membership</a></h2><p>${esc(truncate(stripHtml(m.description), 200))}</p><p><strong>Price:</strong> ${m.annual_fee ? `£${m.annual_fee}/year` : "Free"}</p></article>`
    )
    .join("");

  const body = `<article>
<h1>Membership Levels</h1>
<p>Join the Waste Institute professional community and advance your career in waste management.</p>
${levelLinks || "<p>Membership levels coming soon.</p>"}
<nav style="margin-top:2rem"><a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/news">Latest news</a> | <a href="${BASE_URL}/contact">Contact us</a></nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Waste Institute Membership Levels",
      itemListElement: levels.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${m.name} Membership`,
        url: `${BASE_URL}/membership/${m.slug}`,
      })),
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd);
}

function renderHomePage(): string {
  const title = "Waste Institute | Waste Management Courses & Certifications";
  const desc = "Professional waste management courses and certifications from industry experts. Learn waste legislation, circular economy, hazardous waste handling and more.";
  const canonical = `${BASE_URL}/`;

  const body = `<article>
<h1>Start Learning With Leading Waste Management Experts Today</h1>
<p>Professional training and certification programs designed by industry experts. Learn waste legislation, circular economy, hazardous waste handling, and more.</p>
<nav style="margin:1.5rem 0;display:flex;flex-wrap:wrap;gap:1rem">
<a href="${BASE_URL}/courses" style="font-weight:bold">Explore Courses</a>
<a href="${BASE_URL}/membership">View Membership</a>
<a href="${BASE_URL}/news">Latest News</a>
<a href="${BASE_URL}/events">Upcoming Events</a>
<a href="${BASE_URL}/resources">Resources</a>
<a href="${BASE_URL}/about">About Us</a>
<a href="${BASE_URL}/contact">Contact</a>
<a href="${BASE_URL}/faq">FAQ</a>
</nav>
</article>`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Waste Institute",
      url: BASE_URL,
      description: desc,
      email: "info@wasteinstitute.org",
      telephone: "+441322879087",
      address: {
        "@type": "PostalAddress",
        streetAddress: "82 James Carter Rd",
        addressLocality: "Mildenhall, Bury Saint Edmunds",
        postalCode: "IP28 7DE",
        addressCountry: "GB",
      },
    },
  ];

  return pageShell(title, desc, canonical, body, jsonLd);
}

function renderStaticPage(pathname: string): string {
  const meta: Record<string, { title: string; desc: string; h1: string; body: string }> = {
    "/about": {
      title: "About Us | Waste Institute",
      desc: "Learn about Waste Institute, our mission to provide world-class waste management education, and meet our team of industry experts.",
      h1: "About Waste Institute",
      body: "We provide world-class waste management education, professional certifications, and industry-leading training programs. Our mission is to advance the waste management profession through accessible, expert-led education.",
    },
    "/contact": {
      title: "Contact Us | Waste Institute",
      desc: "Get in touch with the Waste Institute team. Enquire about courses, certifications, corporate training or partnership opportunities.",
      h1: "Contact Waste Institute",
      body: "Get in touch with our team about courses, certifications, corporate training, or partnership opportunities. Email: info@wasteinstitute.org | Phone: +44 1322 879087 | Address: 82 James Carter Rd, Mildenhall, Bury Saint Edmunds, IP28 7DE, UK",
    },
    "/faq": {
      title: "Frequently Asked Questions | Waste Institute",
      desc: "Find answers to common questions about Waste Institute courses, certifications, enrolment, pricing and corporate training programmes.",
      h1: "Frequently Asked Questions",
      body: "Find answers to common questions about our courses, certifications, enrolment process, pricing, and corporate training programmes. Browse our course catalog or contact us for more specific questions.",
    },
    "/resources": {
      title: "Learning Resources | Waste Institute",
      desc: "Free learning resources, guides and tools for waste management professionals. Download templates, checklists and reference materials.",
      h1: "Learning Resources",
      body: "Access free learning resources, guides, templates, and tools for waste management professionals. Browse our course catalog for structured learning paths and professional certifications.",
    },
    "/terms": {
      title: "Terms of Service | Waste Institute",
      desc: "Terms of service for Waste Institute platform.",
      h1: "Terms of Service",
      body: "The terms and conditions governing use of the Waste Institute platform and services.",
    },
    "/privacy": {
      title: "Privacy Policy | Waste Institute",
      desc: "Privacy policy for Waste Institute platform.",
      h1: "Privacy Policy",
      body: "How Waste Institute collects, uses, and protects your personal data.",
    },
    "/cookies": {
      title: "Cookie Policy | Waste Institute",
      desc: "Cookie policy for Waste Institute platform.",
      h1: "Cookie Policy",
      body: "How Waste Institute uses cookies to improve your browsing experience.",
    },
    "/accessibility": {
      title: "Accessibility Statement | Waste Institute",
      desc: "Accessibility statement for Waste Institute platform.",
      h1: "Accessibility Statement",
      body: "Our commitment to making Waste Institute accessible to all users, including those with disabilities.",
    },
  };

  const m = meta[pathname];
  if (!m) return renderHomePage();

  const body = `<article>
<h1>${esc(m.h1)}</h1>
<p>${esc(m.body)}</p>
<nav style="margin-top:2rem"><a href="${BASE_URL}/">← Back to home</a> | <a href="${BASE_URL}/courses">Explore courses</a> | <a href="${BASE_URL}/contact">Contact us</a></nav>
</article>`;

  return pageShell(m.title, m.desc, `${BASE_URL}${pathname}`, body, []);
}

// --- Main handler ---

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get("user-agent") || "";
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";

  if (!isCrawler(userAgent)) return context.next();

  const staticExts = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".json", ".xml", ".txt", ".webp", ".avif"];
  if (staticExts.some((ext) => pathname.endsWith(ext))) return context.next();

  const adminPaths = ["/admin", "/login", "/signup", "/dashboard", "/my-payments", "/verify"];
  if (adminPaths.some((p) => pathname.startsWith(p))) return context.next();

  try {
    // Course detail
    if (pathname.startsWith("/courses/") && pathname !== "/courses") {
      const slug = pathname.replace("/courses/", "");
      const data = await getCourseWithModules(slug);
      if (data) {
        const html = renderCoursePage(data);
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
        });
      }
    }

    // News article
    if (pathname.startsWith("/news/") && pathname !== "/news") {
      const slug = pathname.replace("/news/", "");
      const article = await getNewsArticle(slug);
      if (article) {
        const html = renderNewsPage(article);
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
        });
      }
    }

    // Event detail
    if (pathname.startsWith("/events/") && pathname !== "/events") {
      const slug = pathname.replace("/events/", "");
      const event = await getEvent(slug);
      if (event) {
        const html = renderEventPage(event);
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
        });
      }
    }

    // Membership detail
    if (pathname.startsWith("/membership/") && pathname !== "/membership") {
      const slug = pathname.replace("/membership/", "");
      const level = await getMembershipLevel(slug);
      if (level) {
        const html = renderMembershipPage(level);
        return new Response(html, {
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
        });
      }
    }

    // List pages
    if (pathname === "/courses") {
      const [courses, sectors] = await Promise.all([getCourseList(), getSectors()]);
      return new Response(renderCourseListPage(courses, sectors), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
      });
    }

    if (pathname === "/news") {
      const articles = await getNewsList();
      return new Response(renderNewsListPage(articles), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
      });
    }

    if (pathname === "/events") {
      const events = await getEventList();
      return new Response(renderEventListPage(events), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
      });
    }

    if (pathname === "/membership") {
      const levels = await getMembershipList();
      return new Response(renderMembershipListPage(levels), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
      });
    }

    if (pathname === "/") {
      return new Response(renderHomePage(), {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
      });
    }

    // Static pages
    const staticPage = renderStaticPage(pathname);
    if (staticPage) {
      return new Response(staticPage, {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=3600", "x-prerendered": "true" },
      });
    }
  } catch (error) {
    console.error("Prerender error:", error);
  }

  return context.next();
};

export const config = { path: "/*" };
