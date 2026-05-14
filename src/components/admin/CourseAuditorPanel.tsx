import { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Wand2,
  Image,
  Film,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { auditCourse, getCourseAuditReports } from '../../lib/ai/courseGeneration';
import type { AIAuditReport, CourseHealthSummary, AuditSeverity } from '../../types/ai';

interface Props {
  courseId: string | null;
  courses: CourseHealthSummary[];
  onSelectCourse: (id: string) => void;
}

export function CourseAuditorPanel({ courseId, courses, onSelectCourse }: Props) {
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [report, setReport] = useState<AIAuditReport | null>(null);
  const [error, setError] = useState('');
  const [expandedFindings, setExpandedFindings] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (courseId) {
      loadLatestReport();
    }
  }, [courseId]);

  const loadLatestReport = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const reports = await getCourseAuditReports(courseId);
      if (reports.length > 0) {
        setReport(reports[0]);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error('Error loading audit reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!courseId) return;
    setAuditing(true);
    setError('');

    try {
      const result = await auditCourse(courseId);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed');
    } finally {
      setAuditing(false);
    }
  };

  const toggleFinding = (index: number) => {
    setExpandedFindings((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const severityConfig: Record<AuditSeverity, { icon: React.ElementType; color: string; bg: string }> = {
    critical: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    good: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  };

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Auditor</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review courses against quality, compliance, engagement, and SEO standards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={courseId || ''}
            onChange={(e) => onSelectCourse(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          >
            <option value="">Select a course to audit...</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_title}
              </option>
            ))}
          </select>
          <button
            onClick={handleRunAudit}
            disabled={!courseId || auditing}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {auditing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ClipboardCheck size={16} />
            )}
            {auditing ? 'Auditing...' : 'Run Audit'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="text-emerald-600 animate-spin" />
        </div>
      )}

      {/* Audit Report */}
      {report && !loading && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <ScoreCard label="Overall" score={report.overall_score} icon={BarChart3} />
            <ScoreCard label="Completeness" score={report.completeness_score} icon={ClipboardCheck} />
            <ScoreCard label="Regulatory" score={report.regulatory_score} icon={AlertTriangle} />
            <ScoreCard label="Engagement" score={report.engagement_score} icon={Wand2} />
            <ScoreCard label="SEO" score={report.seo_score} icon={BarChart3} />
          </div>

          {/* Findings */}
          {report.findings && report.findings.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Findings</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {report.findings.filter((f) => f.severity === 'critical').length} critical,{' '}
                  {report.findings.filter((f) => f.severity === 'warning').length} warnings,{' '}
                  {report.findings.filter((f) => f.severity === 'good').length} positive
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {report.findings.map((finding, index) => {
                  const config = severityConfig[finding.severity];
                  const Icon = config.icon;
                  const isExpanded = expandedFindings.has(index);

                  return (
                    <div key={index} className="px-6 py-3">
                      <button
                        onClick={() => toggleFinding(index)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={config.color} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{finding.title}</p>
                            {finding.location && (
                              <p className="text-xs text-gray-500">{finding.location}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
                            {finding.category}
                          </span>
                          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="mt-2 ml-9 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {finding.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {report.recommendations.map((rec, index) => (
                  <div key={index} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {rec.priority}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rec.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{rec.category}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">{rec.estimated_effort}</span>
                        </div>
                      </div>
                    </div>
                    {rec.ai_fixable && (
                      <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors">
                        <Wand2 size={12} />
                        Fix with AI
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Suggestions */}
          {report.media_suggestions && report.media_suggestions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Media Suggestions</h3>
                <p className="text-xs text-gray-500 mt-1">
                  AI-recommended images, diagrams, and videos to enhance the course
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {report.media_suggestions.map((media, index) => {
                  const typeIcons: Record<string, React.ElementType> = {
                    image: Image,
                    diagram: BarChart3,
                    video: Film,
                    infographic: BarChart3,
                  };
                  const MediaIcon = typeIcons[media.type] || Image;

                  return (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <MediaIcon size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium uppercase">
                              {media.type}
                            </span>
                            <span className="text-xs text-gray-500">{media.placement}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{media.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{media.context}</p>
                          {media.generation_prompt && (
                            <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-xs font-medium text-gray-700 mb-1">AI Generation Prompt:</p>
                              <p className="text-xs text-gray-600 font-mono">{media.generation_prompt}</p>
                            </div>
                          )}
                          {media.suggested_colors && media.suggested_colors.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">Colours:</span>
                              {media.suggested_colors.map((color, ci) => (
                                <span
                                  key={ci}
                                  className="w-5 h-5 rounded-md border border-gray-200"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            Report generated {new Date(report.created_at).toLocaleString('en-GB')}
          </p>
        </div>
      )}

      {!report && !loading && courseId && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No audit report available for this course.</p>
          <p className="text-sm text-gray-400 mt-1">Run an audit to get a quality assessment.</p>
        </div>
      )}
    </div>
  );
}

function ScoreCard({
  label,
  score,
  icon: Icon,
}: {
  label: string;
  score: number;
  icon: React.ElementType;
}) {
  const color = score >= 75 ? 'emerald' : score >= 50 ? 'amber' : 'red';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <Icon size={14} className={`text-${color}-500`} />
      </div>
      <p className={`text-2xl font-bold text-${color}-700`}>{score}%</p>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full bg-${color}-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
