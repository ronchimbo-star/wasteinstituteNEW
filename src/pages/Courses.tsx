import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { BookOpen, Clock, TrendingUp, Filter, X, Star, Quote } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured_image: string;
  level: string;
  duration: string;
  price: number;
  sector_id: string | null;
}

interface Sector {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Testimonial {
  id: string;
  student_name: string;
  student_title: string;
  student_image: string;
  rating: number;
  testimonial_text: string;
}

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const selectedSector = searchParams.get('sector');

  useEffect(() => {
    loadData();
  }, [selectedSector]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load sectors
      const { data: sectorsData } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order');

      if (sectorsData) setSectors(sectorsData);

      // Load testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('published', true)
        .order('display_order')
        .limit(3);

      if (testimonialsData) setTestimonials(testimonialsData);

      // Load courses with optional sector filter
      let query = supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (selectedSector) {
        // Find sector by slug
        const sector = sectorsData?.find((s) => s.slug === selectedSector);
        if (sector) {
          query = query.eq('sector_id', sector.id);
        }
      }

      const { data: coursesData } = await query;

      if (coursesData) setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorFilter = (sectorSlug: string | null) => {
    if (sectorSlug) {
      setSearchParams({ sector: sectorSlug });
    } else {
      setSearchParams({});
    }
    setShowMobileFilters(false);
  };

  const selectedSectorName = sectors.find((s) => s.slug === selectedSector)?.name;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Waste Management Courses",
    "itemListElement": courses.map((course, index) => ({
      "@type": "Course",
      "position": index + 1,
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "Waste Institute"
      },
      "url": `https://wasteinstitute.org/courses/${course.slug}`
    }))
  };

  return (
    <Layout>
      <SEO
        title="Browse Waste Management Courses | Waste Institute"
        description="Explore our full catalogue of waste management courses. From introductory modules to advanced certifications, learn from leading industry professionals."
        canonical="https://wasteinstitute.org/courses"
        structuredData={structuredData}
      />
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Course Catalog</h1>
          <p className="text-xl text-emerald-50 max-w-2xl">
            Explore our comprehensive collection of waste management courses designed by industry experts
          </p>
        </div>
      </div>

      <div className="bg-white py-8 border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-600" />
              <span className="font-semibold text-gray-900">Filter by Sector:</span>
            </div>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Filter size={18} />
              Filters
            </button>
          </div>

          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block mt-4`}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSectorFilter(null)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  !selectedSector
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Sectors
              </button>
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => handleSectorFilter(sector.slug)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    selectedSector === sector.slug
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{sector.icon}</span>
                  <span>{sector.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {selectedSector && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-gray-700">Showing courses in:</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                {selectedSectorName}
                <button
                  onClick={() => handleSectorFilter(null)}
                  className="hover:bg-emerald-200 rounded-full p-1 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                {selectedSector
                  ? 'No courses available in this sector yet.'
                  : 'No courses available yet.'}
              </p>
              {selectedSector && (
                <button
                  onClick={() => handleSectorFilter(null)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  View All Courses
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-700">
                <span className="font-semibold">{courses.length}</span>{' '}
                {courses.length === 1 ? 'course' : 'courses'} found
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500 group flex flex-col"
                  >
                    {course.featured_image ? (
                      <div className="h-48 overflow-hidden flex-shrink-0">
                        <img
                          src={course.featured_image}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="text-white" size={64} />
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          {course.level}
                        </span>
                        {course.duration && (
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock size={14} />
                            {course.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors min-h-[3.5rem]">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{course.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <span className="text-2xl font-bold text-emerald-600">
                          {course.price > 0 ? `£${course.price}` : 'Free'}
                        </span>
                        <span className="text-emerald-600 font-semibold group-hover:gap-2 transition-all flex items-center gap-1">
                          Learn More
                          <TrendingUp size={18} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {testimonials.length > 0 && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600">Hear from professionals who completed our courses</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="text-emerald-200 mb-3" size={28} />
                  <p className="text-gray-700 mb-6 line-clamp-3">{testimonial.testimonial_text}</p>
                  <div className="flex items-center gap-3">
                    {testimonial.student_image ? (
                      <img
                        src={testimonial.student_image}
                        alt={testimonial.student_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-700 font-bold">
                          {testimonial.student_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.student_name}</p>
                      <p className="text-xs text-gray-600">{testimonial.student_title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
