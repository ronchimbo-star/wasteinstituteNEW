import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, User, Phone, Building, MessageSquare, Calendar, Trash2, Eye, X, Search } from 'lucide-react';

interface RegistrationSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  organization: string;
  message: string;
  created_at: string;
}

export const AdminRegistrations = () => {
  const [submissions, setSubmissions] = useState<RegistrationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<RegistrationSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading registration submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration submission? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('registration_submissions').delete().eq('id', id);
      if (error) throw error;
      setSubmissions(submissions.filter(s => s.id !== id));
      if (viewingSubmission?.id === id) setViewingSubmission(null);
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = submissions.filter(s =>
    !searchTerm ||
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registration Submissions</h1>
          <p className="text-gray-600 mt-2">View and manage course registration requests</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
          <MessageSquare size={16} />
          {submissions.length} total
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {viewingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Registration Details</h2>
                <p className="text-sm text-gray-500 mt-1">{formatDate(viewingSubmission.created_at)}</p>
              </div>
              <button onClick={() => setViewingSubmission(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="text-gray-400 mt-0.5" size={16} />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Full Name</div>
                    <div className="text-sm font-medium text-gray-900">{viewingSubmission.full_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-gray-400 mt-0.5" size={16} />
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Email</div>
                    <a href={`mailto:${viewingSubmission.email}`} className="text-sm text-emerald-600 hover:underline">
                      {viewingSubmission.email}
                    </a>
                  </div>
                </div>
                {viewingSubmission.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                      <div className="text-sm text-gray-900">{viewingSubmission.phone}</div>
                    </div>
                  </div>
                )}
                {viewingSubmission.organization && (
                  <div className="flex items-start gap-3">
                    <Building className="text-gray-400 mt-0.5" size={16} />
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Organisation</div>
                      <div className="text-sm text-gray-900">{viewingSubmission.organization}</div>
                    </div>
                  </div>
                )}
              </div>
              {viewingSubmission.message && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-2">Message</div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{viewingSubmission.message}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <a
                  href={`mailto:${viewingSubmission.email}`}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <Mail size={16} />
                  Reply via Email
                </a>
                <button
                  onClick={() => deleteSubmission(viewingSubmission.id)}
                  disabled={deleting === viewingSubmission.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No results found' : 'No registration submissions yet'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search.' : 'Course registration requests will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-400" size={16} />
                          <span className="text-sm font-medium text-gray-900">{submission.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a href={`mailto:${submission.email}`} className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700">
                          <Mail size={16} />
                          {submission.email}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone size={16} className="text-gray-400" />
                          {submission.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Building size={16} className="text-gray-400" />
                          {submission.organization || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(submission.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingSubmission(submission)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => deleteSubmission(submission.id)}
                            disabled={deleting === submission.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden space-y-4">
            {filtered.map((submission) => (
              <div key={submission.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-400" size={16} />
                      <span className="text-sm font-medium text-gray-900">{submission.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      {formatDate(submission.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-emerald-600" size={16} />
                    <a href={`mailto:${submission.email}`} className="text-sm text-emerald-600 hover:text-emerald-700">
                      {submission.email}
                    </a>
                  </div>
                  {submission.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-900">{submission.phone}</span>
                    </div>
                  )}
                  {submission.organization && (
                    <div className="flex items-center gap-2">
                      <Building className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-900">{submission.organization}</span>
                    </div>
                  )}
                  {submission.message && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Message:</div>
                      <div className="text-sm text-gray-600 line-clamp-2">{submission.message}</div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setViewingSubmission(submission)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => deleteSubmission(submission.id)}
                      disabled={deleting === submission.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
