import type {
  CourseGenerationInput,
  LessonGenerationInput,
  QuizGenerationInput,
  SEOOptimisationInput,
  CaseStudyRegion,
} from '../../types/ai';

export const SYSTEM_PROMPT = `You are an expert Course Director for the Waste Institute, a professional education provider specialising in waste management, environmental compliance, and sustainability training.

Your expertise covers:
- UK waste legislation (Environmental Protection Act 1990, Hazardous Waste Regulations 2005, Waste Duty of Care)
- EU Waste Framework Directive and circular economy principles
- Healthcare waste management (HTM 07-01)
- Hazardous waste classification and handling
- Environmental permitting and compliance
- Sustainability and resource recovery

Always write content that is:
- Technically accurate and up-to-date with current legislation
- Professionally written at the appropriate academic level
- Practically applicable with real-world examples
- Engaging with varied content formats (text, activities, case studies)
- SEO-optimised where applicable

Format all lesson content as rich HTML suitable for web display.`;

export function buildCourseGenerationPrompt(input: CourseGenerationInput): string {
  return `Create a comprehensive course outline for the following:

**Course Topic:** ${input.topic}
**Title:** ${input.title}
**Level:** ${input.level}
**Risk Level:** ${input.risk_level}
**Target Duration:** ${input.target_hours} hours of learning
**Sector:** ${input.sector}
${input.target_audience ? `**Target Audience:** ${input.target_audience}` : ''}
${input.description ? `**Additional Context:** ${input.description}` : ''}
${input.regions?.length ? `**Case Study Regions:** ${input.regions.join(', ')}` : ''}

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
- Create ${Math.ceil(input.target_hours / 8)}-${Math.ceil(input.target_hours / 6)} modules
- Each module should have 3-5 lessons
- Each lesson should be 20-45 minutes
- Total lesson time should approximate ${input.target_hours} hours
- Include progressive difficulty within the course
- Ensure practical application opportunities in each module
- Learning objectives must be measurable (use Bloom's taxonomy verbs)

Return ONLY valid JSON, no markdown or explanation.`;
}

