import { supabase } from '../supabase';
import type {
  AIGenerationJob,
  AIAuditReport,
  CourseGenerationInput,
  LessonGenerationInput,
  QuizGenerationInput,
  SEOOptimisationInput,
  SEOOptimisationResult,
  GeneratedCourseOutline,
  GeneratedLesson,
  GeneratedQuizQuestion,
  CourseHealthSummary,
  JobType,
  CaseStudyRegion,
} from '../../types/ai';

const AI_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-course-director`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

async function callAIEndpoint<T>(
  action: string,
  params: Record<string, unknown>
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(AI_FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...params }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `AI request failed: ${response.status}`);
  }

  return response.json();
}

export async function generateCourseOutline(
  input: CourseGenerationInput
): Promise<GeneratedCourseOutline> {
  return callAIEndpoint<GeneratedCourseOutline>('generate_course', { input });
}

export async function createCourseFromOutline(
  outline: GeneratedCourseOutline,
  sectorId?: string
): Promise<string> {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: outline.title,
      slug: outline.slug,
      description: outline.description,
      level: outline.level,
      duration: outline.duration,
      target_audience: outline.target_audience,
      seo_title: outline.seo_title,
      seo_description: outline.seo_description,
      seo_keywords: outline.seo_keywords,
      sector_id: sectorId || null,
      price: 0,
      published: false,
    })
    .select('id')
    .single();

  if (courseError) throw courseError;

  for (const mod of outline.modules) {
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title: mod.title,
        description: mod.description,
        display_order: mod.display_order,
      })
      .select('id')
      .single();

    if (moduleError) throw moduleError;

    for (const lesson of mod.lessons) {
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          module_id: moduleData.id,
          title: lesson.title,
          content: '',
          duration: lesson.duration_minutes,
          display_order: lesson.display_order,
          resources: JSON.stringify(lesson.learning_objectives.map(obj => ({
            name: obj,
            type: 'learning_objective',
          }))),
        });

      if (lessonError) throw lessonError;
    }
  }

  return course.id;
}

export async function generateLesson(
  input: LessonGenerationInput
): Promise<GeneratedLesson> {
  return callAIEndpoint<GeneratedLesson>('generate_lesson', { input });
}

export async function generateQuiz(
  input: QuizGenerationInput
): Promise<{ questions: GeneratedQuizQuestion[] }> {
  return callAIEndpoint<{ questions: GeneratedQuizQuestion[] }>('generate_quiz', { input });
}

export async function generateCaseStudy(
  topic: string,
  region: CaseStudyRegion,
  level: string
): Promise<{
  title: string;
  content: string;
  discussion_questions: string[];
  media_suggestions: Array<{ type: string; description: string; generation_prompt: string }>;
}> {
  return callAIEndpoint('generate_case_study', { topic, region, level });
}

export async function optimiseSEO(
  input: SEOOptimisationInput
): Promise<SEOOptimisationResult> {
  return callAIEndpoint<SEOOptimisationResult>('optimise_seo', { input });
}

export async function applySEOResults(
  courseId: string,
  seo: SEOOptimisationResult
): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .update({
      seo_title: seo.seo_title,
      seo_description: seo.seo_description,
      seo_keywords: seo.seo_keywords,
      slug: seo.slug_suggestion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId);

  if (error) throw error;
}

export async function auditCourse(courseId: string): Promise<AIAuditReport> {
  return callAIEndpoint<AIAuditReport>('audit_course', { course_id: courseId });
}

export async function getJobStatus(jobId: string): Promise<AIGenerationJob> {
  const { data, error } = await supabase
    .from('ai_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}

export async function getRecentJobs(limit = 20): Promise<AIGenerationJob[]> {
  const { data, error } = await supabase
    .from('ai_generation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getCourseAuditReports(courseId: string): Promise<AIAuditReport[]> {
  const { data, error } = await supabase
    .from('ai_audit_reports')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCourseHealthSummaries(): Promise<CourseHealthSummary[]> {
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title')
    .is('deleted_at', null)
    .order('title');

  if (coursesError) throw coursesError;

  const summaries: CourseHealthSummary[] = [];

  for (const course of courses || []) {
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', course.id);

    const moduleIds = modules?.map(m => m.id) || [];

    let lessonCount = 0;
    if (moduleIds.length > 0) {
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .in('module_id', moduleIds);
      lessonCount = count || 0;
    }

    const { data: latestAudit } = await supabase
      .from('ai_audit_reports')
      .select('overall_score, completeness_score, created_at')
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const overallScore = latestAudit?.overall_score ?? 0;
    const status = overallScore >= 75 ? 'healthy'
      : overallScore >= 50 ? 'needs_attention'
      : 'critical';

    summaries.push({
      course_id: course.id,
      course_title: course.title,
      overall_score: overallScore,
      completeness_score: latestAudit?.completeness_score ?? 0,
      module_count: moduleIds.length,
      lesson_count: lessonCount,
      has_quizzes: false,
      last_audit: latestAudit?.created_at ?? null,
      status,
    });
  }

  return summaries;
}

export async function createGenerationJob(
  jobType: JobType,
  courseId: string | null,
  inputParams: Record<string, unknown>
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ai_generation_jobs')
    .insert({
      user_id: user.id,
      job_type: jobType,
      course_id: courseId,
      input_params: inputParams,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}
