import { supabase } from '../lib/supabase';

interface ExportModule {
  id: string;
  title: string;
  description: string;
  display_order: number;
  lessons: {
    id: string;
    title: string;
    duration: number;
    display_order: number;
  }[];
}

interface ExportCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  published: boolean;
  deleted_at: string | null;
  sector_id: string | null;
  prerequisites: string[] | null;
  target_audience: string | null;
  created_at: string;
  modules: ExportModule[];
}

const escapeCsv = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
};

const formatModules = (modules: ExportModule[]): string =>
  modules
    .map((m, i) => `${i + 1}. ${m.title}${m.description ? ': ' + m.description : ''}`)
    .join(' || ') || 'No modules';

const formatModuleLessons = (modules: ExportModule[]): string =>
  modules
    .map(
      (m) =>
        `${m.title}: ${
          m.lessons.length
            ? m.lessons
                .map((l) => `${l.title}${l.duration ? ` (${l.duration} min)` : ''}`)
                .join('; ')
            : 'No lessons'
        }`
    )
    .join(' || ') || 'No modules';

export async function exportCoursesCsv(): Promise<void> {
  const [{ data: courses, error: coursesError }, { data: sectors, error: sectorsError }] =
    await Promise.all([
      supabase
        .from('courses')
        .select(
          'id, title, slug, description, price, duration, level, published, deleted_at, sector_id, prerequisites, target_audience, created_at, modules(id, title, description, display_order, lessons(id, title, duration, display_order))'
        )
        .order('created_at', { ascending: false }),
      supabase.from('sectors').select('id, name'),
    ]);

  if (coursesError) throw coursesError;
  if (sectorsError) throw sectorsError;

  const sectorMap = new Map((sectors || []).map((s) => [s.id, s.name]));
  const courseTitleMap = new Map((courses || []).map((c) => [c.id, c.title]));

  const rows = (courses || []) as ExportCourse[];

  const header = [
    'Title',
    'Slug',
    'Description',
    'Price (GBP)',
    'Duration',
    'Level',
    'Status',
    'Archived',
    'Sector',
    'Prerequisites',
    'Target Audience',
    'Module Count',
    'Modules',
    'Module Lessons',
    'Created At',
  ];

  const lines = [header.map(escapeCsv).join(',')];

  for (const course of rows) {
    const modules = [...(course.modules || [])].sort(
      (a, b) => a.display_order - b.display_order
    );
    for (const m of modules) {
      m.lessons = [...(m.lessons || [])].sort(
        (a, b) => a.display_order - b.display_order
      );
    }

    const prerequisites = (course.prerequisites || [])
      .map((id) => courseTitleMap.get(id) || '[deleted course]')
      .join('; ');

    lines.push(
      [
        course.title,
        course.slug,
        course.description,
        course.price,
        course.duration,
        course.level,
        course.published ? 'Published' : 'Draft',
        course.deleted_at ? 'Yes' : 'No',
        course.sector_id ? sectorMap.get(course.sector_id) || '' : '',
        prerequisites,
        course.target_audience || '',
        modules.length,
        formatModules(modules),
        formatModuleLessons(modules),
        course.created_at,
      ]
        .map(escapeCsv)
        .join(',')
    );
  }

  const csv = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wasteinstitute-courses-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
