#!/usr/bin/env node
// Generates llms-full.txt from live database content
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load .env manually (dotenv not installed)
const envFile = fs.readFileSync('.env', 'utf-8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) {
    process.env[match[1].trim()] = match[2].trim();
  }
}

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) { console.error('Missing Supabase credentials'); process.exit(1); }

const supabase = createClient(url, key);
const BASE = 'https://wasteinstitute.org';

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function main() {
  const { data: courses } = await supabase
    .from('courses')
    .select('slug,title,description,target_audience,level,duration,seo_description,syllabus')
    .eq('published', true)
    .is('deleted_at', null)
    .order('title');

  const { data: articles } = await supabase
    .from('news_articles')
    .select('slug,title,excerpt,content,published_at,seo_description')
    .eq('published', true)
    .order('published_at', { ascending: false });

  let out = `# Waste Institute — Full Content for AI Systems

> Empowering sustainable waste management through education and innovation.

This file contains the full text content of Waste Institute's courses and news articles, provided in Markdown format for AI systems, search crawlers, and language models. Content is current as of the generation date.

Website: ${BASE}
Contact: info@wasteinstitute.org | +44 1322 879087 | 82 James Carter Rd, Mildenhall, Bury Saint Edmunds, IP28 7DE, UK

---

`;

  // Courses
  out += `# COURSES\n\n`;
  for (const c of courses || []) {
    out += `## ${c.title}\n\n`;
    out += `URL: ${BASE}/courses/${c.slug}\n\n`;
    if (c.seo_description) out += `Description: ${c.seo_description}\n\n`;
    if (c.description) out += `${c.description}\n\n`;
    if (c.level) out += `Level: ${c.level}\n`;
    if (c.duration) out += `Duration: ${c.duration}\n`;
    if (c.target_audience) out += `Target audience: ${c.target_audience}\n`;
    out += `\n`;
    if (c.syllabus && c.syllabus.modules) {
      out += `### Syllabus\n\n`;
      for (const m of c.syllabus.modules) {
        out += `#### ${m.title}\n`;
        if (m.topics) {
          for (const t of m.topics) out += `- ${t}\n`;
        }
        out += `\n`;
      }
    }
    out += `---\n\n`;
  }

  // Articles
  out += `# NEWS ARTICLES\n\n`;
  for (const a of articles || []) {
    out += `## ${a.title}\n\n`;
    out += `URL: ${BASE}/news/${a.slug}\n\n`;
    if (a.published_at) out += `Published: ${new Date(a.published_at).toLocaleDateString('en-GB')}\n\n`;
    if (a.seo_description) out += `Summary: ${a.seo_description}\n\n`;
    const fullText = stripHtml(a.content);
    if (fullText) out += `${fullText}\n\n`;
    out += `---\n\n`;
  }

  // Write to public/llms-full.txt
  const fs = require('fs');
  fs.writeFileSync('public/llms-full.txt', out, 'utf-8');
  console.log(`Generated llms-full.txt: ${out.length} bytes, ${courses?.length || 0} courses, ${articles?.length || 0} articles`);
}

main().catch(e => { console.error(e); process.exit(1); });
