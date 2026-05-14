export type AIModel = 'gpt-4o' | 'gpt-4-turbo-preview' | 'gpt-3.5-turbo-16k';

export type JobType =
  | 'course_generate'
  | 'lesson_generate'
  | 'quiz_generate'
  | 'case_study_generate'
  | 'seo_optimise'
  | 'course_audit'
  | 'bulk_seo'
  | 'content_enhance';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type AuditSeverity = 'critical' | 'warning' | 'info' | 'good';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type CaseStudyRegion = 'UK' | 'EU' | 'USA' | 'Africa' | 'Asia';

export interface AIGenerationJob {
  id: string;
  user_id: string;
  job_type: JobType;
  status: JobStatus;
  course_id: string | null;
  input_params: Record<string, unknown>;
  progress: number;
  result: Record<string, unknown> | null;
  error_message: string | null;
  tokens_used: number;
  cost_usd: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AIAuditReport {
  id: string;
  course_id: string;
  generated_by: string;
  overall_score: number;
  completeness_score: number;
  regulatory_score: number;
  engagement_score: number;
  seo_score: number;
  findings: AuditFinding[];
  recommendations: AuditRecommendation[];
  media_suggestions: MediaSuggestion[];
  created_at: string;
}

export interface AuditFinding {
  category: 'completeness' | 'regulatory' | 'engagement' | 'seo';
  severity: AuditSeverity;
  title: string;
  description: string;
  location?: string;
}

export interface AuditRecommendation {
  priority: number;
  category: string;
  action: string;
  estimated_effort: string;
  ai_fixable: boolean;
}

export interface MediaSuggestion {
  type: 'image' | 'diagram' | 'video' | 'infographic';
  context: string;
  description: string;
  generation_prompt: string;
  suggested_colors?: string[];
  placement: string;
}

export interface CourseGenerationInput {
  title: string;
  topic: string;
  level: CourseLevel;
  risk_level: RiskLevel;
  target_hours: number;
  sector: string;
  description?: string;
  target_audience?: string;
  regions?: CaseStudyRegion[];
}

export interface GeneratedCourseOutline {
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  duration: string;
  target_audience: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  modules: GeneratedModuleOutline[];
}

export interface GeneratedModuleOutline {
  title: string;
  description: string;
  display_order: number;
  lessons: GeneratedLessonOutline[];
}

export interface GeneratedLessonOutline {
  title: string;
  duration_minutes: number;
  display_order: number;
  learning_objectives: string[];
  key_topics: string[];
}

export interface LessonGenerationInput {
  course_title: string;
  module_title: string;
  lesson_title: string;
  learning_objectives: string[];
  key_topics: string[];
  level: CourseLevel;
  target_word_count: number;
  include_case_study?: boolean;
  case_study_region?: CaseStudyRegion;
}

export interface GeneratedLesson {
  title: string;
  content: string;
  word_count: number;
  media_suggestions: MediaSuggestion[];
}

export interface QuizGenerationInput {
  course_title: string;
  module_title: string;
  lesson_content: string;
  num_questions: number;
  question_types: ('mcq' | 'true_false' | 'matching')[];
}

export interface GeneratedQuizQuestion {
  question: string;
  type: 'mcq' | 'true_false' | 'matching';
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface SEOOptimisationInput {
  course_id: string;
  title: string;
  description: string;
  current_seo_title?: string;
  current_seo_description?: string;
  current_seo_keywords?: string;
}

export interface SEOOptimisationResult {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  slug_suggestion: string;
  structured_data: Record<string, unknown>;
  keyword_analysis: {
    primary: string[];
    secondary: string[];
    long_tail: string[];
  };
}

export interface CourseHealthSummary {
  course_id: string;
  course_title: string;
  overall_score: number;
  completeness_score: number;
  module_count: number;
  lesson_count: number;
  has_quizzes: boolean;
  last_audit: string | null;
  status: 'healthy' | 'needs_attention' | 'critical';
}
