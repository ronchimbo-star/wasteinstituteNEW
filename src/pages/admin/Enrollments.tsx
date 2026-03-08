import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, CheckCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  user_profiles: {
    full_name: string;
  };
  courses: {
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [enrollmentsRes, coursesRes, studentsRes] = await Promise.all([
      supabase
        .from('course_enrollments')
        .select(`
          *,
          user_profiles!course_enrollments_user_id_fkey(full_name),
          courses(title)
        `)
        .order('enrolled_at', { ascending: false }),
      supabase
        .from('courses')
        .select('id, title')
        .eq('published', true)
        .order('title'),
      supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'user')
        .order('full_name'),
    ]);

    if (enrollmentsRes.data) setEnrollments(enrollmentsRes.data as any);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (studentsRes.data) setStudents(studentsRes.data as Student[]);

    setLoading(false);
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) {
      alert('Please select both a student and a course');
      return;
    }

    const { data: currentUser } = await supabase.auth.getUser();

    const { error } = await supabase.from('course_enrollments').insert([
      {
        user_id: selectedStudent,
        course_id: selectedCourse,
        enrolled_by: currentUser.user?.id,
        status: 'enrolled',
        progress: 0,
      },
    ]);

    if (error) {
      if (error.code === '23505') {
        alert('This student is already enrolled in this course');
      } else {
        alert('Error enrolling student: ' + error.message);
      }
      return;
    }

    setShowAddModal(false);
    setSelectedStudent('');
    setSelectedCourse('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return;

    const { error } = await supabase
      .from('course_enrollments')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error removing enrollment: ' + error.message);
      return;
    }

    loadData();
  };

  const handleMarkComplete = async (enrollment: Enrollment) => {
    const { error } = await supabase
      .from('course_enrollments')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', enrollment.id);

    if (error) {
      alert('Error marking enrollment as complete: ' + error.message);
      return;
    }

    loadData();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      enrolled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Enrollments</h1>
          <p className="text-gray-600 mt-1">Assign courses to students and track progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus size={20} />
          Enroll Student
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Enroll Student in Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student *
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Course *
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Choose a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleEnroll}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Enroll Student
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedStudent('');
                    setSelectedCourse('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrolled Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : enrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No enrollments yet. Click "Enroll Student" to get started.
                </td>
              </tr>
            ) : (
              enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.user_profiles?.full_name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {enrollment.courses?.title || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        enrollment.status
                      )}`}
                    >
                      {enrollment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {enrollment.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkComplete(enrollment)}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as Complete"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(enrollment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Remove Enrollment"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
