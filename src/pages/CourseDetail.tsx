import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  Download,
  ArrowLeft,
  ShieldCheck,
  Users,
  Sparkles,
} from 'lucide-react';

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
  syllabus: string | null;
  sector_id: string | null;
  seo_title: string;
  seo_description: string;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  display_order: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string;
  resources: Array<{ name: string; url: string }>;
  display_order: number;
  duration: number;
}

interface ModuleWithLessons extends Module {
  lessons: (Lesson & { completed: boolean })[];
}

interface UserProgress {
  lesson_id: string;
  completed: boolean;
}

interface Certificate {
  id: string;
  certificate_id: string;
  issued_date: string;
}

interface RelatedCourse {
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  duration: string;
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jumpToLesson = searchParams.get('lesson');
  const { user, loading: authLoading } = useAuth();
  const lessonRefs = useRef<Record<string, HTMLElement | null>>({});

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [processingLesson, setProcessingLesson] = useState<string | null>(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadCourse();
    }
  }, [slug, user]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (courseError || !courseData) {
        console.error('Course not found:', courseError);
        navigate('/courses');
        return;
      }

      setCourse(courseData);

      // Check enrollment status
      if (user) {
        const { data: enrollment } = await supabase
          .from('course_enrollments')
          .select('status')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .maybeSingle();

        if (enrollment) {
          setEnrollmentStatus(enrollment.status);
        }
      }

      // Load modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('display_order');

      if (modulesData) {
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('display_order');

            return {
              ...module,
              lessons: lessonsData || [],
            };
          })
        );

        if (user) {
          const lessonIds = modulesWithLessons.flatMap((m) => m.lessons.map((l) => l.id));

          const { data: progressData } = await supabase
            .from('user_progress')
            .select('lesson_id, completed')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          if (progressData) {
            setProgress(progressData);
          }

          const { data: certData } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseData.id)
            .maybeSingle();

          if (certData) {
            setCertificate(certData);
          }
        }

        const modulesWithProgress = modulesWithLessons.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            completed: progress.find((p) => p.lesson_id === lesson.id)?.completed || false,
          })),
        }));

        setModules(modulesWithProgress);
      }

      // Load related courses from the same sector
      if (courseData.sector_id) {
        const { data: related } = await supabase
          .from('courses')
          .select('id, title, slug, price, original_price, duration')
          .eq('published', true)
          .is('deleted_at', null)
          .eq('sector_id', courseData.sector_id)
          .neq('id', courseData.id)
          .limit(3);

        if (related) setRelatedCourses(related);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jumpToLesson || modules.length === 0 || loading) return;
    const parentModule = modules.find(m => m.lessons.some(l => l.id === jumpToLesson));
    if (parentModule) {
      setExpandedModules(prev => new Set([...prev, parentModule.id]));
      setTimeout(() => {
        const el = lessonRefs.current[jumpToLesson];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [jumpToLesson, modules, loading]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleMarkComplete = async (lessonId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setProcessingLesson(lessonId);
    try {
      const isCompleted = progress.find((p) => p.lesson_id === lessonId)?.completed;

      if (isCompleted) {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);

        setProgress((prev) => prev.filter((p) => p.lesson_id !== lessonId));
      } else {
        const { error } = await supabase.from('user_progress').upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

        if (error) throw error;

        setProgress((prev) => [...prev.filter((p) => p.lesson_id !== lessonId), { lesson_id: lessonId, completed: true }]);
      }

      await loadCourse();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setProcessingLesson(null);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!user || !course) return;

    setGeneratingCertificate(true);
    try {
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { error } = await supabase.from('certificates').insert({
        certificate_id: certificateId,
        user_id: user.id,
        course_id: course.id,
        issued_date: new Date().toISOString(),
      });

      if (error) throw error;

      await loadCourse();
      alert(`Congratulations! Your certificate ${certificateId} has been generated.`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleEnrol = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/courses/${slug}`));
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: course.id,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed (${response.status})`);
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, module) => sum + module.lessons.filter((l) => l.completed).length,
    0
  );
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Parse syllabus for display
  let syllabusModules: { title: string }[] = [];
  if (course?.syllabus) {
    try {
      syllabusModules = JSON.parse(course.syllabus);
    } catch {
      syllabusModules = [];
    }
  }

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading course...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <SEO
          title="Course Not Found | Waste Institute"
          description="The course you're looking for could not be found."
          canonical={`https://wasteinstitute.org/courses/${slug}`}
          noindex={true}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
            <Link to="/courses" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Back to Courses
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const truncatedDescription = course.description.length > 155
    ? course.description.substring(0, 155) + '...'
    : course.description;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "Waste Institute"
      },
      "courseMode": "online",
      "url": `https://wasteinstitute.org/courses/${course.slug}`
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wasteinstitute.org/" },
        { "@type": "ListItem", "position": 2, "name": "Courses", "item": "https://wasteinstitute.org/courses/" },
        { "@type": "ListItem", "position": 3, "name": course.title, "item": `https://wasteinstitute.org/courses/${course.slug}` }
      ]
    }
  ];

  const isEnrolled = enrollmentStatus === 'enrolled';

  return (
    <Layout>
      <SEO
        title={course.seo_title || `${course.title} | Waste Institute`}
        description={course.seo_description || truncatedDescription}
        canonical={`https://wasteinstitute.org/courses/${course.slug}`}
        structuredData={structuredData}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 text-white py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-emerald-50 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                  <Award size={14} />
                  Certificate included
                </span>
                {course.duration && (
                  <span className="flex items-center gap-2 text-emerald-50">
                    <Clock size={16} />
                    {course.duration}
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-emerald-50 mb-6">{course.description}</p>

              {user && totalLessons > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Your Progress</span>
                    <span className="text-xl font-bold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-sm text-emerald-50">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
              )}
            </div>

            {/* Pricing card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900 sticky top-24">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-3 mb-2">
                    <span className="text-4xl font-bold text-emerald-600">
                      £{course.price}
                    </span>
                    {course.original_price && (
                      <span className="text-2xl text-gray-400 line-through">
                        £{course.original_price}
                      </span>
                    )}
                  </div>
                  {course.original_price && (
                    <p className="text-sm font-medium text-emerald-600 mb-1">
                      Save £{course.original_price - course.price}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">One-time payment</p>
                </div>

                {isEnrolled ? (
                  certificate ? (
                    <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4 text-center">
                      <Award className="mx-auto text-emerald-600 mb-2" size={32} />
                      <p className="font-semibold text-emerald-900 mb-2">Certificate Earned!</p>
                      <p className="text-sm text-emerald-700 mb-3">ID: {certificate.certificate_id}</p>
                      <Link to="/verify" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-1 justify-center">
                        <Download size={16} />
                        View Certificate
                      </Link>
                    </div>
                  ) : progressPercentage === 100 ? (
                    <button
                      onClick={handleGenerateCertificate}
                      disabled={generatingCertificate}
                      className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {generatingCertificate ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Award size={20} />
                          Get Your Certificate
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">
                        Complete all lessons to earn your certificate
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{progressPercentage}% complete</p>
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleEnrol}
                    disabled={enrolling}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Redirecting...
                      </>
                    ) : (
                      <>Enrol Now</>
                    )}
                  </button>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    14-day money-back guarantee
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award size={16} className="text-emerald-600" />
                    Verifiable certificate included
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} className="text-emerald-600" />
                    Self-paced, complete on any device
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What you'll learn */}
      {syllabusModules.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syllabusModules.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={22} />
                    <span className="text-gray-700">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Who this course is for */}
      {course.target_audience && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who This Course Is For</h2>
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="text-emerald-600" size={28} />
                  </div>
                  <p className="text-lg text-gray-700">{course.target_audience}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Course curriculum */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
            <p className="text-gray-600 mb-8">
              {course.duration}
            </p>

            {modules.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Course content is being prepared. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => {
                  const isExpanded = expandedModules.has(module.id);
                  const completedInModule = module.lessons.filter((l) => l.completed).length;
                  const totalInModule = module.lessons.length;
                  const moduleProgress =
                    totalInModule > 0 ? Math.round((completedInModule / totalInModule) * 100) : 0;

                  return (
                    <div key={module.id} className="bg-gray-50 rounded-xl shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start gap-4 text-left flex-1">
                          <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                            {moduleIndex + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{module.title}</h3>
                            {module.description && (
                              <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{totalInModule} {totalInModule === 1 ? 'lesson' : 'lessons'}</span>
                              {user && (
                                <span className="text-emerald-600 font-semibold">
                                  {moduleProgress}% Complete
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {isExpanded ? (
                            <ChevronUp className="text-gray-400" size={24} />
                          ) : (
                            <ChevronDown className="text-gray-400" size={24} />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-white">
                          {module.lessons.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-600">
                              Lessons coming soon.
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  ref={el => { lessonRefs.current[lesson.id] = el; }}
                                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${jumpToLesson === lesson.id ? 'ring-2 ring-inset ring-emerald-500 bg-emerald-50' : ''}`}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 pt-1">
                                      {lesson.completed ? (
                                        <CheckCircle2 className="text-emerald-600" size={24} />
                                      ) : (
                                        <Circle className="text-gray-300" size={24} />
                                      )}
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <h4 className="font-semibold text-gray-900 mb-1">
                                            {lessonIndex + 1}. {lesson.title}
                                          </h4>
                                          {lesson.duration > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                              <Clock size={14} />
                                              {lesson.duration} min
                                            </div>
                                          )}
                                          {lesson.video_url && (
                                            <div className="flex items-center gap-1 text-sm text-emerald-600 mb-2">
                                              <PlayCircle size={14} />
                                              Video lesson
                                            </div>
                                          )}
                                          {lesson.resources && lesson.resources.length > 0 && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                              <FileText size={14} />
                                              {lesson.resources.length} resource(s)
                                            </div>
                                          )}
                                        </div>

                                        {user && (
                                          <button
                                            onClick={() => handleMarkComplete(lesson.id)}
                                            disabled={processingLesson === lesson.id}
                                            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                                              lesson.completed
                                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            }`}
                                          >
                                            {processingLesson === lesson.id ? (
                                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            ) : lesson.completed ? (
                                              'Mark Incomplete'
                                            ) : (
                                              'Mark Complete'
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!user && modules.length > 0 && (
              <div className="mt-8 bg-emerald-50 border-2 border-emerald-500 rounded-xl p-8 text-center">
                <Award className="mx-auto text-emerald-600 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign up to track your progress
                </h3>
                <p className="text-gray-700 mb-6">
                  Create a free account to mark lessons as complete and earn your certificate
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Certificate info */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 bg-white rounded-xl shadow-md p-8">
              <div className="flex-shrink-0">
                <Award className="text-emerald-600" size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Certificate</h2>
                <p className="text-gray-700 mb-4">
                  When you complete this course, you'll receive a Certificate of Completion with a unique, verifiable ID. You can display it in your clinic, show it to Environmental Health Officers during inspections, and include it in your marketing materials.
                </p>
                <Link to="/certification" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                  Learn more about certification &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor / Created by MediWaste */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-8">
              <div className="flex-shrink-0 w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <Sparkles className="text-emerald-600" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Created by the Clinical Waste Experts at MediWaste</h2>
                <p className="text-gray-700">
                  This course is developed and maintained by the team at MediWaste, the UK's trusted provider of clinical waste collection and compliance services for healthcare, beauty, and aesthetics businesses. Our courses are built on years of hands-on experience helping real practices stay compliant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Money-back guarantee */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <ShieldCheck className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">14-Day Money-Back Guarantee</h2>
            <p className="text-lg text-gray-700 mb-8">
              We're confident you'll find value in every course. But if you're not satisfied for any reason, contact us within 14 days of purchase for a full refund — no questions asked.
            </p>
            <button
              onClick={handleEnrol}
              disabled={enrolling || isEnrolled}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {enrolling ? 'Redirecting...' : isEnrolled ? 'Already Enrolled' : `Enrol Now for £${course.price}`}
            </button>
          </div>
        </div>
      </section>

      {/* Related courses */}
      {relatedCourses.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedCourses.map((rc) => (
                  <Link
                    key={rc.id}
                    to={`/courses/${rc.slug}`}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-500 transition-all group"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {rc.title}
                    </h3>
                    {rc.duration && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <Clock size={14} />
                        {rc.duration}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-emerald-600">£{rc.price}</span>
                      {rc.original_price && (
                        <span className="text-sm text-gray-400 line-through">£{rc.original_price}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
