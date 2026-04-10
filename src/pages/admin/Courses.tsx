import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit, Trash2, Eye, RotateCcw } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  level: string;
  price: number;
  created_at: string;
  deleted_at: string | null;
}

export const AdminCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [showArchived]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (showArchived) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const archiveCourse = async (id: string) => {
    if (!confirm('Archive this course? It will be hidden from the public but can be restored.')) return;
    try {
      const { error } = await supabase
        .from('courses')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error archiving course:', error);
      alert('Failed to archive course');
    }
  };

  const restoreCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ deleted_at: null })
        .eq('id', id);
      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error restoring course:', error);
      alert('Failed to restore course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-2">Manage your course library</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
              showArchived
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showArchived ? <RotateCcw size={16} /> : <Trash2 size={16} />}
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          {!showArchived && (
            <Link
              to="/admin/courses/new"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
              Add Course
            </Link>
          )}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {showArchived ? 'No archived courses' : 'No courses yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {showArchived
              ? 'Archived courses will appear here.'
              : 'Get started by creating your first course'}
          </p>
          {!showArchived && (
            <Link
              to="/admin/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
              Create Course
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{course.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">£{course.price}</td>
                    <td className="px-6 py-4">
                      {showArchived ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Archived
                        </span>
                      ) : (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            course.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {course.published ? 'Published' : 'Draft'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {showArchived ? (
                          <button
                            onClick={() => restoreCourse(course.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <RotateCcw size={18} />
                          </button>
                        ) : (
                          <>
                            <Link
                              to={`/courses/${course.slug}`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              to={`/admin/courses/${course.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => archiveCourse(course.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Archive"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
