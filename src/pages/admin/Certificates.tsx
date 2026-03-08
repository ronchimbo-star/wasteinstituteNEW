import { useEffect, useState } from 'react';
import { Award, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompletedEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  completed_at: string;
  user_profiles: {
    full_name: string;
  };
  courses: {
    title: string;
  };
  certificates?: Array<{
    id: string;
    verification_code: string;
  }>;
}

interface Certificate {
  id: string;
  verification_code: string;
  student_name: string;
  issued_date: string;
  courses: {
    title: string;
  };
  user_profiles: {
    full_name: string;
  };
}

export default function AdminCertificates() {
  const [completedEnrollments, setCompletedEnrollments] = useState<CompletedEnrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [enrollmentsRes, certificatesRes] = await Promise.all([
      supabase
        .from('course_enrollments')
        .select(`
          *,
          user_profiles!course_enrollments_user_id_fkey(full_name),
          courses(title)
        `)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false }),
      supabase
        .from('certificates')
        .select(`
          *,
          courses(title),
          user_profiles!certificates_user_id_fkey(full_name)
        `)
        .order('issued_date', { ascending: false }),
    ]);

    if (enrollmentsRes.data) {
      const enrollmentsWithCerts = await Promise.all(
        enrollmentsRes.data.map(async (enrollment: any) => {
          const { data: certs } = await supabase
            .from('certificates')
            .select('id, verification_code')
            .eq('enrollment_id', enrollment.id);
          return {
            ...enrollment,
            certificates: certs || [],
          };
        })
      );
      setCompletedEnrollments(enrollmentsWithCerts as any);
    }

    if (certificatesRes.data) setCertificates(certificatesRes.data as any);

    setLoading(false);
  };

  const generateVerificationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCertificate = async (enrollment: CompletedEnrollment) => {
    setGenerating(enrollment.id);

    const verificationCode = generateVerificationCode();

    const { error } = await supabase.from('certificates').insert([
      {
        verification_code: verificationCode,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        student_name: enrollment.user_profiles.full_name,
        enrollment_id: enrollment.id,
        certificate_id: `CERT-${Date.now()}`,
      },
    ]);

    if (error) {
      alert('Error generating certificate: ' + error.message);
      setGenerating(null);
      return;
    }

    setGenerating(null);
    loadData();
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    const { error } = await supabase.from('certificates').delete().eq('id', id);

    if (error) {
      alert('Error deleting certificate: ' + error.message);
      return;
    }

    loadData();
  };

  const handleViewCertificate = (verificationCode: string) => {
    window.open(`/verify?code=${verificationCode}`, '_blank');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
        <p className="text-gray-600 mt-1">Generate and manage course completion certificates</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Completed Enrollments Awaiting Certificate
        </h2>
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
                  Completed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : completedEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No completed enrollments yet
                  </td>
                </tr>
              ) : (
                completedEnrollments.map((enrollment) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrollment.completed_at
                        ? new Date(enrollment.completed_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.certificates && enrollment.certificates.length > 0 ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Generated
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {enrollment.certificates && enrollment.certificates.length > 0 ? (
                        <button
                          onClick={() =>
                            handleViewCertificate(enrollment.certificates![0].verification_code)
                          }
                          className="text-emerald-600 hover:text-emerald-900"
                          title="View Certificate"
                        >
                          <Eye size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateCertificate(enrollment)}
                          disabled={generating === enrollment.id}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400"
                        >
                          <Award size={16} />
                          {generating === enrollment.id ? 'Generating...' : 'Generate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Certificates</h2>
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
                  Verification Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No certificates generated yet
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {cert.student_name || cert.user_profiles?.full_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {cert.courses?.title || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {cert.verification_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cert.issued_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewCertificate(cert.verification_code)}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="View Certificate"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Certificate"
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
    </div>
  );
}
