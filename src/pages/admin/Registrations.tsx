import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, User, Phone, Building, MessageSquare, Calendar } from 'lucide-react';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registration Submissions</h1>
        <p className="text-gray-600 mt-2">View course registration requests</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No registration submissions yet
          </h3>
          <p className="text-gray-600">
            Course registration requests will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="text-gray-400" size={16} />
                          <span className="text-sm font-medium text-gray-900">
                            {submission.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`mailto:${submission.email}`}
                          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                        >
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
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 truncate max-w-md">
                          {submission.message || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(submission.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-400" size={16} />
                      <span className="text-sm font-medium text-gray-900">
                        {submission.full_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      {formatDate(submission.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="text-emerald-600" size={16} />
                    <a
                      href={`mailto:${submission.email}`}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
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
                      <div className="text-sm text-gray-600">{submission.message}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
