import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Award, ShieldCheck, FileCheck, Eye, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Certification() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Waste Institute",
    "url": "https://wasteinstitute.org/certification",
    "description": "Earn a recognised Certificate of Completion in clinical waste management from Waste Institute, powered by MediWaste.",
  };

  return (
    <Layout>
      <SEO
        title="Certification | Waste Institute"
        description="Earn a recognised Certificate of Completion in clinical waste management. Display it in your clinic, show it to inspectors, and include it in your marketing."
        canonical="https://wasteinstitute.org/certification"
        structuredData={structuredData}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Award className="text-white" size={32} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Your Certificate of Completion
            </h1>
            <p className="text-xl text-emerald-50 mb-8">
              Every Waste Institute course includes a verifiable certificate that demonstrates your commitment to safe, compliant clinical waste management.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* What is the certificate */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is the Certificate?</h2>
            <p className="text-lg text-gray-700 mb-4">
              When you complete a Waste Institute course, you receive a Certificate of Completion. This certificate confirms that you have worked through every module and demonstrated your understanding of clinical waste management for your profession.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Each certificate includes your name, the course title, a unique certificate ID, and the date of issue. Certificates are verifiable through our public verification portal — anyone can check the authenticity of your certificate at any time.
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mt-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-emerald-600 flex-shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">CPD Accreditation</h3>
                  <p className="text-gray-700">
                    Our courses are designed to meet Continuing Professional Development (CPD) standards. Check each course page for the specific number of CPD hours it provides.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to use it */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">How to Use Your Certificate</h2>
            <p className="text-xl text-gray-600 text-center mb-12">Three ways your certificate works for you</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <Eye className="text-emerald-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Display in Your Clinic</h3>
                <p className="text-gray-600">
                  Print and display your certificate in your salon, clinic, or studio. It shows clients and visitors that you take clinical waste management seriously.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <FileCheck className="text-emerald-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Show to Inspectors</h3>
                <p className="text-gray-600">
                  Present your certificate during Environmental Health Officer (EHO) inspections or audits as evidence of staff training and compliance.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <Download className="text-emerald-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Include in Marketing</h3>
                <p className="text-gray-600">
                  Add your certified status to your website, social media profiles, and promotional materials to build trust with potential clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Verify a Certificate</h2>
            <p className="text-lg text-gray-700 mb-8">
              Every certificate issued by Waste Institute has a unique certificate ID. Employers, inspectors, and clients can verify its authenticity through our public verification portal.
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              <ShieldCheck size={20} />
              Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What's Included in Every Course</h2>
            <div className="space-y-4">
              {[
                'Certificate of Completion with your name and unique certificate ID',
                'Public verification portal for employers and inspectors',
                'Self-paced online modules you can complete on any device',
                'Practical, real-world guidance for your specific profession',
                '14-day money-back guarantee — no questions asked',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
