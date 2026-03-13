import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { BookOpen, Award, Users, TrendingUp, ArrowRight, Star, Quote, Sparkles, Monitor, Video, Recycle, ChevronDown, Lightbulb } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured_image: string;
  level: string;
  duration: string;
  price: number;
}

interface Sector {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
}

interface Testimonial {
  id: string;
  student_name: string;
  student_title: string;
  student_image: string;
  rating: number;
  testimonial_text: string;
}

export const HomePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [coursesRes, sectorsRes, newsRes, testimonialsRes] = await Promise.all([
      supabase.from('courses').select('*').eq('published', true).limit(3),
      supabase.from('sectors').select('*').order('display_order').limit(6),
      supabase.from('news_articles').select('*').eq('published', true).order('published_at', { ascending: false }).limit(3),
      supabase.from('testimonials').select('*').eq('published', true).eq('featured', true).order('display_order').limit(6),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    if (newsRes.data) setNews(newsRes.data);
    if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
  };

  const faqs = [
    {
      category: "Circular Economy & Strategy",
      questions: [
        {
          q: "What is the circular economy and how is it different from recycling?",
          a: "The circular economy is a systemic shift away from the traditional \"take-make-waste\" linear model. It aims to keep resources in use for as long as possible through processes like reuse, repair, remanufacturing, and recycling. While recycling is a key component, the circular economy focuses more broadly on designing out waste and pollution in the first place, rather than just managing materials at the end of their life."
        },
        {
          q: "How does Extended Producer Responsibility (EPR) work?",
          a: "Extended Producer Responsibility (EPR) is a policy approach that shifts the financial and operational responsibility for managing a product's end-of-life from municipalities to the producers who design and sell the products. This creates a strong incentive for companies to design products that are more durable, repairable, and recyclable."
        },
        {
          q: "What are the main challenges in implementing a circular economy?",
          a: "Key challenges include overcoming deeply embedded linear business models, designing products for disassembly and reuse, creating viable markets for secondary raw materials, and establishing consistent global policies to support circularity."
        }
      ]
    },
    {
      category: "Waste-to-Energy & Technology",
      questions: [
        {
          q: "What is Waste-to-Energy (WtE) and is it a good alternative to landfills?",
          a: "Waste-to-Energy (WtE) refers to processes that convert non-recyclable waste into energy, such as electricity, heat, or fuel, through methods like combustion, gasification, or anaerobic digestion. For residual waste that cannot be recycled, WtE is generally a better alternative than landfilling because it recovers energy, reduces the volume of waste by up to 90%, and can significantly lower greenhouse gas emissions compared to methane-producing landfills."
        },
        {
          q: "How clean are modern Waste-to-Energy plants?",
          a: "Modern WtE facilities are equipped with rigorous air pollution control technologies, such as baghouse filters, scrubbers, and continuous emission monitoring systems. This ensures that emissions of pollutants like dioxins, heavy metals, and particulates are well below strict regulatory standards. The U.S. EPA has recognized that these plants produce electricity \"with less environmental impact than almost any other source of electricity\"."
        },
        {
          q: "What is landfill gas and can it be used for energy?",
          a: "Landfill gas is a natural byproduct of the decomposition of organic waste in landfills, composed primarily of methane and carbon dioxide. Yes, it is a valuable renewable energy source. Landfill gas can be captured and used to generate electricity, heat, or be upgraded into renewable natural gas (RNG) for use as a vehicle fuel. Capturing and using this gas also prevents methane, a potent greenhouse gas, from escaping into the atmosphere."
        }
      ]
    },
    {
      category: "PFAS & Hazardous Materials",
      questions: [
        {
          q: "What are PFAS and why are they a concern in waste management?",
          a: "PFAS (per- and polyfluoroalkyl substances), often called \"forever chemicals,\" are a large group of synthetic chemicals used in countless consumer products like non-stick cookware, food packaging, and stain-resistant fabrics. They are a major concern in waste management because they are extremely persistent in the environment and do not break down easily. When products containing PFAS are thrown away, they can contaminate landfill leachate, compost, and biosolids, potentially re-entering the environment."
        },
        {
          q: "Does recycling spread PFAS contamination?",
          a: "This is a critical question. Research indicates that most biological treatment methods like composting are ineffective at removing PFAS. When materials containing PFAS are recycled (e.g., food packaging turned into new paper products), the PFAS can persist in the recycled material, potentially leading to a cycle of contamination and raising concerns about the safety of these recycled products."
        }
      ]
    },
    {
      category: "Recycling Basics & Contamination",
      questions: [
        {
          q: "What is \"wishcycling\" and why is it bad?",
          a: "\"Wishcycling\" is the well-intentioned act of putting items in the recycling bin hoping they can be recycled, even when they can't. This is problematic because non-recyclable items like plastic bags, greasy pizza boxes, or clothing can contaminate entire loads of recycling, causing them to be sent to the landfill instead. It also increases costs and slows down operations at recycling facilities."
        },
        {
          q: "How can I ensure my recycling doesn't get contaminated?",
          a: "Follow three simple rules: 1) Empty and rinse containers to remove food residue and liquid. 2) Keep items dry and loose—never bag your recycling. 3) Know your local guidelines and only put accepted items in the bin. When in doubt, it's better to leave it out."
        }
      ]
    },
    {
      category: "Hazardous Waste",
      questions: [
        {
          q: "How should I dispose of household hazardous waste like paint or batteries?",
          a: "Household hazardous waste (HHW) such as paint, solvents, batteries, and electronics should never be placed in your regular trash or recycling bin. Many communities offer dedicated HHW collection centers, drop-off events, or permanent facilities for safe disposal. Retailers like hardware stores or electronics shops may also accept certain items like batteries and CFL bulbs."
        }
      ]
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Waste Institute",
    "url": "https://wasteinstitute.org",
    "description": "Professional waste management courses and certifications from industry experts. Learn waste legislation, circular economy, hazardous waste handling and more.",
    "email": "info@wasteinstitute.org"
  };

  return (
    <Layout>
      <SEO
        title="Waste Institute | Waste Management Courses & Certifications"
        description="Professional waste management courses and certifications from industry experts. Learn waste legislation, circular economy, hazardous waste handling and more."
        canonical="https://wasteinstitute.org/"
        structuredData={structuredData}
      />
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Start Learning With Leading Waste Management Experts Today
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-emerald-50">
                Professional training and certification programs designed by industry experts
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Explore Courses
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-800 text-white rounded-lg font-semibold hover:bg-emerald-900 transition-all border-2 border-white border-opacity-30"
                >
                  Get Started Free
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/hero/wasteinstitute-image1.jpg"
                  alt="Happy student learning outdoors"
                  className="w-full h-[500px] object-cover"
                  width="800"
                  height="500"
                />

                <div className="absolute top-4 right-4 animate-bounce">
                  <img
                    src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/icons/white-icon.png"
                    width="64"
                    height="64"
                    alt="Waste Institute"
                    className="w-12 h-12 drop-shadow-lg"
                  />
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-12 left-8 text-yellow-300 animate-float-slow">
                    <Sparkles size={30} className="fill-current" />
                  </div>
                  <div className="absolute top-24 right-16 text-yellow-400 animate-float-delayed">
                    <Sparkles size={24} className="fill-current" />
                  </div>
                  <div className="absolute bottom-32 left-12 text-yellow-300 animate-float">
                    <Sparkles size={27} className="fill-current" />
                  </div>
                  <div className="absolute top-1/3 right-8 text-yellow-400 animate-float-slow">
                    <Sparkles size={21} className="fill-current" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-5 shadow-2xl max-w-xs animate-fade-in-up border border-white border-opacity-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-300">Active Learners</span>
                  </div>
                  <p className="text-2xl font-handwriting text-white font-semibold animate-text-wave">
                    "So excited to start!"
                  </p>
                  <div className="flex gap-3 mt-3">
                    <Users size={32} className="text-emerald-400" />
                    <Monitor size={32} className="text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: 'Expert Courses', desc: 'Learn from industry leaders' },
              { icon: Award, title: 'Certifications', desc: 'Earn recognized credentials' },
              { icon: Users, title: 'Global Community', desc: 'Connect with professionals' },
              { icon: TrendingUp, title: 'Career Growth', desc: 'Advance your expertise' },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl hover:bg-emerald-50 transition-colors">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <item.icon className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {sectors.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Explore Popular Subjects</h2>
              <p className="text-xl text-gray-600">Comprehensive training across all waste management sectors</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {sectors.map((sector) => (
                <Link
                  key={sector.id}
                  to={`/courses?sector=${sector.slug}`}
                  className="bg-white p-6 rounded-xl text-center hover:shadow-lg hover:scale-105 transition-all border-2 border-transparent hover:border-emerald-500"
                >
                  <div className="text-4xl mb-3">{sector.icon || '📚'}</div>
                  <h3 className="font-semibold text-gray-900">{sector.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Featured Courses</h2>
                <p className="text-xl text-gray-600">Start your learning journey today</p>
              </div>
              <Link
                to="/courses"
                className="hidden sm:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View All <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <BookOpen className="text-white" size={64} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                        {course.level}
                      </span>
                      {course.duration && (
                        <span className="text-sm text-gray-600">{course.duration}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-emerald-600">
                        {course.price > 0 ? `£${course.price}` : 'Free'}
                      </span>
                      <span className="text-emerald-600 font-semibold">Learn More →</span>
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

      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img
                    src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/testimonials/wasteinstitute-image2.jpg"
                    alt="Students in learning environment"
                    className="w-full h-[600px] object-cover"
                    width="800"
                    height="600"
                    loading="lazy"
                  />

                  <div className="absolute bottom-4 left-4 animate-bounce">
                    <img
                      src="https://hckahrhomcgnvshwkabd.supabase.co/storage/v1/object/public/media/icons/white-icon.png"
                      width="64"
                      height="64"
                      loading="lazy"
                      alt="Waste Institute"
                      className="w-12 h-12 drop-shadow-lg"
                    />
                  </div>

                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-16 right-12 text-yellow-300 animate-float">
                      <Sparkles size={27} className="fill-current" />
                    </div>
                    <div className="absolute top-32 left-16 text-yellow-400 animate-float-delayed">
                      <Sparkles size={24} className="fill-current" />
                    </div>
                    <div className="absolute bottom-40 right-20 text-yellow-300 animate-float-slow">
                      <Sparkles size={30} className="fill-current" />
                    </div>
                    <div className="absolute top-1/2 left-8 text-yellow-400 animate-float">
                      <Sparkles size={21} className="fill-current" />
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-5 shadow-2xl animate-fade-in-up border border-white border-opacity-20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-300">Community Active</span>
                    </div>
                    <p className="text-xl font-handwriting text-white font-semibold animate-text-wave">
                      "Amazing community!"
                    </p>
                    <div className="flex gap-3 mt-3">
                      <Users size={32} className="text-emerald-400" />
                      <Video size={32} className="text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
                  <p className="text-xl text-gray-600">Real stories from waste management professionals</p>
                </div>

                <div className="space-y-6 max-h-[600px] overflow-hidden">
                  <div className="animate-scroll-slow space-y-6">
                    {testimonials.concat(testimonials).map((testimonial, idx) => (
                      <div
                        key={`${testimonial.id}-${idx}`}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-200"
                      >
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <Quote className="text-emerald-300 mb-3" size={28} />
                        <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.testimonial_text}</p>
                        <div className="flex items-center gap-3">
                          {testimonial.student_image ? (
                            <img
                              src={testimonial.student_image}
                              alt={testimonial.student_name}
                              className="w-12 h-12 rounded-full object-cover"
                              width="48"
                              height="48"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-700 font-bold text-lg">
                                {testimonial.student_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{testimonial.student_name}</p>
                            <p className="text-sm text-gray-600">{testimonial.student_title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">News and Articles</h2>
                <p className="text-xl text-gray-600">Latest updates from the waste management industry</p>
              </div>
              <Link
                to="/news"
                className="hidden sm:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                View All <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {news.map((article) => (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(article.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gradient-to-br from-emerald-700 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-emerald-50">
            Join thousands of professionals advancing their careers in waste management
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Today
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Lightbulb className="text-emerald-600" size={32} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Waste Management Expertise at Your Fingertips
              </h2>
              <p className="text-xl text-gray-600">
                Common questions answered by industry experts
              </p>
            </div>

            <div className="space-y-8">
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Recycle className="text-emerald-600" size={28} />
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = faqs.slice(0, categoryIndex).reduce((acc, cat) => acc + cat.questions.length, 0) + faqIndex;
                      const isOpen = openFaqIndex === globalIndex;

                      return (
                        <div
                          key={faqIndex}
                          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : globalIndex)}
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
                              <p className="text-gray-700 leading-relaxed">
                                {faq.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                Have more questions? Our expert-led courses provide in-depth answers and practical knowledge.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-md"
              >
                Explore Our Courses
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
