import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  BookOpen,
  Search,
  ClipboardCheck,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCourseHealthSummaries } from '../../lib/ai/courseGeneration';
import type { CourseHealthSummary, AIGenerationJob } from '../../types/ai';
import { CourseGenerationModal } from '../../components/admin/CourseGenerationModal';
import { SEOOptimiserTool } from '../../components/admin/SEOOptimiserTool';
import { CourseAuditorPanel } from '../../components/admin/CourseAuditorPanel';

type TabView = 'overview' | 'generate' | 'audit' | 'seo';

export default function AICourseDirector() {
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [courses, setCourses] = useState<CourseHealthSummary[]>([]);
  const [recentJobs, setRecentJobs] = useState<AIGenerationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthData, jobsData] = await Promise.all([
        getCourseHealthSummaries(),
        loadRecentJobs(),
      ]);
      setCourses(healthData);
      setRecentJobs(jobsData);
    } catch (error) {
      console.error('Error loading AI Director data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentJobs = async (): Promise<AIGenerationJob[]> => {
    const { data } = await supabase
      .from('ai_generation_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    return (data as AIGenerationJob[]) || [];
  };

  const healthyCourses = courses.filter((c) => c.status === 'healthy').length;
  const attentionCourses = courses.filter((c) => c.status === 'needs_attention').length;
  const criticalCourses = courses.filter((c) => c.status === 'critical').length;
  const avgScore = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.overall_score, 0) / courses.length)
    : 0;

  const tabs: { id: TabView; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'generate', label: 'Generate Content', icon: Plus },
    { id: 'audit', label: 'Course Auditor', icon: ClipboardCheck },
    { id: 'seo', label: 'SEO Optimiser', icon: Search },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
            <Brain className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Course Director</h1>
            <p className="text-sm text-gray-500">Intelligent course creation, auditing, and optimisation</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Courses</span>
            <BookOpen size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={12} /> {healthyCourses} healthy
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <AlertTriangle size={12} /> {attentionCourses}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircle size={12} /> {criticalCourses}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Average Quality</span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                avgScore >= 75 ? 'bg-emerald-500' : avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${avgScore}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">AI Jobs (Recent)</span>
            <Zap size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{recentJobs.length}</p>
          <div className="mt-2 text-xs text-gray-500">
            {recentJobs.filter((j) => j.status === 'completed').length} completed,{' '}
            {recentJobs.filter((j) => j.status === 'processing').length} in progress
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Tokens Used</span>
            <BarChart3 size={18} className="text-teal-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {recentJobs.reduce((sum, j) => sum + (j.tokens_used || 0), 0).toLocaleString()}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            ${recentJobs.reduce((sum, j) => sum + (j.cost_usd || 0), 0).toFixed(4)} estimated cost
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          courses={courses}
          recentJobs={recentJobs}
          onGenerateNew={() => setShowGenerateModal(true)}
          onAuditCourse={(id) => {
            setSelectedCourseId(id);
            setActiveTab('audit');
          }}
          onOptimiseSEO={(id) => {
            setSelectedCourseId(id);
            setActiveTab('seo');
          }}
        />
      )}

      {activeTab === 'generate' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Content Generation</h2>
              <p className="text-sm text-gray-500 mt-1">Generate courses, lessons, quizzes, and case studies with AI</p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} />
              New Course
            </button>
          </div>
          <RecentJobsList jobs={recentJobs} />
        </div>
      )}

      {activeTab === 'audit' && (
        <CourseAuditorPanel
          courseId={selectedCourseId}
          courses={courses}
          onSelectCourse={setSelectedCourseId}
        />
      )}

      {activeTab === 'seo' && (
        <SEOOptimiserTool
          courseId={selectedCourseId}
          courses={courses}
          onSelectCourse={setSelectedCourseId}
        />
      )}

      {showGenerateModal && (
        <CourseGenerationModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={() => {
            setShowGenerateModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function OverviewTab({
  courses,
  recentJobs,
  onGenerateNew,
  onAuditCourse,
  onOptimiseSEO,
}: {
  courses: CourseHealthSummary[];
  recentJobs: AIGenerationJob[];
  onGenerateNew: () => void;
  onAuditCourse: (id: string) => void;
  onOptimiseSEO: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onGenerateNew}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left group"
        >
          <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
            <Plus size={24} className="text-emerald-700" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Generate New Course</h3>
          <p className="text-sm text-gray-500">Create a complete course structure from a topic brief</p>
        </button>

        <button
          onClick={() => courses[0] && onAuditCourse(courses[0].course_id)}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group"
        >
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <ClipboardCheck size={24} className="text-blue-700" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Audit Courses</h3>
          <p className="text-sm text-gray-500">Review courses against quality and compliance standards</p>
        </button>

        <button
          onClick={() => courses[0] && onOptimiseSEO(courses[0].course_id)}
          className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all text-left group"
        >
          <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
            <Search size={24} className="text-teal-700" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">SEO Optimiser</h3>
          <p className="text-sm text-gray-500">Optimise course SEO metadata and keywords</p>
        </button>
      </div>

      {/* Course Health Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Course Health Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Modules</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Lessons</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Last Audit</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.course_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{course.course_title}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      course.overall_score >= 75
                        ? 'bg-emerald-100 text-emerald-700'
                        : course.overall_score >= 50
                        ? 'bg-amber-100 text-amber-700'
                        : course.overall_score > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {course.overall_score > 0 ? `${course.overall_score}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{course.module_count}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{course.lesson_count}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={course.status} />
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-gray-500">
                    {course.last_audit
                      ? new Date(course.last_audit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onAuditCourse(course.course_id)}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium"
                      >
                        Audit
                      </button>
                      <button
                        onClick={() => onOptimiseSEO(course.course_id)}
                        className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 transition-colors font-medium"
                      >
                        SEO
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No courses found. Create your first course to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      {recentJobs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent AI Activity</h2>
          </div>
          <RecentJobsList jobs={recentJobs.slice(0, 5)} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    healthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Healthy' },
    needs_attention: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Needs Work' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
  }[status] || { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Unknown' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

function RecentJobsList({ jobs }: { jobs: AIGenerationJob[] }) {
  const jobTypeLabels: Record<string, string> = {
    course_generate: 'Course Generation',
    lesson_generate: 'Lesson Generation',
    quiz_generate: 'Quiz Generation',
    case_study_generate: 'Case Study',
    seo_optimise: 'SEO Optimisation',
    course_audit: 'Course Audit',
    bulk_seo: 'Bulk SEO',
    content_enhance: 'Content Enhancement',
  };

  const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
    completed: { icon: CheckCircle2, color: 'text-emerald-500' },
    processing: { icon: RefreshCw, color: 'text-blue-500' },
    pending: { icon: Clock, color: 'text-gray-400' },
    failed: { icon: XCircle, color: 'text-red-500' },
    cancelled: { icon: XCircle, color: 'text-gray-400' },
  };

  return (
    <div className="divide-y divide-gray-100">
      {jobs.map((job) => {
        const StatusIcon = statusConfig[job.status]?.icon || Clock;
        const statusColor = statusConfig[job.status]?.color || 'text-gray-400';

        return (
          <div key={job.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon size={18} className={`${statusColor} ${job.status === 'processing' ? 'animate-spin' : ''}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {jobTypeLabels[job.job_type] || job.job_type}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(job.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              {job.tokens_used > 0 && (
                <p className="text-xs text-gray-500">{job.tokens_used.toLocaleString()} tokens</p>
              )}
              {job.progress > 0 && job.progress < 100 && (
                <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${job.progress}%` }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
      {jobs.length === 0 && (
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          No AI generation jobs yet. Generate your first course to get started.
        </div>
      )}
    </div>
  );
}
