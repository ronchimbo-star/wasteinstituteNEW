import type { Context } from "https://edge.netlify.com";

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogType: string;
  ogImage?: string;
  ogSiteName?: string;
  jsonLd?: Record<string, any>;
}

function getMembershipLevelMeta(slug: string, baseUrl: string): PageMeta {
  const membershipLevels: Record<string, PageMeta> = {
    'student': {
      title: 'Student Membership - Free for Full-Time Students | Waste Institute',
      description: 'Join as a Student member for free access to waste management resources, 20% course discounts, and career development support. For students enrolled in related full-time courses.',
      canonical: `${baseUrl}/membership/student`,
      ogTitle: 'Student Membership - Free for Full-Time Students | Waste Institute',
      ogDescription: 'Join as a Student member for free access to waste management resources, 20% course discounts, and career development support.',
      ogUrl: `${baseUrl}/membership/student`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    'affiliate': {
      title: 'Affiliate Membership - Entry Level Professional Membership | Waste Institute',
      description: 'Start your professional journey with Affiliate membership at £97/year. Perfect for those new to waste management with no formal qualifications required. Get 10% course discounts.',
      canonical: `${baseUrl}/membership/affiliate`,
      ogTitle: 'Affiliate Membership - Entry Level Professional Membership | Waste Institute',
      ogDescription: 'Start your professional journey with Affiliate membership at £97/year. Perfect for those new to waste management.',
      ogUrl: `${baseUrl}/membership/affiliate`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    'associate': {
      title: 'Associate Membership (AssocIW) - Professional Recognition | Waste Institute',
      description: 'Gain the prestigious AssocIW designation with Associate membership. For professionals with 2+ years experience or Level 3 qualifications. £147/year with 15% course discounts.',
      canonical: `${baseUrl}/membership/associate`,
      ogTitle: 'Associate Membership (AssocIW) - Professional Recognition | Waste Institute',
      ogDescription: 'Gain the prestigious AssocIW designation with Associate membership. For professionals with 2+ years experience.',
      ogUrl: `${baseUrl}/membership/associate`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    'technical': {
      title: 'Technical Membership (TechIW) - Specialist Recognition | Waste Institute',
      description: 'Join as a Technical member (TechIW) for advanced resources and expert support. For operational specialists and managers with Level 4+ qualifications. £197/year, 25% course discounts.',
      canonical: `${baseUrl}/membership/technical`,
      ogTitle: 'Technical Membership (TechIW) - Specialist Recognition | Waste Institute',
      ogDescription: 'Join as a Technical member (TechIW) for advanced resources and expert support. For operational specialists and managers.',
      ogUrl: `${baseUrl}/membership/technical`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    'chartered': {
      title: 'Chartered Membership (CIWM) - Industry Leader Recognition | Waste Institute',
      description: 'Achieve Chartered status (CIWM) as an industry leader. For senior professionals with 5+ years management experience and certification. £297/year with exclusive benefits.',
      canonical: `${baseUrl}/membership/chartered`,
      ogTitle: 'Chartered Membership (CIWM) - Industry Leader Recognition | Waste Institute',
      ogDescription: 'Achieve Chartered status (CIWM) as an industry leader. For senior professionals with 5+ years management experience.',
      ogUrl: `${baseUrl}/membership/chartered`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    'fellow': {
      title: 'Fellow Membership (FIWM) - Highest Honor | Waste Institute',
      description: 'The pinnacle of professional recognition. Fellowship (FIWM) is awarded to outstanding professionals who have made exceptional contributions to waste management. Invitation-only.',
      canonical: `${baseUrl}/membership/fellow`,
      ogTitle: 'Fellow Membership (FIWM) - Highest Honor | Waste Institute',
      ogDescription: 'The pinnacle of professional recognition. Fellowship (FIWM) is awarded to outstanding professionals. Invitation-only.',
      ogUrl: `${baseUrl}/membership/fellow`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    }
  };

  if (membershipLevels[slug]) {
    return membershipLevels[slug];
  }

  // Fallback for unknown membership levels
  return {
    title: 'Membership Level | Waste Institute',
    description: 'Learn more about this professional membership level at Waste Institute.',
    canonical: `${baseUrl}/membership/${slug}`,
    ogTitle: 'Membership Level | Waste Institute',
    ogDescription: 'Learn more about this professional membership level at Waste Institute.',
    ogUrl: `${baseUrl}/membership/${slug}`,
    ogType: 'website',
    ogImage: `${baseUrl}/og-image.jpg`,
    ogSiteName: 'Waste Institute'
  };
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static assets
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt'];
  const staticPaths = ['/_next/', '/assets/', '/dist/'];

  if (
    staticExtensions.some(ext => pathname.endsWith(ext)) ||
    staticPaths.some(path => pathname.startsWith(path))
  ) {
    return context.next();
  }

  // Get the original response
  const response = await context.next();

  // Only process HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('text/html')) {
    return response;
  }

  // Get page metadata based on pathname
  const pageMeta = getPageMeta(pathname);

  // Read the HTML
  let html = await response.text();

  // Replace or inject meta tags
  html = injectMetaTags(html, pageMeta);

  // Return modified HTML
  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

function getPageMeta(pathname: string): PageMeta {
  const baseUrl = 'https://wasteinstitute.org';

  // Normalize pathname
  const path = pathname.endsWith('/') && pathname !== '/'
    ? pathname.slice(0, -1)
    : pathname;

  // Handle dynamic membership level routes
  if (path.startsWith('/membership/')) {
    const slug = path.replace('/membership/', '');
    return getMembershipLevelMeta(slug, baseUrl);
  }

  // Route-specific metadata
  const routes: Record<string, PageMeta> = {
    '/': {
      title: 'Waste Institute | Waste Management Courses & Certifications',
      description: 'Professional waste management courses and certifications from industry experts. Learn waste legislation, circular economy, hazardous waste handling and more.',
      canonical: `${baseUrl}/`,
      ogTitle: 'Waste Institute | Waste Management Courses & Certifications',
      ogDescription: 'Professional waste management courses and certifications from industry experts. Learn waste legislation, circular economy, hazardous waste handling and more.',
      ogUrl: `${baseUrl}/`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Waste Institute",
        "url": baseUrl,
        "logo": `${baseUrl}/white-icon.png`,
        "description": "Professional waste management courses and certifications from industry experts."
      }
    },
    '/courses': {
      title: 'Browse Waste Management Courses | Waste Institute',
      description: 'Explore our full catalogue of waste management courses. From introductory modules to advanced certifications, learn from leading industry professionals.',
      canonical: `${baseUrl}/courses`,
      ogTitle: 'Browse Waste Management Courses | Waste Institute',
      ogDescription: 'Explore our full catalogue of waste management courses. From introductory modules to advanced certifications, learn from leading industry professionals.',
      ogUrl: `${baseUrl}/courses`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Waste Management Courses",
        "description": "Professional waste management courses and certifications"
      }
    },
    '/contact': {
      title: 'Contact Us | Waste Institute',
      description: 'Get in touch with the Waste Institute team. Enquire about courses, certifications, corporate training or partnership opportunities.',
      canonical: `${baseUrl}/contact`,
      ogTitle: 'Contact Us | Waste Institute',
      ogDescription: 'Get in touch with the Waste Institute team. Enquire about courses, certifications, corporate training or partnership opportunities.',
      ogUrl: `${baseUrl}/contact`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    '/news': {
      title: 'News & Articles | Waste Institute',
      description: 'Latest news, research and articles on waste management, circular economy, sustainability and environmental compliance from Waste Institute.',
      canonical: `${baseUrl}/news`,
      ogTitle: 'News & Articles | Waste Institute',
      ogDescription: 'Latest news, research and articles on waste management, circular economy, sustainability and environmental compliance from Waste Institute.',
      ogUrl: `${baseUrl}/news`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    '/resources': {
      title: 'Learning Resources | Waste Institute',
      description: 'Free learning resources, guides and tools for waste management professionals. Download templates, checklists and reference materials.',
      canonical: `${baseUrl}/resources`,
      ogTitle: 'Learning Resources | Waste Institute',
      ogDescription: 'Free learning resources, guides and tools for waste management professionals. Download templates, checklists and reference materials.',
      ogUrl: `${baseUrl}/resources`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    '/faq': {
      title: 'Frequently Asked Questions | Waste Institute',
      description: 'Find answers to common questions about Waste Institute courses, certifications, enrolment, pricing and corporate training programmes.',
      canonical: `${baseUrl}/faq`,
      ogTitle: 'Frequently Asked Questions | Waste Institute',
      ogDescription: 'Find answers to common questions about Waste Institute courses, certifications, enrolment, pricing and corporate training programmes.',
      ogUrl: `${baseUrl}/faq`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "name": "Waste Institute FAQ"
      }
    },
    '/about': {
      title: 'About Us | Waste Institute',
      description: 'Learn about Waste Institute, our mission to provide world-class waste management education, and meet our team of industry experts.',
      canonical: `${baseUrl}/about`,
      ogTitle: 'About Us | Waste Institute',
      ogDescription: 'Learn about Waste Institute, our mission to provide world-class waste management education, and meet our team of industry experts.',
      ogUrl: `${baseUrl}/about`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    '/membership': {
      title: 'Membership Levels | Waste Institute',
      description: 'Join the Waste Institute professional community. Choose from Student, Affiliate, Associate, Technical, Chartered, or Fellowship membership.',
      canonical: `${baseUrl}/membership`,
      ogTitle: 'Membership Levels | Waste Institute',
      ogDescription: 'Join the Waste Institute professional community. Choose from Student, Affiliate, Associate, Technical, Chartered, or Fellowship membership.',
      ogUrl: `${baseUrl}/membership`,
      ogType: 'website',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute'
    },
    '/news/waste-to-energy-efficiency-breakthrough': {
      title: 'Breakthrough in Waste-to-Energy: New Process Increases Efficiency 40% | Waste Institute',
      description: 'Researchers announce a revolutionary gasification process that dramatically increases energy recovery from municipal solid waste while reducing emissions.',
      canonical: `${baseUrl}/news/waste-to-energy-efficiency-breakthrough`,
      ogTitle: 'Breakthrough in Waste-to-Energy: New Process Increases Efficiency 40% | Waste Institute',
      ogDescription: 'Researchers announce a revolutionary gasification process that dramatically increases energy recovery from municipal solid waste while reducing emissions.',
      ogUrl: `${baseUrl}/news/waste-to-energy-efficiency-breakthrough`,
      ogType: 'article',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Breakthrough in Waste-to-Energy: New Process Increases Efficiency 40%",
        "datePublished": "2026-02-24",
        "author": {
          "@type": "Organization",
          "name": "Waste Institute"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Waste Institute",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/white-icon.png`
          }
        }
      }
    },
    '/news/circular-economy-city-success-story': {
      title: 'Circular Economy Success Story: City Achieves 75% Waste Diversion | Waste Institute',
      description: 'Portland becomes the first major U.S. city to divert 75% of its waste from landfills through comprehensive circular economy initiatives.',
      canonical: `${baseUrl}/news/circular-economy-city-success-story`,
      ogTitle: 'Circular Economy Success Story: City Achieves 75% Waste Diversion | Waste Institute',
      ogDescription: 'Portland becomes the first major U.S. city to divert 75% of its waste from landfills through comprehensive circular economy initiatives.',
      ogUrl: `${baseUrl}/news/circular-economy-city-success-story`,
      ogType: 'article',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Circular Economy Success Story: City Achieves 75% Waste Diversion",
        "datePublished": "2026-02-23",
        "author": {
          "@type": "Organization",
          "name": "Waste Institute"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Waste Institute",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/white-icon.png`
          }
        }
      }
    },
    '/news/leadership-multi-generational-teams': {
      title: 'Leadership Strategies for Managing Multi-Generational Waste Teams | Waste Institute',
      description: 'As the waste management workforce spans from baby boomers to Gen Z, leaders must adapt their management styles to maximize team effectiveness and retention.',
      canonical: `${baseUrl}/news/leadership-multi-generational-teams`,
      ogTitle: 'Leadership Strategies for Managing Multi-Generational Waste Teams | Waste Institute',
      ogDescription: 'As the waste management workforce spans from baby boomers to Gen Z, leaders must adapt their management styles to maximize team effectiveness and retention.',
      ogUrl: `${baseUrl}/news/leadership-multi-generational-teams`,
      ogType: 'article',
      ogImage: `${baseUrl}/og-image.jpg`,
      ogSiteName: 'Waste Institute',
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Leadership Strategies for Managing Multi-Generational Waste Teams",
        "datePublished": "2026-02-22",
        "author": {
          "@type": "Organization",
          "name": "Waste Institute"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Waste Institute",
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/white-icon.png`
          }
        }
      }
    }
  };

  // Return specific route metadata or default
  if (routes[path]) {
    return routes[path];
  }

  // Default fallback
  return {
    title: 'Waste Institute | Waste Management Courses & Certifications',
    description: 'Professional waste management courses and certifications from industry experts.',
    canonical: `${baseUrl}${path}`,
    ogTitle: 'Waste Institute | Waste Management Courses & Certifications',
    ogDescription: 'Professional waste management courses and certifications from industry experts.',
    ogUrl: `${baseUrl}${path}`,
    ogType: 'website',
    ogImage: `${baseUrl}/og-image.jpg`,
    ogSiteName: 'Waste Institute'
  };
}

function injectMetaTags(html: string, meta: PageMeta): string {
  // Replace title
  if (html.includes('<title>')) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);
  } else {
    html = html.replace(/<head>/i, `<head>\n    <title>${meta.title}</title>`);
  }

  // Build meta tags to inject
  const metaTags = `
    <meta name="description" content="${meta.description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${meta.canonical}">

    <meta property="og:title" content="${meta.ogTitle}">
    <meta property="og:description" content="${meta.ogDescription}">
    <meta property="og:url" content="${meta.ogUrl}">
    <meta property="og:type" content="${meta.ogType}">
    ${meta.ogImage ? `<meta property="og:image" content="${meta.ogImage}">` : ''}
    ${meta.ogSiteName ? `<meta property="og:site_name" content="${meta.ogSiteName}">` : ''}

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.ogTitle}">
    <meta name="twitter:description" content="${meta.ogDescription}">
    ${meta.ogImage ? `<meta name="twitter:image" content="${meta.ogImage}">` : ''}
    ${meta.jsonLd ? `\n    <script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>` : ''}
  `;

  // Remove existing meta tags that we're replacing
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="robots"[^>]*>/gi, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<script\s+type="application\/ld\+json">.*?<\/script>/gis, '');

  // Inject new meta tags after <head>
  html = html.replace(/<head>/i, `<head>${metaTags}`);

  return html;
}
