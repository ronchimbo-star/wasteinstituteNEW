import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Calendar, ArrowRight, Clock, TrendingUp, Search, X, BookOpen } from 'lucide-react';
import NewsletterSignup from '../components/NewsletterSignup';
import { useDebounce } from '../hooks/useDebounce';
import { OptimizedImage } from '../components/OptimizedImage';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
  content: string;
}

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm);

  useEffect(() => {
    loadArticles();
  }, [debouncedSearch]);

  const loadArticles = async () => {
    try {
      let query = supabase
        .from('news_articles')
        .select('id, title, slug, excerpt, featured_image, published_at, content')
        .eq('published', true)
        .is('deleted_at', null)
        .order('published_at', { ascending: false });

      if (debouncedSearch.trim()) {
        query = query.textSearch('fts', debouncedSearch.trim(), { type: 'websearch' });
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadingTime = (content: string) => {
    return Math.ceil(content.split(' ').length / 200);
  };

  return (
    <Layout>
      <SEO
        title="News & Articles | Waste Institute"
        description="Latest news, research and articles on waste management, circular economy, sustainability and environmental compliance from Waste Institute."
        canonical="https://wasteinstitute.org/news"
      />
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
              <TrendingUp size={16} />
              Latest Industry Insights
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">News & Articles</h1>
            <p className="text-xl text-emerald-50 leading-relaxed">
              Stay updated with the latest insights, trends, and innovations in waste management and circular economy
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-lg relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No articles published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
                >
                  <Link to={`/news/${article.slug}`} className="block">
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                      {article.featured_image ? (
                        <OptimizedImage
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                          width={600}
                          height={224}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="text-emerald-600" size={64} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-emerald-600" />
                          <time dateTime={article.published_at}>
                            {new Date(article.published_at).toLocaleDateString('en-GB', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-emerald-600" />
                          <span>{getReadingTime(article.content)} min read</span>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-tight">
                        {article.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        Read Article
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="py-16 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-6">
              <BookOpen className="text-white" size={28} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Stay Ahead in Waste Management
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Get the latest industry insights, course updates, and expert guidance delivered to your inbox.
            </p>
            <NewsletterSignup variant="banner" source="news" />
            <p className="text-xs text-emerald-200 mt-4">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
