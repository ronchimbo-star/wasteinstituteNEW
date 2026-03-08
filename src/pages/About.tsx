import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Award, Users, Target, TrendingUp, Globe, BookOpen, CheckCircle, Star } from 'lucide-react';

export default function About() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Waste Institute",
    "url": "https://wasteinstitute.org",
    "description": "Leading provider of professional waste management education and certifications, connecting students with industry experts worldwide.",
    "email": "info@wasteinstitute.org",
    "areaServed": "Worldwide",
    "knowsAbout": ["Waste Management", "Circular Economy", "Environmental Compliance", "Hazardous Waste", "Recycling"]
  };

  return (
    <Layout>
      <SEO
        title="About Waste Institute | Leading Waste Management Education"
        description="Learn about the Waste Institute's mission to provide world-class waste management education and professional certifications. Meet our expert instructors and discover our commitment to industry excellence."
        canonical="https://wasteinstitute.org/about"
        structuredData={structuredData}
      />

      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              About Waste Institute
            </h1>
            <p className="text-xl text-emerald-50">
              Empowering professionals worldwide with industry-leading waste management education and certifications
            </p>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              Waste Institute was founded with a clear mission: to bridge the gap between academic knowledge and practical industry expertise in waste management. We believe that proper waste management is essential for environmental sustainability, public health, and economic prosperity.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Our platform connects students with experienced industry professionals who share real-world insights, proven methodologies, and best practices developed through years of hands-on experience. Every course is designed to provide immediately applicable skills that make a tangible difference in your career and organization.
            </p>
            <p className="text-lg text-gray-700">
              Whether you're just starting your career in waste management or looking to advance to senior leadership positions, Waste Institute provides the education, certification, and professional network you need to succeed.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Waste Institute?</h2>
            <p className="text-xl text-gray-600">What sets us apart in professional waste management education</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Award className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry-Recognized Certifications</h3>
              <p className="text-gray-600">
                Earn credentials that are respected by employers worldwide. Our certifications demonstrate your expertise and commitment to professional excellence.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Users className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Instructors</h3>
              <p className="text-gray-600">
                Learn from professionals who have led major waste management operations, developed industry standards, and advised governments and corporations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Target className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practical Application</h3>
              <p className="text-gray-600">
                Every course focuses on real-world scenarios and immediately applicable techniques. Learn skills you can implement from day one.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Curriculum</h3>
              <p className="text-gray-600">
                From foundational principles to advanced specializations, our courses cover every aspect of modern waste management and circular economy practices.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <Globe className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Community</h3>
              <p className="text-gray-600">
                Join thousands of professionals from around the world. Network, share experiences, and collaborate on solving the world's waste challenges.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Advancement</h3>
              <p className="text-gray-600">
                Our students report significant career progression, with many achieving promotions, salary increases, and new leadership opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Expert Instructors</h2>
            <p className="text-lg text-gray-700 mb-8 text-center">
              All courses at Waste Institute are developed and taught by industry veterans with decades of combined experience in waste management, environmental compliance, and sustainability.
            </p>

            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What Our Instructors Bring:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Experience managing large-scale waste operations serving millions of residents</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Direct involvement in developing industry regulations and best practice standards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Track records of implementing successful circular economy initiatives</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Expertise in hazardous materials handling, compliance, and safety management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Leadership roles in major environmental services companies and consulting firms</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={20} />
                  <span className="text-gray-700">Advanced degrees in environmental science, engineering, and business administration</span>
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700">
              Our instructors are passionate about sharing their knowledge and helping the next generation of waste management professionals excel. They bring current, practical insights that can only come from active involvement in the industry.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Commitment to Quality</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Up-to-Date Content</h3>
                  <p className="text-gray-600">
                    All courses are regularly updated to reflect the latest regulations, technologies, and industry best practices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Rigorous Standards</h3>
                  <p className="text-gray-600">
                    Every course undergoes thorough quality review to ensure accuracy, relevance, and educational effectiveness.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Student Support</h3>
                  <p className="text-gray-600">
                    Our dedicated support team is here to help you succeed, from technical questions to career advice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Star className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Continuous Improvement</h3>
                  <p className="text-gray-600">
                    We actively collect student feedback and continuously enhance our courses based on your needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Advance Your Career?</h2>
            <p className="text-xl text-emerald-50 mb-8">
              Join thousands of professionals who have transformed their careers with Waste Institute certifications and training.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/courses"
                className="inline-block px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Explore Courses
              </a>
              <a
                href="/contact"
                className="inline-block px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors border-2 border-white"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
