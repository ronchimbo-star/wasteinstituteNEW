import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Search, FileText, Download, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';

interface SEOSetting {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
  og_image: string;
}

export const AdminSEO = () => {
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'sitemap' | 'robots'>('settings');
  const [sitemapContent, setSitemapContent] = useState('');
  const [robotsContent, setRobotsContent] = useState('');
  const [generatingSitemap, setGeneratingSitemap] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSitemapAndRobots();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .order('page', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSitemapAndRobots = async () => {
    try {
      const [sitemapRes, robotsRes] = await Promise.all([
        fetch('/sitemap.xml'),
        fetch('/robots.txt')
      ]);

      if (sitemapRes.ok) {
        setSitemapContent(await sitemapRes.text());
      }
      if (robotsRes.ok) {
        setRobotsContent(await robotsRes.text());
      }
    } catch (error) {
      console.error('Error loading sitemap/robots:', error);
    }
  };

  const generateDynamicSitemap = async () => {
    setGeneratingSitemap(true);
    try {
      const [coursesRes, articlesRes, membershipsRes] = await Promise.all([
        supabase.from('courses').select('slug, updated_at').eq('published', true),
        supabase.from('news_articles').select('slug, published_at').eq('published', true),
        supabase.from('membership_levels').select('slug, updated_at').eq('is_active', true)
      ]);

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://wasteinstitute.org/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/courses</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/news</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/membership</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/resources</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://wasteinstitute.org/faq</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;

      if (coursesRes.data) {
        coursesRes.data.forEach(course => {
          sitemap += `  <url>
    <loc>https://wasteinstitute.org/courses/${course.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    ${course.updated_at ? `<lastmod>${new Date(course.updated_at).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>
`;
        });
      }

      if (articlesRes.data) {
        articlesRes.data.forEach(article => {
          sitemap += `  <url>
    <loc>https://wasteinstitute.org/news/${article.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    ${article.published_at ? `<lastmod>${new Date(article.published_at).toISOString().split('T')[0]}</lastmod>` : ''}
  </url>
`;
        });
      }

      if (membershipsRes.data) {
        membershipsRes.data.forEach(membership => {
          sitemap += `  <url>
    <loc>https://wasteinstitute.org/membership/${membership.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        });
      }

      sitemap += `</urlset>`;

      setSitemapContent(sitemap);
      alert('Sitemap generated successfully! Copy the content and update your sitemap.xml file.');
    } catch (error) {
      console.error('Error generating sitemap:', error);
      alert('Failed to generate sitemap');
    } finally {
      setGeneratingSitemap(false);
    }
  };

  const copySitemapToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sitemapContent);
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2000);
    } catch (error) {
      console.error('Failed to copy sitemap:', error);
    }
  };

  const copyRobotsToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(robotsContent);
      setCopiedRobots(true);
      setTimeout(() => setCopiedRobots(false), 2000);
    } catch (error) {
      console.error('Failed to copy robots:', error);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadRobots = () => {
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateSetting = async (id: string, updatedData: Partial<SEOSetting>) => {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from('seo_settings')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      setSettings(settings.map((s) => (s.id === id ? { ...s, ...updatedData } : s)));
      alert('SEO settings updated successfully');
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      alert('Failed to update SEO settings');
    } finally {
      setSavingId(null);
    }
  };

  const handleChange = (id: string, field: keyof SEOSetting, value: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Search className="text-emerald-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">SEO Management</h1>
            <p className="text-gray-600 mt-2">Manage search engine optimization, sitemap, and robots.txt</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Page Settings
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'sitemap'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sitemap.xml
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'robots'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Robots.txt
          </button>
        </div>
      </div>

      {activeTab === 'settings' && (
        settings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No SEO settings found</h3>
            <p className="text-gray-600">SEO settings will be created automatically</p>
          </div>
        ) : (
          <div className="space-y-6">
            {settings.map((setting) => (
              <div key={setting.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {setting.page.replace(/_/g, ' ')}
                  </h2>
                  <button
                    onClick={() => updateSetting(setting.id, {
                      title: setting.title,
                      description: setting.description,
                      keywords: setting.keywords,
                      og_image: setting.og_image,
                    })}
                    disabled={savingId === setting.id}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {savingId === setting.id ? 'Saving...' : 'Update'}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={setting.title}
                      onChange={(e) => handleChange(setting.id, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={setting.description}
                      onChange={(e) => handleChange(setting.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="SEO description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={setting.keywords}
                      onChange={(e) => handleChange(setting.id, 'keywords', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      value={setting.og_image}
                      onChange={(e) => handleChange(setting.id, 'og_image', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'sitemap' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sitemap.xml</h2>
              <p className="text-gray-600 mt-1">Generate and manage your sitemap for search engines</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateDynamicSitemap}
                disabled={generatingSitemap}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={generatingSitemap ? 'animate-spin' : ''} />
                {generatingSitemap ? 'Generating...' : 'Regenerate'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="flex gap-2">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={18} />
                View Live Sitemap
              </a>
              <button
                onClick={copySitemapToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copiedSitemap ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copiedSitemap ? 'Copied!' : 'Copy Content'}
              </button>
              <button
                onClick={downloadSitemap}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Current Sitemap Content:</span>
              <span className="text-xs text-gray-500">
                {sitemapContent.split('<url>').length - 1} URLs
              </span>
            </div>
            <pre className="text-xs text-gray-700 overflow-x-auto max-h-96 overflow-y-auto bg-white p-4 rounded border border-gray-200">
              {sitemapContent || 'No sitemap content loaded'}
            </pre>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Click "Regenerate" to create an updated sitemap with all current content</li>
              <li>Copy the content or download the file</li>
              <li>Replace the existing /public/sitemap.xml file with the new content</li>
              <li>Rebuild and deploy your application</li>
              <li>Submit the sitemap URL to Google Search Console: https://wasteinstitute.org/sitemap.xml</li>
            </ol>
          </div>
        </div>
      )}

      {activeTab === 'robots' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Robots.txt</h2>
              <p className="text-gray-600 mt-1">Control how search engines crawl your site</p>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="flex gap-2">
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={18} />
                View Live Robots.txt
              </a>
              <button
                onClick={copyRobotsToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copiedRobots ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copiedRobots ? 'Copied!' : 'Copy Content'}
              </button>
              <button
                onClick={downloadRobots}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download size={18} />
                Download
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Current Robots.txt Content:</span>
            </div>
            <pre className="text-sm text-gray-700 overflow-x-auto bg-white p-4 rounded border border-gray-200 font-mono">
              {robotsContent || 'No robots.txt content loaded'}
            </pre>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Current Configuration:</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>All search engines are allowed to crawl the site</li>
              <li>Login, signup, dashboard, and admin pages are blocked from indexing</li>
              <li>Verification pages are blocked from indexing</li>
              <li>Sitemap is referenced at: https://wasteinstitute.org/sitemap.xml</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
