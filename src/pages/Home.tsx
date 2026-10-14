import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { BookOpen, Award, ShieldCheck, ArrowRight, Clock, CheckCircle2, ChevronDown, Sparkles, Users } from 'lucide-react';
import NewsletterSignup from '../components/NewsletterSignup';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured_image: string;
  level: string;
  duration: string;
  price: number;
  original_price: number | null;
  target_audience: string | null;
}

interface Sector {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

const SECTOR_PATHWAYS = [
  {
    slug: 'beauty-aesthetics',
    name: 'Beauty & Aesthetics',
    icon: '💅',
    description: 'For salon owners, clinic managers, aestheticians, and beauty therapists. Clinical waste, sharps safety, infection control, and ESG reporting.',
    color: 'from-rose-500 to-pink-600',
  },
  {
    slug: 'tattoo-piercing',
    name: 'Tattoo & Piercing',
    icon: '🎨',
    description: 'For tattoo studio owners, piercing professionals, and senior artists. Waste setup, single-use equipment, hazardous waste, and cleaning protocols.',
    color: 'from-slate-600 to-gray-700',
  },
  {
    slug: 'podiatry',
    name: 'Podiatry',
    icon: '🦶',
    description: 'For podiatrists, chiropodists, and foot health practitioners. Clinical waste, sharps safety, infection control, and mobile practice waste.',
    color: 'from-sky-500 to-blue-600',
  },
];

const FAQ_DATA = [
  {
    q: "How long do the courses take to complete?",
    a: "Courses range from 1 hour (single-module quick guides) to 4 hours (comprehensive certificate courses). All courses are self-paced, so you can complete them in one sitting or spread them over several days. Your progress is saved automatically."
  },
  {
    q: "How much do the courses cost?",
    a: "Individual courses start at £47 and go up to £97. Bundle offers are available that save you up to £592 across all 17 courses. Every course includes a verifiable certificate of completion at no extra cost."
  },
  {
    q: "Are these courses relevant to small practices and solo practitioners?",
    a: "Absolutely. Our courses are designed for real working practices, from single-person mobile clinics to multi-site operations. The guidance is practical, actionable, and scaled to your setup — whether you run a small salon or a large aesthetics clinic."
  },
  {
    q: "Will these courses help me pass an inspection?",
    a: "Yes. Every course is built around the regulations and standards that Environmental Health Officers and other inspectors check. You will learn exactly what you need to demonstrate, what records to keep, and how to present your compliance during an inspection."
  },
  {
    q: "What is the certificate and how do I use it?",
    a: "When you complete a course, you receive a Certificate of Completion with a unique, verifiable ID. You can display it in your clinic, show it to inspectors, include it in your marketing, and add it to your CPD portfolio. Anyone can verify your certificate through our public verification portal."
  },
  {
    q: "What if I'm not satisfied with the course?",
    a: "We offer a 14-day money-back guarantee. If you're not satisfied for any reason, contact us within 14 days of purchase for a full refund — no questions asked."
  },
  {
    q: "Who created these courses?",
    a: "All courses are created by the clinical waste experts at MediWaste, the UK's trusted provider of clinical waste collection and compliance services for healthcare, beauty, and aesthetics businesses."
  },
];

export const HomePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [coursesRes, sectorsRes] = await Promise.all([
      supabase
        .from('courses')
        .select('id, title, slug, description, featured_image, level, duration, price, original_price, target_audience')
        .eq('published', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('sectors')
        .select('id, name, slug, description, icon')
        .eq('show_in_public', true)
        .order('display_order'),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (sectorsRes.data) setSectors(sectorsRes.data);
  };

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Waste Institute",
    "url": "https://wasteinstitute.org",
    "description": "Certified clinical waste management training for beauty, aesthetics, tattoo, and podiatry professionals. Powered by MediWaste.",
    "email": "info@wasteinstitute.org",
    "telephone": "+441322879087",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "82 James Carter Rd",
      "addressLocality": "Mildenhall, Bury Saint Edmunds",
      "postalCode": "IP28 7DE",
      "addressCountry": "GB"
    }
  }), []);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  }, []);

  return (
    <Layout>
      <SEO
        title="Waste Institute | Clinical Waste Training for Beauty, Tattoo & Podiatry"
        description="Certified clinical waste management training for beauty, aesthetics, tattoo, and podiatry professionals. Powered by MediWaste. Enrol today."
        canonical="https://wasteinstitute.org/"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center text-white">
            <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Powered by MediWaste
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Certified Waste Management Training for Beauty, Aesthetics, Tattoo & Podiatry Professionals
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-emerald-50">
              Practical, compliance-focused online courses with verifiable certificates. Built by clinical waste experts at MediWaste.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Browse Courses
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/certification"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900 transition-colors border-2 border-white/30"
              >
                <Award size={20} />
                About Certification
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Money-back guarantee banner */}
      <section className="bg-emerald-50 border-y border-emerald-200 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-emerald-800">
            <ShieldCheck size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium text-center">
              14-day money-back guarantee. Not satisfied? Full refund, no questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* Audience Pathways */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Training for Your Profession
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your sector to find courses designed specifically for your practice
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {SECTOR_PATHWAYS.map((pathway) => (
              <Link
                key={pathway.slug}
                to={`/courses?sector=${pathway.slug}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500"
              >
                <div className={`bg-gradient-to-br ${pathway.color} p-8 text-center`}>
                  <span className="text-5xl block mb-3">{pathway.icon}</span>
                  <h3 className="text-2xl font-bold text-white">{pathway.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{pathway.description}</p>
                  <span className="text-emerald-600 font-semibold group-hover:gap-2 transition-all flex items-center gap-1">
                    View Courses
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {courses.length > 0 && (
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Featured Courses</h2>
                <p className="text-xl text-gray-600">Practical, compliance-focused training</p>
              </div>
              <Link
                to="/courses"
                className="hidden sm:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View All <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 hover:border-emerald-500 group flex flex-col"
                >
                  {course.featured_image ? (
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img
                        src={course.featured_image}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="160"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                      <BookOpen className="text-white" size={48} />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                        <Award size={12} />
                        Certificate included
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{course.description}</p>
                    {course.duration && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <Clock size={14} />
                        {course.duration}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100">
                      <span className="text-2xl font-bold text-emerald-600">
                        £{course.price}
                      </span>
                      {course.original_price && (
                        <span className="text-lg text-gray-400 line-through">
                          £{course.original_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View All Courses <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust Signals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <Users className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by MediWaste Clients Across the UK
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Join hundreds of beauty salons, aesthetics clinics, tattoo studios, and podiatry practices who trust MediWaste for their clinical waste training and compliance.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, label: 'Compliance Ready', desc: 'Built around real inspection standards' },
                { icon: Award, label: 'Verifiable Certificates', desc: 'Public verification for every certificate' },
                { icon: Clock, label: 'Self-Paced Learning', desc: 'Complete on any device, anytime' },
                { icon: CheckCircle2, label: '14-Day Guarantee', desc: 'Full refund, no questions asked' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
                    <item.icon className="text-emerald-600" size={28} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our courses
              </p>
            </div>
            <div className="space-y-3">
              {FAQ_DATA.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-500 transition-colors shadow-sm hover:shadow-md"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`flex-shrink-0 text-emerald-600 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        size={24}
                      />
                    </button>
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      } overflow-hidden`}
                    >
                      <div className="px-6 pb-5 pt-2">
                        <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Still have questions? We're here to help.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-6">
              <Sparkles className="text-white" size={28} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Clinical Waste Updates
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Get weekly regulatory news, compliance updates, and expert guidance for your practice.
            </p>
            <NewsletterSignup variant="banner" source="homepage" />
            <p className="text-xs text-emerald-200 mt-4">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};
