import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import Layout from '../components/Layout';
import { Award, Check, ArrowLeft, DollarSign, Calendar, Percent } from 'lucide-react';

interface MembershipLevel {
  id: string;
  name: string;
  slug: string;
  post_nominals: string | null;
  description: string;
  criteria: string;
  benefits: string;
  annual_fee: number;
  quarterly_fee: number | null;
  monthly_fee: number | null;
  display_order: number;
  is_invitation_only: boolean;
  course_discount_percent: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  page_content: string | null;
}

export function MembershipDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [level, setLevel] = useState<MembershipLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadMembershipLevel();
  }, [slug]);

  async function loadMembershipLevel() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('membership_levels')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setLevel(data);
      }
    } catch (error) {
      console.error('Error loading membership level:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  if (notFound || !level) {
    return (
      <Layout>
        <SEO
          title="Membership Level Not Found | Waste Institute"
          description="The requested membership level could not be found."
        />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Award className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Membership Level Not Found</h1>
          <p className="text-gray-600 mb-8">The membership level you're looking for doesn't exist or is no longer available.</p>
          <Link
            to="/membership"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft size={20} />
            View All Membership Levels
          </Link>
        </div>
      </Layout>
    );
  }

  const benefitsList = level.benefits.split('\n').filter(b => b.trim());

  return (
    <Layout>
      <SEO
        title={level.meta_title || `${level.name} Membership | Waste Institute`}
        description={level.meta_description || level.description}
        keywords={level.meta_keywords || undefined}
      />

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/membership"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to All Membership Levels
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <Award className="text-emerald-600" size={48} />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {level.name} Membership
              </h1>
              {level.post_nominals && (
                <p className="text-xl text-emerald-600 font-semibold mt-2">
                  Post-Nominals: {level.post_nominals}
                </p>
              )}
            </div>
          </div>

          {level.is_invitation_only && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg mb-6">
              <Award size={20} />
              <span className="font-medium">Invitation Only</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Level</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{level.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements & Criteria</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{level.criteria}</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Benefits</h2>
              <div className="space-y-3">
                {benefitsList.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                    <p className="text-gray-700">{benefit.replace(/^[•\-]\s*/, '')}</p>
                  </div>
                ))}
              </div>
            </section>

            {level.page_content && (
              <section>
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {level.page_content}
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Membership Pricing</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-emerald-600" />
                    <span className="font-medium text-gray-900">Annual</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">
                    £{level.annual_fee.toFixed(2)}
                  </span>
                </div>

                {level.quarterly_fee && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-gray-600" />
                      <span className="font-medium text-gray-900">Quarterly</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      £{level.quarterly_fee.toFixed(2)}
                    </span>
                  </div>
                )}

                {level.monthly_fee && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-gray-600" />
                      <span className="font-medium text-gray-900">Monthly</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      £{level.monthly_fee.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Percent size={20} className="text-blue-600" />
                  <span className="font-medium text-gray-900">Course Discount</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {level.course_discount_percent}% off all courses
                </p>
              </div>

              {!level.is_invitation_only && (
                <button className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-md">
                  Apply for Membership
                </button>
              )}

              {level.is_invitation_only && (
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    This is an invitation-only membership level. Outstanding professionals may be nominated or apply through a special application process.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Questions? <Link to="/contact" className="text-emerald-600 hover:underline">Contact us</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Become part of a professional community committed to excellence in waste management.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/membership"
              className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Compare All Levels
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
