import { useState, useEffect } from 'react';
import {
  Search,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Globe,
  Tag,
  FileText,
  Wand2,
  Code,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { optimiseSEO, applySEOResults } from '../../lib/ai/courseGeneration';
import type { CourseHealthSummary, SEOOptimisationResult, SEOOptimisationInput } from '../../types/ai';

interface Props {
  courseId: string | null;
  courses: CourseHealthSummary[];
  onSelectCourse: (id: string) => void;
}

export function SEOOptimiserTool({ courseId, courses, onSelectCourse }: Props) {
  const [loading, setLoading] = useState(false);
  const [optimising, setOptimising] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<SEOOptimisationResult | null>(null);
  const [courseData, setCourseData] = useState<{
    title: string;
    description: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    slug: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  const [showStructuredData, setShowStructuredData] = useState(false);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
      setResult(null);
      setApplied(false);
    }
  }, [courseId]);

  const loadCourseData = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('title, description, seo_title, seo_description, seo_keywords, slug')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourseData(data);
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimise = async () => {
    if (!courseId || !courseData) return;
    setOptimising(true);
    setError('');
    setApplied(false);

    try {
      const input: SEOOptimisationInput = {
        course_id: courseId,
        title: courseData.title,
        description: courseData.description,
        current_seo_title: courseData.seo_title,
        current_seo_description: courseData.seo_description,
        current_seo_keywords: courseData.seo_keywords,
      };

      const seoResult = await optimiseSEO(input);
      setResult(seoResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Optimisation failed');
    } finally {
      setOptimising(false);
    }
  };

  const handleApply = async () => {
    if (!courseId || !result) return;
    setApplying(true);

    try {
      await applySEOResults(courseId, result);
      setApplied(true);
      await loadCourseData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply changes');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">SEO Optimiser</h2>
            <p className="text-sm text-gray-500 mt-1">
              Analyse and optimise course metadata, keywords, and structured data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={courseId || ''}
            onChange={(e) => onSelectCourse(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_title}
              </option>
            ))}
          </select>
          <button
            onClick={handleOptimise}
            disabled={!courseId || optimising}
            className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {optimising ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wand2 size={16} />
            )}
            {optimising ? 'Analysing...' : 'Optimise SEO'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Current vs Suggested */}
      {courseData && result && (
        <div className="space-y-4">
          {/* Title Comparison */}
          <ComparisonCard
            label="SEO Title"
            icon={FileText}
            current={courseData.seo_title || 'Not set'}
            suggested={result.seo_title}
            maxLength={60}
          />

          {/* Description Comparison */}
          <ComparisonCard
            label="Meta Description"
            icon={Globe}
            current={courseData.seo_description || 'Not set'}
            suggested={result.seo_description}
            maxLength={160}
          />

          {/* Keywords */}
          <ComparisonCard
            label="Keywords"
            icon={Tag}
            current={courseData.seo_keywords || 'Not set'}
            suggested={result.seo_keywords}
          />

          {/* URL Slug */}
          <ComparisonCard
            label="URL Slug"
            icon={Globe}
            current={courseData.slug || 'Not set'}
            suggested={result.slug_suggestion}
          />

          {/* Keyword Analysis */}
          {result.keyword_analysis && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Keyword Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Primary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.primary.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Secondary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.secondary.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Long-tail</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.long_tail.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Structured Data */}
          {result.structured_data && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowStructuredData(!showStructuredData)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-gray-500" />
                  <span className="text-sm font-bold text-gray-900">Structured Data (JSON-LD)</span>
                </div>
                <span className="text-xs text-gray-500">
                  {showStructuredData ? 'Hide' : 'Show'}
                </span>
              </button>
              {showStructuredData && (
                <div className="px-6 pb-4">
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
                    {JSON.stringify(result.structured_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Apply Button */}
          <div className="flex items-center justify-end gap-4">
            {applied ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={18} />
                <span className="text-sm font-medium">Changes applied successfully</span>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={applying}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {applying ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {applying ? 'Applying...' : 'Apply Changes'}
              </button>
            )}
          </div>
        </div>
      )}

      {!result && !loading && courseId && !optimising && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Click "Optimise SEO" to analyse this course.</p>
          <p className="text-sm text-gray-400 mt-1">AI will suggest improvements for title, description, keywords, and structured data.</p>
        </div>
      )}
    </div>
  );
}

function ComparisonCard({
  label,
  icon: Icon,
  current,
  suggested,
  maxLength,
}: {
  label: string;
  icon: React.ElementType;
  current: string;
  suggested: string;
  maxLength?: number;
}) {
  const isChanged = current !== suggested;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-500 uppercase">{label}</span>
        {maxLength && (
          <span className={`text-xs ml-auto ${
            suggested.length > maxLength ? 'text-red-500' : 'text-gray-400'
          }`}>
            {suggested.length}/{maxLength}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
        <div className={`p-3 rounded-lg text-sm ${isChanged ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
          <p className="text-xs font-medium text-gray-500 mb-1">Current</p>
          <p className={`${isChanged ? 'text-red-700 line-through' : 'text-gray-700'}`}>
            {current || <span className="italic text-gray-400">Not set</span>}
          </p>
        </div>
        {isChanged && (
          <ArrowRight size={16} className="text-gray-300 self-center hidden md:block" />
        )}
        {isChanged && (
          <div className="p-3 rounded-lg text-sm bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-medium text-emerald-600 mb-1">Suggested</p>
            <p className="text-emerald-800">{suggested}</p>
          </div>
        )}
      </div>
    </div>
  );
}
