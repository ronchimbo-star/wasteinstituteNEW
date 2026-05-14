import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MAX_COST_PER_REQUEST = 2.0;
const RATE_LIMIT_PER_MINUTE = 20;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }

  entry.count++;
  return true;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 0.0025, output: 0.01 },
    "gpt-4-turbo-preview": { input: 0.01, output: 0.03 },
    "gpt-3.5-turbo-16k": { input: 0.0005, output: 0.0015 },
  };
  const rates = pricing[model] || pricing["gpt-4o"];
  return (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output;
}

function hashPrompt(prompt: string): string {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    const char = prompt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

const SYSTEM_PROMPT = `You are an expert Course Director for the Waste Institute, a professional education provider specialising in waste management, environmental compliance, and sustainability training.

Your expertise covers:
- UK waste legislation (Environmental Protection Act 1990, Hazardous Waste Regulations 2005, Waste Duty of Care)
- EU Waste Framework Directive and circular economy principles
- Healthcare waste management (HTM 07-01)
- Hazardous waste classification and handling
- Environmental permitting and compliance
- Sustainability and resource recovery

Always write content that is technically accurate, professionally written, practically applicable, engaging, and SEO-optimised where applicable. Format lesson content as rich HTML.`;

async function callOpenAI(
  prompt: string,
  model: string = "gpt-4o",
  maxTokens: number = 4096
): Promise<{ content: string; tokens_used: number; cost: number }> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const inputTokens = estimateTokens(SYSTEM_PROMPT + prompt);
  const estimatedCost = estimateCost(inputTokens, maxTokens, model);

  if (estimatedCost > MAX_COST_PER_REQUEST) {
    throw new Error(
      `Estimated cost $${estimatedCost.toFixed(4)} exceeds limit of $${MAX_COST_PER_REQUEST}`
    );
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || { total_tokens: 0 };
  const actualCost = estimateCost(
    usage.prompt_tokens || inputTokens,
    usage.completion_tokens || 0,
    model
  );

  return {
    content,
    tokens_used: usage.total_tokens || 0,
    cost: actualCost,
  };
}

function parseJSON(text: string): unknown {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const allowedRoles = ["super_admin", "admin", "content_editor", "instructor"];
    if (!profile || !allowedRoles.includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Max 20 requests per minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, ...params } = body;

    let result: unknown;

    switch (action) {
      case "generate_course": {
        const { input } = params;
        const prompt = buildCoursePrompt(input);
        const promptHash = hashPrompt(prompt);

        const { data: cached } = await supabase
          .from("ai_generation_cache")
          .select("response")
          .eq("prompt_hash", promptHash)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (cached) {
          result = cached.response;
          break;
        }

        const { data: job } = await supabase
          .from("ai_generation_jobs")
          .insert({
            user_id: user.id,
            job_type: "course_generate",
            input_params: input,
            status: "processing",
            started_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        const ai = await callOpenAI(prompt, "gpt-4o", 8192);
        result = parseJSON(ai.content);

        await supabase.from("ai_generation_cache").insert({
          prompt_hash: promptHash,
          prompt_summary: `Generate course: ${input.title}`,
          model: "gpt-4o",
          response: result,
          tokens_used: ai.tokens_used,
          cost_usd: ai.cost,
        });

        if (job) {
          await supabase
            .from("ai_generation_jobs")
            .update({
              status: "completed",
              progress: 100,
              result: result as Record<string, unknown>,
              tokens_used: ai.tokens_used,
              cost_usd: ai.cost,
              completed_at: new Date().toISOString(),
            })
            .eq("id", job.id);
        }

        await supabase.from("admin_audit_log").insert({
          user_id: user.id,
          user_email: user.email,
          action: "create",
          resource: "ai_course_generation",
          details: { title: input.title, tokens: ai.tokens_used, cost: ai.cost },
        });

        break;
      }

      case "generate_lesson": {
        const { input } = params;
        const prompt = buildLessonPrompt(input);
        const ai = await callOpenAI(prompt, "gpt-4o", 8192);
        result = parseJSON(ai.content);

        await supabase.from("admin_audit_log").insert({
          user_id: user.id,
          user_email: user.email,
          action: "create",
          resource: "ai_lesson_generation",
          details: { lesson_title: input.lesson_title, tokens: ai.tokens_used },
        });

        break;
      }

      case "generate_quiz": {
        const { input } = params;
        const prompt = buildQuizPrompt(input);
        const ai = await callOpenAI(prompt, "gpt-4o", 4096);
        result = parseJSON(ai.content);

        await supabase.from("admin_audit_log").insert({
          user_id: user.id,
          user_email: user.email,
          action: "create",
          resource: "ai_quiz_generation",
          details: { num_questions: input.num_questions, tokens: ai.tokens_used },
        });

        break;
      }

      case "generate_case_study": {
        const { topic, region, level } = params;
        const prompt = buildCaseStudyPrompt(topic, region, level);
        const ai = await callOpenAI(prompt, "gpt-4o", 6144);
        result = parseJSON(ai.content);
        break;
      }

      case "optimise_seo": {
        const { input } = params;
        const prompt = buildSEOPrompt(input);
        const ai = await callOpenAI(prompt, "gpt-4o", 2048);
        result = parseJSON(ai.content);

        await supabase.from("admin_audit_log").insert({
          user_id: user.id,
          user_email: user.email,
          action: "update",
          resource: "ai_seo_optimisation",
          details: { course_id: input.course_id, tokens: ai.tokens_used },
        });

        break;
      }

      case "audit_course": {
        const { course_id } = params;

        const { data: course } = await supabase
          .from("courses")
          .select("*")
          .eq("id", course_id)
          .single();

        if (!course) {
          return new Response(
            JSON.stringify({ error: "Course not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: modules } = await supabase
          .from("modules")
          .select("id, title, display_order")
          .eq("course_id", course_id)
          .order("display_order");

        const modulesWithLessons = [];
        for (const mod of modules || []) {
          const { data: lessons } = await supabase
            .from("lessons")
            .select("id, title, content, display_order")
            .eq("module_id", mod.id)
            .order("display_order");

          modulesWithLessons.push({
            title: mod.title,
            lessons: (lessons || []).map((l) => ({
              title: l.title,
              content: l.content || "",
              has_quiz: false,
            })),
          });
        }

        const courseData = {
          title: course.title,
          description: course.description,
          level: course.level,
          modules: modulesWithLessons,
          seo_title: course.seo_title,
          seo_description: course.seo_description,
          seo_keywords: course.seo_keywords,
        };

        const prompt = buildAuditPrompt(courseData);
        const ai = await callOpenAI(prompt, "gpt-4o", 6144);
        const auditResult = parseJSON(ai.content) as Record<string, unknown>;

        const { data: report } = await supabase
          .from("ai_audit_reports")
          .insert({
            course_id,
            generated_by: user.id,
            overall_score: auditResult.overall_score,
            completeness_score: auditResult.completeness_score,
            regulatory_score: auditResult.regulatory_score,
            engagement_score: auditResult.engagement_score,
            seo_score: auditResult.seo_score,
            findings: auditResult.findings,
            recommendations: auditResult.recommendations,
            media_suggestions: auditResult.media_suggestions || [],
          })
          .select()
          .single();

        result = report;

        await supabase.from("admin_audit_log").insert({
          user_id: user.id,
          user_email: user.email,
          action: "create",
          resource: "ai_course_audit",
          details: { course_id, overall_score: auditResult.overall_score },
        });

        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Prompt builders (server-side versions)

function buildCoursePrompt(input: Record<string, unknown>): string {
  const targetHours = Number(input.target_hours) || 40;
  return `Create a comprehensive course outline for the following:

**Course Topic:** ${input.topic}
**Title:** ${input.title}
**Level:** ${input.level}
**Risk Level:** ${input.risk_level}
**Target Duration:** ${targetHours} hours of learning
**Sector:** ${input.sector}
${input.target_audience ? `**Target Audience:** ${input.target_audience}` : ""}
${input.description ? `**Additional Context:** ${input.description}` : ""}

Generate a JSON response with this exact structure:
{
  "title": "Course title",
  "slug": "url-friendly-slug",
  "description": "Comprehensive 2-3 paragraph course description",
  "level": "${input.level}",
  "duration": "X weeks (self-paced)",
  "target_audience": "Description of who this course is for",
  "seo_title": "SEO optimised title (max 60 chars)",
  "seo_description": "Meta description (150-160 chars)",
  "seo_keywords": "comma, separated, keywords",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "display_order": 1,
      "lessons": [
        {
          "title": "Lesson title",
          "duration_minutes": 30,
          "display_order": 1,
          "learning_objectives": ["Objective 1", "Objective 2"],
          "key_topics": ["Topic 1", "Topic 2"]
        }
      ]
    }
  ]
}

Requirements:
- Create ${Math.ceil(targetHours / 8)}-${Math.ceil(targetHours / 6)} modules
- Each module should have 3-5 lessons
- Each lesson should be 20-45 minutes
- Total lesson time should approximate ${targetHours} hours
- Include progressive difficulty within the course
- Ensure practical application opportunities in each module
- Learning objectives must be measurable (use Bloom's taxonomy verbs)

Return ONLY valid JSON, no markdown or explanation.`;
}

function buildLessonPrompt(input: Record<string, unknown>): string {
  const objectives = (input.learning_objectives as string[]) || [];
  const topics = (input.key_topics as string[]) || [];
  return `Write a comprehensive lesson for an online course.

**Course:** ${input.course_title}
**Module:** ${input.module_title}
**Lesson Title:** ${input.lesson_title}
**Level:** ${input.level}
**Target Word Count:** ${input.target_word_count || 3000} words

**Learning Objectives:**
${objectives.map((o: string, i: number) => `${i + 1}. ${o}`).join("\n")}

**Key Topics to Cover:**
${topics.map((t: string) => `- ${t}`).join("\n")}

${input.include_case_study ? `Include a detailed case study from the ${input.case_study_region || "UK"} context.` : ""}

Write the lesson as rich HTML content with h2, h3, p, ul, ol, table, blockquote, strong, em tags.
Wrap key definitions in: <div class="key-concept"><h4>Key Concept</h4><p>...</p></div>
Wrap case studies in: <div class="case-study"><h4>Case Study: Title</h4>...</div>
Wrap activities in: <div class="activity"><h4>Activity</h4><p>...</p></div>

Return JSON:
{
  "title": "${input.lesson_title}",
  "content": "<html content here>",
  "word_count": <actual word count>,
  "media_suggestions": [
    {
      "type": "image|diagram|video|infographic",
      "context": "What part of the lesson this supports",
      "description": "What the media should show",
      "generation_prompt": "Detailed prompt for AI image/video generation",
      "suggested_colors": ["#color1", "#color2"],
      "placement": "After section X"
    }
  ]
}

Return ONLY valid JSON.`;
}

function buildQuizPrompt(input: Record<string, unknown>): string {
  const types = (input.question_types as string[]) || ["mcq"];
  const content = String(input.lesson_content || "").substring(0, 4000);
  return `Generate quiz questions based on lesson content.

**Course:** ${input.course_title}
**Module:** ${input.module_title}
**Number of Questions:** ${input.num_questions || 10}
**Question Types:** ${types.join(", ")}

**Lesson Content:**
${content}

Generate questions that test comprehension at various Bloom's taxonomy levels with clear correct answers and detailed explanations.

Return JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "mcq|true_false|matching",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation"
    }
  ]
}

Return ONLY valid JSON.`;
}

function buildCaseStudyPrompt(topic: string, region: string, level: string): string {
  return `Write a detailed case study for a ${level}-level waste management course.

**Topic:** ${topic}
**Region:** ${region}

The case study should be 800-1200 words with a realistic scenario, problem/approach/outcomes, relevant statistics, and 3-5 discussion questions. Reference relevant ${region} legislation.

Format as HTML. Return JSON:
{
  "title": "Case Study: [Title]",
  "region": "${region}",
  "content": "<html content>",
  "discussion_questions": ["Q1", "Q2", "Q3"],
  "media_suggestions": [
    {
      "type": "diagram|infographic",
      "description": "What to show",
      "generation_prompt": "AI generation prompt",
      "placement": "Where in the case study"
    }
  ]
}

Return ONLY valid JSON.`;
}

function buildSEOPrompt(input: Record<string, unknown>): string {
  return `Optimise the SEO for a waste management / environmental training course.

**Course Title:** ${input.title}
**Course Description:** ${input.description}
${input.current_seo_title ? `**Current SEO Title:** ${input.current_seo_title}` : ""}
${input.current_seo_description ? `**Current Meta Description:** ${input.current_seo_description}` : ""}

Return JSON:
{
  "seo_title": "Optimised title (max 60 chars)",
  "seo_description": "Meta description (150-160 chars)",
  "seo_keywords": "keyword1, keyword2, keyword3",
  "slug_suggestion": "seo-friendly-url-slug",
  "structured_data": {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "...",
    "description": "...",
    "provider": { "@type": "Organization", "name": "Waste Institute" }
  },
  "keyword_analysis": {
    "primary": ["keyword1", "keyword2"],
    "secondary": ["keyword3", "keyword4"],
    "long_tail": ["long tail phrase 1"]
  }
}

Return ONLY valid JSON.`;
}

function buildAuditPrompt(courseData: Record<string, unknown>): string {
  const modules = (courseData.modules as Array<{ title: string; lessons: Array<{ title: string; content: string; has_quiz: boolean }> }>) || [];
  const modulesSummary = modules.map((m, i) => {
    const lessonList = m.lessons.map((l, j) =>
      `    ${j + 1}. "${l.title}" (${l.content?.length || 0} chars, quiz: ${l.has_quiz})`
    ).join("\n");
    return `  Module ${i + 1}: "${m.title}"\n${lessonList}`;
  }).join("\n");

  return `Audit this waste management course against quality standards.

**Course:** ${courseData.title}
**Level:** ${courseData.level}
**Description:** ${courseData.description}
**SEO Title:** ${courseData.seo_title || "MISSING"}
**SEO Description:** ${courseData.seo_description || "MISSING"}
**SEO Keywords:** ${courseData.seo_keywords || "MISSING"}

**Structure:**
${modulesSummary}

Evaluate: Completeness (0-100), Regulatory Accuracy (0-100), Engagement (0-100), SEO Readiness (0-100).

Return JSON:
{
  "overall_score": <average>,
  "completeness_score": <0-100>,
  "regulatory_score": <0-100>,
  "engagement_score": <0-100>,
  "seo_score": <0-100>,
  "findings": [
    {
      "category": "completeness|regulatory|engagement|seo",
      "severity": "critical|warning|info|good",
      "title": "Finding title",
      "description": "Description",
      "location": "Module X, Lesson Y"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "category": "Category",
      "action": "Action to take",
      "estimated_effort": "X hours",
      "ai_fixable": true
    }
  ],
  "media_suggestions": [
    {
      "type": "image|diagram|video",
      "context": "Context",
      "description": "Description",
      "generation_prompt": "AI prompt for media creation",
      "suggested_colors": ["#2D5F2B"],
      "placement": "Location"
    }
  ]
}

Return ONLY valid JSON.`;
}
