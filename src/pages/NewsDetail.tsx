import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { formatArticleContent, extractQuote, extractFAQs } from '../utils/articleFormatter';
import {
  Calendar,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Clock,
  User,
  BookOpen,
  TrendingUp,
  Zap,
  CheckCircle,
  ExternalLink,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  published_at: string;
  author_id: string;
  seo_description: string;
  seo_keywords: string;
}

interface Author {
  full_name: string;
}

interface NewsAd {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  background_color: string;
  text_color: string;
  image_url: string | null;
}

function SocialShare({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-500 hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-blue-700 hover:text-white'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: 'hover:bg-gray-700 hover:text-white'
    }
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Share2 size={18} />
        Share:
      </span>
      <div className="flex gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-lg border border-gray-300 transition-all ${link.color}`}
            aria-label={`Share on ${link.name}`}
          >
            <link.icon size={18} />
          </a>
        ))}
      </div>
    </div>
  );
}


function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-8 md:p-10 border border-emerald-200 shadow-lg my-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 opacity-5 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-600 opacity-5 rounded-full -ml-12 -mb-12"></div>
      <div className="relative flex items-start gap-4">
        <div className="text-5xl sm:text-6xl text-emerald-600 leading-none font-serif">&ldquo;</div>
        <div className="flex-1">
          <p className="text-lg sm:text-xl text-gray-800 italic mb-4 leading-relaxed">{quote}</p>
          <p className="font-bold text-emerald-700 text-sm">— {author}</p>
        </div>
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-10 md:p-16 text-white shadow-2xl my-16 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 shadow-lg">
          <BookOpen className="text-white" size={36} />
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Ready to Lead the Future of Waste Management?
        </h2>
        <p className="text-lg sm:text-xl text-emerald-50 mb-10 leading-relaxed max-w-2xl mx-auto">
          The waste management landscape is evolving rapidly. Staying ahead of these shifts is essential for your career and your organization's success.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all">
            <CheckCircle className="mx-auto mb-3 text-emerald-300" size={28} />
            <p className="text-sm font-semibold">Industry-Leading Courses</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all">
            <CheckCircle className="mx-auto mb-3 text-emerald-300" size={28} />
            <p className="text-sm font-semibold">Expert Instructors</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all">
            <CheckCircle className="mx-auto mb-3 text-emerald-300" size={28} />
            <p className="text-sm font-semibold">Professional Certification</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
          >
            <BookOpen size={20} />
            Explore Our Courses
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition-all border-2 border-white/40 shadow-xl hover:shadow-2xl hover:scale-105 transform"
          >
            <Mail size={20} />
            Contact Our Experts
          </Link>
        </div>

        <p className="text-sm text-emerald-100 mt-8">
          Questions about how this applies to your facility?{' '}
          <Link to="/contact" className="underline font-semibold hover:text-white transition-colors">
            Get in touch with our expert team
          </Link>
        </p>
      </div>
    </div>
  );
}

function PromoCard({ ad }: { ad: NewsAd }) {
  return (
    <div
      className="rounded-2xl p-8 my-12 shadow-xl transition-all hover:shadow-2xl"
      style={{ backgroundColor: ad.background_color, color: ad.text_color }}
    >
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-48 object-cover rounded-xl mb-6"
        />
      )}
      <h3 className="text-2xl font-bold mb-4">{ad.title}</h3>
      <p className="text-lg mb-6 opacity-90 leading-relaxed">{ad.description}</p>
      <Link
        to={ad.cta_link}
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:scale-105 transform transition-all shadow-lg"
      >
        {ad.cta_text}
        <ExternalLink size={18} />
      </Link>
    </div>
  );
}

function AccordionFAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 px-6 text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span className="font-semibold text-gray-900 text-lg pr-8">{question}</span>
        {isOpen ? (
          <ChevronUp size={24} className="text-emerald-600 flex-shrink-0" />
        ) : (
          <ChevronDown size={24} className="text-emerald-600 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <p className="text-gray-700 text-base leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [authorName, setAuthorName] = useState<string>('Waste Institute');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ads, setAds] = useState<{ ad1: NewsAd | null; ad2: NewsAd | null }>({ ad1: null, ad2: null });

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setArticle(data);

        if (data.author_id) {
          const { data: authorData } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', data.author_id)
            .maybeSingle();

          if (authorData?.full_name) {
            setAuthorName(authorData.full_name);
          }
        }

        const { data: articleAds } = await supabase
          .from('news_article_ads')
          .select(`
            position,
            news_ads (
              id,
              title,
              description,
              cta_text,
              cta_link,
              background_color,
              text_color,
              image_url
            )
          `)
          .eq('article_id', data.id);

        if (articleAds) {
          const ad1 = articleAds.find((aa: any) => aa.position === 1);
          const ad2 = articleAds.find((aa: any) => aa.position === 2);
          setAds({
            ad1: ad1?.news_ads || null,
            ad2: ad2?.news_ads || null
          });
        }
      }
    } catch (error) {
      console.error('Error loading article:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (notFound || !article) {
    return (
      <Layout>
        <SEO
          title="Article Not Found | Waste Institute"
          description="The article you're looking for doesn't exist or has been unpublished."
          canonical={`https://wasteinstitute.org/news/${slug}`}
          noindex={true}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The article you're looking for doesn't exist or has been unpublished.
            </p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to News
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const seoDescription = article.seo_description || article.excerpt;
  const truncatedExcerpt = article.excerpt.length > 155
    ? article.excerpt.substring(0, 155) + '...'
    : article.excerpt;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": seoDescription,
    "keywords": article.seo_keywords,
    "datePublished": article.published_at,
    "author": {
      "@type": "Organization",
      "name": "Waste Institute"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Waste Institute"
    },
    "mainEntityOfPage": `https://wasteinstitute.org/news/${article.slug}`
  };

  const readingTime = Math.ceil(article.content.split(' ').length / 200);

  return (
    <Layout>
      <SEO
        title={`${article.title} | Waste Institute`}
        description={seoDescription}
        keywords={article.seo_keywords}
        canonical={`https://wasteinstitute.org/news/${article.slug}`}
        ogType="article"
        ogImage={article.featured_image || 'https://wasteinstitute.org/og-image.jpg'}
        structuredData={structuredData}
      />

      <article className="bg-white">
        <div className="relative">
          {article.featured_image ? (
            <div className="h-96 w-full overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-96 w-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="text-white opacity-20" size={120} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-8 transition-colors group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to News
              </Link>

              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
                  <Zap size={16} />
                  Latest Insights
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-600" />
                    <time dateTime={article.published_at}>
                      {new Date(article.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-emerald-600" />
                    <span>{authorName}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-emerald-600" />
                    <span>{readingTime} min read</span>
                  </div>
                </div>

                {article.seo_keywords && (
                  <div className="mb-6">
                    <div className="flex items-start gap-3">
                      <Tag size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                      <div className="flex flex-wrap gap-2">
                        {article.seo_keywords.split(',').map((keyword, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <SocialShare url={currentUrl} title={article.title} />
              </div>

              {article.excerpt && (
                <div className="relative bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-8 md:p-10 mb-12 border border-emerald-200 shadow-sm">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-600 to-teal-600 rounded-l-2xl"></div>
                  <p className="text-lg sm:text-xl text-gray-800 font-medium leading-relaxed pl-4">{article.excerpt}</p>
                </div>
              )}

              <div className="prose prose-lg max-w-none article-content overflow-hidden mb-12">
                {formatArticleContent(article.content, {
                  includeAds: true,
                  ads: ads,
                  AdComponent: PromoCard
                })}
              </div>

              {extractFAQs(article.content).length > 0 && (
                <div className="my-16">
                  <div className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-6 mb-8 border-l-4 border-emerald-600">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-start gap-3">
                      <span className="text-emerald-600 flex-shrink-0 mt-1">▸</span>
                      <span>Frequently Asked Questions</span>
                    </h2>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {extractFAQs(article.content).map((faq, index) => (
                      <AccordionFAQ
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                      />
                    ))}
                  </div>
                </div>
              )}

              {extractQuote(article.content) && (
                <QuoteCard
                  quote={extractQuote(article.content)!.quote}
                  author={extractQuote(article.content)!.author}
                />
              )}

              <CTASection />

              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <SocialShare url={currentUrl} title={article.title} />
                  <Link
                    to="/news"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft size={20} />
                    Back to All News
                  </Link>
                </div>
              </div>

              <div className="mt-12 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <ExternalLink size={24} className="text-emerald-600" />
                  Related Resources
                </h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  <Link
                    to="/courses"
                    className="group p-6 bg-white rounded-xl hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500 transform hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                      <BookOpen className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <p className="font-bold text-gray-900 mb-2 text-lg">Training Courses</p>
                    <p className="text-sm text-gray-600">Advance your expertise with industry-leading programs</p>
                  </Link>
                  <Link
                    to="/membership"
                    className="group p-6 bg-white rounded-xl hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500 transform hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                      <User className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <p className="font-bold text-gray-900 mb-2 text-lg">Membership</p>
                    <p className="text-sm text-gray-600">Join our community of waste professionals</p>
                  </Link>
                  <Link
                    to="/resources"
                    className="group p-6 bg-white rounded-xl hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500 transform hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                      <BookOpen className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                    </div>
                    <p className="font-bold text-gray-900 mb-2 text-lg">Resources</p>
                    <p className="text-sm text-gray-600">Access comprehensive guides and tools</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-24"></div>
      </article>
    </Layout>
  );
}
