import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  Download,
  ArrowLeft,
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
  sector_id: string | null;
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

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [processingLesson, setProcessingLesson] = useState<string | null>(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCourse();
    }
  }, [slug, user]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      // Load course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (courseError || !courseData) {
        console.error('Course not found:', courseError);
        navigate('/courses');
        return;
      }

      setCourse(courseData);

      // Load modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('display_order');

      if (modulesData) {
        // Load lessons for each module
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

        // Load user progress if authenticated
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

          // Check if user has a certificate for this course
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

        // Add completion status to lessons
        const modulesWithProgress = modulesWithLessons.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            completed: progress.find((p) => p.lesson_id === lesson.id)?.completed || false,
          })),
        }));

        setModules(modulesWithProgress);
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

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
        // Mark as incomplete
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);

        setProgress((prev) => prev.filter((p) => p.lesson_id !== lessonId));
      } else {
        // Mark as complete
        const { error } = await supabase.from('user_progress').upsert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });

        if (error) throw error;

        setProgress((prev) => [...prev.filter((p) => p.lesson_id !== lessonId), { lesson_id: lessonId, completed: true }]);
      }

      // Reload course to update progress
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
      // Generate unique certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { error } = await supabase.from('certificates').insert({
        certificate_id: certificateId,
        user_id: user.id,
        course_id: course.id,
        issued_date: new Date().toISOString(),
      });

      if (error) throw error;

      // Reload course to get certificate
      await loadCourse();
      alert(`Congratulations! Your certificate ${certificateId} has been generated.`);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingCertificate(false);
    }
  };

  // Calculate progress percentage
  const totalLessons = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, module) => sum + module.lessons.filter((l) => l.completed).length,
    0
  );
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Waste Institute",
      "url": "https://wasteinstitute.org"
    },
    "courseMode": "online",
    "url": `https://wasteinstitute.org/courses/${course.slug}`
  };

  return (
    <Layout>
      <SEO
        title={`${course.title} | Waste Institute`}
        description={truncatedDescription}
        canonical={`https://wasteinstitute.org/courses/${course.slug}`}
        structuredData={structuredData}
      />
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
                <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-semibold rounded-full">
                  {course.level}
                </span>
                {course.duration && (
                  <span className="flex items-center gap-2 text-emerald-50">
                    <Clock size={16} />
                    {course.duration}
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-emerald-50 mb-6">{course.description}</p>

              {user && totalLessons > 0 && (
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">Your Progress</span>
                    <span className="text-xl font-bold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
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

            <div className="lg:col-span-1">
              {course.featured_image ? (
                <img
                  src={course.featured_image}
                  alt={course.title}
                  className="w-full rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-video bg-white bg-opacity-10 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center">
                  <BookOpen size={80} className="text-white opacity-50" />
                </div>
              )}

              <div className="mt-6 bg-white rounded-xl shadow-lg p-6 text-gray-900">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {course.price > 0 ? `£${course.price}` : 'Free'}
                  </div>
                  {course.price > 0 && <p className="text-sm text-gray-600">One-time payment</p>}
                </div>

                {!user ? (
                  <Link
                    to="/signup"
                    className="block w-full py-3 bg-emerald-600 text-white text-center rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Enroll Now
                  </Link>
                ) : certificate ? (
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-4 text-center">
                    <Award className="mx-auto text-emerald-600 mb-2" size={32} />
                    <p className="font-semibold text-emerald-900 mb-2">Certificate Earned!</p>
                    <p className="text-sm text-emerald-700 mb-3">ID: {certificate.certificate_id}</p>
                    <button className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm flex items-center gap-1 mx-auto">
                      <Download size={16} />
                      Download Certificate
                    </button>
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Course Content</h2>

            {modules.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No modules available yet.</p>
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
                    <div key={module.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                        <div className="border-t border-gray-200 bg-gray-50">
                          {module.lessons.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-600">
                              No lessons in this module yet.
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-200">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="px-6 py-4 hover:bg-white transition-colors"
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
      </div>
    </Layout>
  );
}
