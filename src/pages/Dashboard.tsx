import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Award, CheckCircle, Clock, Download } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  featured_image: string;
  level: string;
}

interface EnrolledCourse {
  course: Course;
  totalLessons: number;
  completedLessons: number;
  progress: number;
}

interface Certificate {
  id: string;
  certificate_id: string;
  issued_date: string;
  course: {
    title: string;
    slug: string;
  };
}

export default function Dashboard() {
  const { user, profile, isSuperAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (isSuperAdmin) {
        navigate('/admin');
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading, isSuperAdmin, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      await Promise.all([loadEnrolledCourses(), loadCertificates()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledCourses = async () => {
    if (!user) return;

    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select(`
          lesson_id,
          completed,
          lessons (
            id,
            module_id,
            modules (
              course_id
            )
          )
        `)
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      const courseIds = Array.from(
        new Set(
          progressData
            ?.map((p: any) => p.lessons?.modules?.course_id)
            .filter(Boolean) || []
        )
      );

      if (courseIds.length === 0) {
        setEnrolledCourses([]);
        return;
      }

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, slug, featured_image, level')
        .in('id', courseIds);

      if (coursesError) throw coursesError;

      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
          id,
          modules (
            course_id
          )
        `);

      if (lessonsError) throw lessonsError;

      const enrolled: EnrolledCourse[] = (coursesData || []).map((course) => {
        const courseLessons = lessonsData?.filter(
          (l: any) => l.modules?.course_id === course.id
        ) || [];

        const completedLessonIds = new Set(
          progressData
            ?.filter((p: any) => p.completed && p.lessons?.modules?.course_id === course.id)
            .map((p: any) => p.lesson_id) || []
        );

        const totalLessons = courseLessons.length;
        const completedLessons = courseLessons.filter((l: any) =>
          completedLessonIds.has(l.id)
        ).length;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          course,
          totalLessons,
          completedLessons,
          progress,
        };
      });

      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    }
  };

  const loadCertificates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_id,
          issued_date,
          courses (
            title,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('issued_date', { ascending: false });

      if (error) throw error;

      const formattedCertificates = (data || []).map((cert: any) => ({
        id: cert.id,
        certificate_id: cert.certificate_id,
        issued_date: cert.issued_date,
        course: {
          title: cert.courses?.title || 'Unknown Course',
          slug: cert.courses?.slug || '',
        },
      }));

      setCertificates(formattedCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>My Dashboard | Waste Institute</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-emerald-50">Welcome back, {profile?.full_name || 'Student'}!</p>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="text-emerald-600" size={32} />
                  My Courses
                </h2>
                <Link
                  to="/courses"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm sm:text-base"
                >
                  Browse Courses
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center border border-gray-200">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map(({ course, totalLessons, completedLessons, progress }) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.slug}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all border border-gray-200 hover:border-emerald-500"
                    >
                      <div className="h-40 overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600">
                        {course.featured_image ? (
                          <img
                            src={course.featured_image}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="text-white" size={48} />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            {course.level}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{course.title}</h3>

                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <CheckCircle size={16} />
                              {completedLessons} of {totalLessons} lessons
                            </span>
                            <span className="font-semibold text-emerald-600">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {progress === 100 ? (
                          <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                            <CheckCircle size={18} />
                            Completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={18} />
                            In Progress
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Award className="text-emerald-600" size={32} />
                My Certificates
              </h2>

              {certificates.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center border border-gray-200">
                  <Award className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600">
                    Complete courses to earn certificates
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {certificates.map((certificate) => (
                    <div
                      key={certificate.id}
                      className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-emerald-100 p-3 rounded-lg">
                          <Award className="text-emerald-600" size={32} />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {certificate.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        Certificate ID: {certificate.certificate_id}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Issued: {new Date(certificate.issued_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          to={`/verify-certificate?id=${certificate.certificate_id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-sm"
                        >
                          View Certificate
                        </Link>
                        <button
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
                          onClick={() => {
                            console.log('Download certificate:', certificate.certificate_id);
                          }}
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
