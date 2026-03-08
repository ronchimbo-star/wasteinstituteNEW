import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Check, Award, Users, BookOpen, TrendingUp } from 'lucide-react';

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
}

export default function Membership() {
  const [membershipLevels, setMembershipLevels] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembershipLevels();
  }, []);

  const loadMembershipLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_levels')
        .select('*')
        .eq('published', true)
        .order('display_order');

      if (error) throw error;
      if (data) setMembershipLevels(data);
    } catch (error) {
      console.error('Error loading membership levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBenefits = (benefits: string) => {
    return benefits
      .split('\n')
      .filter((line) => line.trim().startsWith('•'))
      .map((line) => line.trim().substring(1).trim());
  };

  const getPaymentOptions = (level: MembershipLevel) => {
    const options = [];
    if (level.annual_fee > 0) {
      options.push(`£${level.annual_fee}/year`);
    }
    if (level.quarterly_fee) {
      options.push(`£${level.quarterly_fee}/quarter`);
    }
    if (level.monthly_fee) {
      options.push(`£${level.monthly_fee}/month`);
    }
    return options.length > 0 ? options.join(' or ') : 'Free';
  };

  return (
    <Layout>
      <SEO
        title="Membership | Waste Institute"
        description="Join the Waste Institute professional membership and access exclusive benefits, networking opportunities, and career advancement resources."
        canonical="https://wasteinstitute.org/membership"
      />
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Award className="mx-auto mb-6" size={64} />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Waste Institute Membership
            </h1>
            <p className="text-xl text-emerald-50 leading-relaxed">
              Join a thriving community of waste management professionals. Choose the membership grade that matches your career stage and gain access to exclusive resources, networking opportunities, and professional recognition.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-xl p-8 shadow-md text-center">
                <Users className="mx-auto mb-4 text-emerald-600" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Community</h3>
                <p className="text-gray-600">
                  Connect with thousands of professionals in waste management, healthcare, and aesthetics
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-md text-center">
                <BookOpen className="mx-auto mb-4 text-emerald-600" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Exclusive Resources</h3>
                <p className="text-gray-600">
                  Access technical briefings, webinars, and the Knowledge Centre
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-md text-center">
                <TrendingUp className="mx-auto mb-4 text-emerald-600" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Career Progression</h3>
                <p className="text-gray-600">
                  Follow a clear pathway from Student to Fellow with recognized credentials
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading membership levels...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {membershipLevels.map((level, index) => (
                  <div
                    key={level.id}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
                      level.slug === 'chartered' || level.slug === 'fellow'
                        ? 'border-emerald-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <div
                      className={`p-8 ${
                        level.slug === 'chartered' || level.slug === 'fellow'
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-3xl font-bold text-gray-900">{level.name}</h2>
                            {level.post_nominals && (
                              <span className="px-4 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                                {level.post_nominals}
                              </span>
                            )}
                            {level.is_invitation_only && (
                              <span className="px-4 py-1 bg-amber-100 text-amber-800 text-sm font-semibold rounded-full">
                                Invitation Only
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-4">{level.description}</p>
                        </div>

                        <div className="lg:text-right">
                          <div className="text-3xl font-bold text-emerald-600 mb-2">
                            {level.annual_fee === 0 ? 'Free' : `£${level.annual_fee}`}
                          </div>
                          {level.annual_fee > 0 && (
                            <div className="text-sm text-gray-600">
                              {getPaymentOptions(level)}
                            </div>
                          )}
                          {level.course_discount_percent > 0 && (
                            <div className="mt-3 inline-block px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-lg">
                              {level.course_discount_percent}% Course Discount
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 p-8 bg-gray-50">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Award size={20} className="text-emerald-600" />
                          Eligibility Criteria
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{level.criteria}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Check size={20} className="text-emerald-600" />
                          Member Benefits
                        </h3>
                        <ul className="space-y-2">
                          {formatBenefits(level.benefits).map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <Check size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-6 bg-white border-t border-gray-200 text-center">
                      <button
                        className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                          level.is_invitation_only
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                        disabled={level.is_invitation_only}
                      >
                        {level.is_invitation_only
                          ? 'Application by Invitation'
                          : level.annual_fee === 0
                          ? 'Register as Student Member'
                          : `Join as ${level.name}`}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Questions About Membership?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our team is here to help you choose the right membership level and answer any questions about benefits, criteria, or the application process.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