export function buildLessonGenerationPrompt(input: LessonGenerationInput): string {
  return `Write a comprehensive lesson for an online course.

**Course:** ${input.course_title}
**Module:** ${input.module_title}
**Lesson Title:** ${input.lesson_title}
**Level:** ${input.level}
**Target Word Count:** ${input.target_word_count} words

**Learning Objectives:**
${input.learning_objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}

**Key Topics to Cover:**
${input.key_topics.map((t) => `- ${t}`).join('\n')}

${input.include_case_study ? `Include a detailed case study from the ${input.case_study_region || 'UK'} context.` : ''}

Write the lesson as rich HTML content. Structure it with:
- An engaging introduction that hooks the reader
- Clear section headings (h2, h3)
- Key concept definitions in highlighted boxes
- Practical examples and real-world applications
- A "Key Takeaways" summary section at the end
- Appropriate use of lists, tables, and emphasis

Use semantic HTML: <h2>, <h3>, <p>, <ul>, <ol>, <table>, <blockquote>, <strong>, <em>.
Wrap key definitions in: <div class="key-concept"><h4>Key Concept</h4><p>...</p></div>
Wrap case studies in: <div class="case-study"><h4>Case Study: Title</h4>...</div>
Wrap activities in: <div class="activity"><h4>Activity</h4><p>...</p></div>

Also return a JSON array of media suggestions where images, diagrams, or videos would enhance understanding.

Return your response as JSON:
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

export function buildQuizGenerationPrompt(input: QuizGenerationInput): string {
  return `Generate quiz questions based on the following lesson content.

**Course:** ${input.course_title}
**Module:** ${input.module_title}
**Number of Questions:** ${input.num_questions}
**Question Types:** ${input.question_types.join(', ')}

**Lesson Content (summarised):**
${input.lesson_content.substring(0, 4000)}

Generate questions that:
- Test comprehension at various Bloom's taxonomy levels
- Include practical application scenarios
- Have clear, unambiguous correct answers
- Include detailed explanations for why each answer is correct
- For MCQ: provide 4 options with plausible distractors
- For true/false: include nuanced statements that test understanding
- For matching: create pairs that require deep knowledge

Return JSON:
{
  "questions": [
    {
      "question": "Question text",
      "type": "mcq|true_false|matching",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Detailed explanation of the correct answer"
    }
  ]
}

Return ONLY valid JSON.`;
}

export function buildSEOOptimisationPrompt(input: SEOOptimisationInput): string {
  return `Optimise the SEO for a waste management / environmental training course.

**Course Title:** ${input.title}
**Course Description:** ${input.description}
${input.current_seo_title ? `**Current SEO Title:** ${input.current_seo_title}` : ''}
${input.current_seo_description ? `**Current Meta Description:** ${input.current_seo_description}` : ''}
${input.current_seo_keywords ? `**Current Keywords:** ${input.current_seo_keywords}` : ''}

Analyse search intent for this topic and generate optimised SEO content:

Return JSON:
{
  "seo_title": "Optimised title (max 60 chars, include primary keyword)",
  "seo_description": "Meta description (150-160 chars, include CTA and keyword)",
  "seo_keywords": "primary, secondary, long-tail keywords (comma separated)",
  "slug_suggestion": "seo-friendly-url-slug",
  "structured_data": {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "...",
    "description": "...",
    "provider": { "@type": "Organization", "name": "Waste Institute" },
    "educationalLevel": "...",
    "coursePrerequisites": "..."
  },
  "keyword_analysis": {
    "primary": ["top 3 primary keywords"],
    "secondary": ["5-8 secondary keywords"],
    "long_tail": ["3-5 long-tail keyword phrases"]
  }
}

Return ONLY valid JSON.`;
}

export function buildCaseStudyPrompt(
  topic: string,
  region: CaseStudyRegion,
  level: string
): string {
  const regionContext: Record<CaseStudyRegion, string> = {
    UK: 'UK regulations, NHS trusts, Environment Agency enforcement',
    EU: 'EU Waste Framework Directive, cross-border shipment regulations',
    USA: 'EPA RCRA regulations, state-level compliance variations',
    Africa: 'Developing waste infrastructure, informal recycling sector, WHO guidelines',
    Asia: 'Rapid industrialisation challenges, extended producer responsibility schemes',
  };

  return `Write a detailed case study for a ${level}-level waste management course.

**Topic:** ${topic}
**Region:** ${region}
**Regional Context:** ${regionContext[region]}

The case study should:
- Be 800-1200 words
- Include a realistic scenario with named organisations (fictionalised)
- Present a problem, the approach taken, and outcomes
- Include data/statistics where relevant
- End with discussion questions (3-5)
- Reference relevant legislation/regulations for the ${region} context

Format as HTML with proper structure.

Return JSON:
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

export function buildCourseAuditPrompt(courseData: {
  title: string;
  description: string;
  level: string;
  modules: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      has_quiz: boolean;
    }>;
  }>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}): string {
  const modulesSummary = courseData.modules.map((m, i) => {
    const lessonList = m.lessons.map((l, j) =>
      `    ${j + 1}. "${l.title}" (${l.content?.length || 0} chars, quiz: ${l.has_quiz})`
    ).join('\n');
    return `  Module ${i + 1}: "${m.title}"\n${lessonList}`;
  }).join('\n');

  return `Audit this waste management course against quality standards.

**Course:** ${courseData.title}
**Level:** ${courseData.level}
**Description:** ${courseData.description}
**SEO Title:** ${courseData.seo_title || 'MISSING'}
**SEO Description:** ${courseData.seo_description || 'MISSING'}
**SEO Keywords:** ${courseData.seo_keywords || 'MISSING'}

**Structure:**
${modulesSummary}

Evaluate against these criteria:
1. **Completeness** (0-100): All modules have sufficient lessons, lessons have adequate content length (min 1500 words), learning objectives are present
2. **Regulatory Accuracy** (0-100): References to UK/EU waste legislation are correct, terminology is precise, compliance requirements are up-to-date
3. **Engagement** (0-100): Includes quizzes, activities, case studies, varied content formats, practical exercises
4. **SEO Readiness** (0-100): Meta title/description present and optimised, keywords relevant, URL structure clean

Return JSON:
{
  "overall_score": <average of 4 scores>,
  "completeness_score": <0-100>,
  "regulatory_score": <0-100>,
  "engagement_score": <0-100>,
  "seo_score": <0-100>,
  "findings": [
    {
      "category": "completeness|regulatory|engagement|seo",
      "severity": "critical|warning|info|good",
      "title": "Finding title",
      "description": "Detailed description",
      "location": "Module X, Lesson Y (optional)"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "category": "Category name",
      "action": "Specific action to take",
      "estimated_effort": "X hours / X minutes",
      "ai_fixable": true
    }
  ],
  "media_suggestions": [
    {
      "type": "image|diagram|video|infographic",
      "context": "Where this would be used",
      "description": "What it should show",
      "generation_prompt": "Detailed AI generation prompt for creating this media",
      "suggested_colors": ["#2D5F2B", "#4A90D9"],
      "placement": "Module X, Lesson Y, after section Z"
    }
  ]
}

Return ONLY valid JSON.`;
}
