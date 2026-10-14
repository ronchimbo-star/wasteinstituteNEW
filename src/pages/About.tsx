import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Award, Users, Target, TrendingUp, Globe, BookOpen, CheckCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import NewsletterSignup from '../components/NewsletterSignup';
import { Link } from 'react-router-dom';

export default function About() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Waste Institute",
      "url": "https://wasteinstitute.org",
      "description": "Certified clinical waste management training for beauty, aesthetics, tattoo, and podiatry professionals. Powered by MediWaste.",
      "email": "info@wasteinstitute.org",
      "areaServed": "United Kingdom",
      "knowsAbout": ["Clinical Waste Management", "Sharps Safety", "Infection Control", "HTM 07-01", "Waste Segregation", "ESG Reporting"]
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Waste Institute",
      "url": "https://wasteinstitute.org",
      "email": "info@wasteinstitute.org",
      "telephone": "+441322879087",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "82 James Carter Rd",
        "addressLocality": "Mildenhall, Bury Saint Edmunds",
        "postalCode": "IP28 7DE",
        "addressCountry": "GB"
      },
      "sameAs": ["https://www.linkedin.com/company/wasteinstitute"]
    }
  ];

  return (
    <Layout>
      <SEO
        title="About Waste Institute | Clinical Waste Training Powered by MediWaste"
        description="Waste Institute provides certified clinical waste management training for beauty, tattoo, and podiatry professionals. Created by the experts at MediWaste."
        canonical="https://wasteinstitute.org/about"
        structuredData={structuredData}
      />

      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              Powered by MediWaste
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              About Waste Institute
            </h1>
            <p className="text-xl text-emerald-50">
              Certified clinical waste management training for beauty, aesthetics, tattoo, and podiatry professionals
            </p>
          </div>
        </div>
      </div>

      {/* The MediWaste Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why We Created Waste Institute</h2>
            <p className="text-lg text-gray-700 mb-4">
              MediWaste has been collecting clinical waste from beauty salons, aesthetics clinics, tattoo studios, and podiatry practices across the UK for years. In that time, we saw the same problems again and again: professionals who wanted to do the right thing but didn't know exactly what the regulations required of them.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              We kept getting asked the same questions: "What bin does this go in?" "Do I need to keep a waste transfer note?" "How do I set up my sharps container?" "What will the inspector want to see?" The answers were out there, but they were buried in regulations, guidance documents, and jargon that most practitioners don't have time to wade through.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              So we created Waste Institute to bring that knowledge directly to the people who need it. Every course is built on years of hands-on experience helping real practices like yours stay compliant. No jargon, no theory — just practical, actionable training that you can apply from day one.
            </p>
            <p className="text-lg text-gray-700">
              Whether you run a single treatment room or a multi-site operation, whether you're just starting out or have been in business for decades, our courses give you the knowledge and the certificate to prove it.
            </p>
          </div>
        </div>
      </section>

      {/* What sets us apart */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
            <p className="text-xl text-gray-600">Built by practitioners, for practitioners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Built on Real Compliance</h3>
              <p className="text-gray-600">
                Every course is designed around the regulations that actually apply to your practice — HTM 07-01, Duty of Care, COSHH, and more.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Users className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Made for Your Profession</h3>
              <p className="text-gray-600">
                Courses are tailored to beauty, tattoo, podiatry, and cross-sector healthcare — not generic waste management theory.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Target className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practical, Not Theoretical</h3>
              <p className="text-gray-600">
                Real examples from real working days. You'll learn exactly what to do with every type of waste your practice produces.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Award className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verifiable Certificates</h3>
              <p className="text-gray-600">
                Every course includes a certificate with a unique ID that employers, inspectors, and clients can verify online.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Self-Paced Learning</h3>
              <p className="text-gray-600">
                Complete courses on any device, at your own pace. Your progress is saved automatically, so you can pick up where you left off.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Globe className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Serving Hundreds of Practices</h3>
              <p className="text-gray-600">
                Join hundreds of MediWaste clients across the UK who trust us for their clinical waste training and compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MediWaste connection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-emerald-50 rounded-xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">The MediWaste Connection</h2>
              <p className="text-lg text-gray-700 mb-4">
                Waste Institute is the training arm of MediWaste, the UK's trusted provider of clinical waste collection and compliance services. When you train with us, you're learning from the same team that helps practices like yours stay compliant every day.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Need clinical waste collection for your practice? Visit MediWaste for reliable, compliant waste collection services.
              </p>
              <a
                href="https://mediwaste.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Visit mediwaste.co.uk
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Certified?</h2>
            <p className="text-xl text-emerald-50 mb-8">
              Browse our courses and start your compliance journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Browse Courses
              </Link>
              <Link
                to="/certification"
                className="inline-block px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors border-2 border-white"
              >
                About Certification
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
              <BookOpen className="text-white" size={28} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Clinical Waste Updates
            </h2>
            <p className="text-lg text-emerald-100 mb-8">
              Get weekly regulatory news, compliance updates, and expert guidance for your practice.
            </p>
            <NewsletterSignup variant="banner" source="about" />
            <p className="text-xs text-emerald-200 mt-4">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
