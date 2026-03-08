import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText
} from 'lucide-react';

interface Sector {
  id: string;
  name: string;
}

interface Lesson {
  id?: string;
  title: string;
  content: string;
  video_url: string;
  duration: number;
  display_order: number;
}

interface Module {
  id?: string;
  title: string;
  description: string;
  display_order: number;
  lessons: Lesson[];
  expanded?: boolean;
}

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  sector_id: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  published: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

export const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleForm, setShowModuleForm] = useState(false);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    sector_id: '',
    price: 0,
    duration: '',
    level: 'Beginner',
    published: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    loadSectors();
    if (isEditing && id) {
      loadCourse(id);
      loadModules(id);
    }
  }, [id, isEditing]);

  const loadSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error('Error loading sectors:', error);
    }
  };

  const loadCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title,
          slug: data.slug,
          description: data.description,
          sector_id: data.sector_id || '',
          price: data.price,
          duration: data.duration,
          level: data.level as 'Beginner' | 'Intermediate' | 'Advanced',
          published: data.published,
          seo_title: data.seo_title,
          seo_description: data.seo_description,
          seo_keywords: data.seo_keywords,
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
      alert('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (courseId: string) => {
    try {
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('display_order');

      if (modulesError) throw modulesError;

      if (modulesData) {
        const modulesWithLessons = await Promise.all(
          modulesData.map(async (module) => {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('display_order');

            if (lessonsError) throw lessonsError;

            return {
              ...module,
              lessons: lessonsData || [],
              expanded: false,
            };
          })
        );

        setModules(modulesWithLessons);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Auto-generate slug from title
    if (name === 'title' && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      if (isEditing && id) {
        // Update existing course
        const { error: courseError } = await supabase
          .from('courses')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (courseError) throw courseError;

        // Save modules and lessons
        await saveModulesAndLessons(id);

        alert('Course updated successfully!');
      } else {
        // Create new course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .insert([
            {
              ...formData,
              featured_image: '',
            },
          ])
          .select()
          .single();

        if (courseError) throw courseError;

        // Save modules and lessons
        if (courseData) {
          await saveModulesAndLessons(courseData.id);
        }

        alert('Course created successfully!');
      }

      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const saveModulesAndLessons = async (courseId: string) => {
    try {
      // Delete existing modules and lessons (cascade will handle lessons)
      if (isEditing) {
        await supabase.from('modules').delete().eq('course_id', courseId);
      }

      // Insert modules and lessons
      for (const module of modules) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .insert([
            {
              course_id: courseId,
              title: module.title,
              description: module.description,
              display_order: module.display_order,
            },
          ])
          .select()
          .single();

        if (moduleError) throw moduleError;

        if (moduleData && module.lessons.length > 0) {
          const lessonsToInsert = module.lessons.map((lesson) => ({
            module_id: moduleData.id,
            title: lesson.title,
            content: lesson.content,
            video_url: lesson.video_url,
            duration: lesson.duration,
            display_order: lesson.display_order,
            resources: [],
          }));

          const { error: lessonsError } = await supabase
            .from('lessons')
            .insert(lessonsToInsert);

          if (lessonsError) throw lessonsError;
        }
      }
    } catch (error) {
      console.error('Error saving modules and lessons:', error);
      throw error;
    }
  };

  const addModule = () => {
    if (!newModule.title) {
      alert('Please enter a module title');
      return;
    }

    const module: Module = {
      title: newModule.title,
      description: newModule.description,
      display_order: modules.length,
      lessons: [],
      expanded: true,
    };

    setModules([...modules, module]);
    setNewModule({ title: '', description: '' });
    setShowModuleForm(false);
  };

  const deleteModule = (index: number) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    setModules(modules.filter((_, i) => i !== index));
  };

  const toggleModuleExpanded = (index: number) => {
    setModules(
      modules.map((module, i) =>
        i === index ? { ...module, expanded: !module.expanded } : module
      )
    );
  };

  const addLesson = (moduleIndex: number) => {
    const lesson: Lesson = {
      title: '',
      content: '',
      video_url: '',
      duration: 0,
      display_order: modules[moduleIndex].lessons.length,
    };

    setModules(
      modules.map((module, i) =>
        i === moduleIndex
          ? { ...module, lessons: [...module.lessons, lesson] }
          : module
      )
    );
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string | number
  ) => {
    setModules(
      modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) =>
                j === lessonIndex ? { ...lesson, [field]: value } : lesson
              ),
            }
          : module
      )
    );
  };

  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    setModules(
      modules.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, j) => j !== lessonIndex),
            }
          : module
      )
    );
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Courses
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Course' : 'Create New Course'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  name="sector_id"
                  value={formData.sector_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select a sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 8 weeks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              SEO Settings
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                name="seo_description"
                value={formData.seo_description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Keywords
              </label>
              <input
                type="text"
                name="seo_keywords"
                value={formData.seo_keywords}
                onChange={handleInputChange}
                placeholder="Comma-separated keywords"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Course Modules
              </h2>
              <button
                type="button"
                onClick={() => setShowModuleForm(!showModuleForm)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                <Plus size={18} />
                Add Module
              </button>
            </div>

            {/* Add Module Form */}
            {showModuleForm && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) =>
                      setNewModule({ ...newModule, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Description
                  </label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) =>
                      setNewModule({ ...newModule, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addModule}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Add Module
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModuleForm(false);
                      setNewModule({ title: '', description: '' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Modules List */}
            {modules.length > 0 ? (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <div
                    key={moduleIndex}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleModuleExpanded(moduleIndex)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {module.expanded ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                        <BookOpen size={20} className="text-emerald-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {module.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {module.lessons.length} lesson(s)
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteModule(moduleIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {module.expanded && (
                      <div className="p-4 space-y-4">
                        {/* Module Description */}
                        {module.description && (
                          <p className="text-sm text-gray-600">{module.description}</p>
                        )}

                        {/* Lessons */}
                        <div className="space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lessonIndex}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <FileText size={18} className="text-emerald-600" />
                                  <h4 className="font-medium text-gray-900">
                                    Lesson {lessonIndex + 1}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteLesson(moduleIndex, lessonIndex)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Lesson Title <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'title',
                                        e.target.value
                                      )
                                    }
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Duration (minutes)
                                  </label>
                                  <input
                                    type="number"
                                    value={lesson.duration}
                                    onChange={(e) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'duration',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    min="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Content
                                </label>
                                <textarea
                                  value={lesson.content}
                                  onChange={(e) =>
                                    updateLesson(
                                      moduleIndex,
                                      lessonIndex,
                                      'content',
                                      e.target.value
                                    )
                                  }
                                  rows={3}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Video URL
                                </label>
                                <input
                                  type="url"
                                  value={lesson.video_url}
                                  onChange={(e) =>
                                    updateLesson(
                                      moduleIndex,
                                      lessonIndex,
                                      'video_url',
                                      e.target.value
                                    )
                                  }
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addLesson(moduleIndex)}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            <Plus size={16} />
                            Add Lesson
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-600">No modules yet</p>
                <p className="text-sm text-gray-500">
                  Click "Add Module" to create your first module
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/courses')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
