import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Award, Search, CheckCircle, XCircle, Calendar, User, Printer } from 'lucide-react';
import CertificateTemplate from '../components/CertificateTemplate';

interface CertificateDetails {
  id: string;
  certificate_id: string;
  verification_code: string;
  student_name: string;
  issued_date: string;
  user: {
    full_name: string;
  };
  course: {
    title: string;
    level: string;
  };
}

export default function VerifyCertificate() {
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState(searchParams.get('code') || searchParams.get('id') || '');
  const [certificate, setCertificate] = useState<CertificateDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code') || searchParams.get('id');
    if (codeFromUrl) {
      setCertificateId(codeFromUrl);
      handleVerify(codeFromUrl);
    }
  }, []);

  const handleVerify = async (certId?: string) => {
    const idToVerify = certId || certificateId.trim();

    if (!idToVerify) return;

    setLoading(true);
    setSearched(false);
    setNotFound(false);
    setCertificate(null);

    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_id,
          verification_code,
          student_name,
          issued_date,
          user_profiles!certificates_user_id_fkey (
            full_name
          ),
          courses (
            title,
            level
          )
        `)
        .or(`certificate_id.eq.${idToVerify},verification_code.eq.${idToVerify}`)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setNotFound(true);
      } else {
        const formattedCertificate: CertificateDetails = {
          id: data.id,
          certificate_id: data.certificate_id,
          verification_code: data.verification_code,
          student_name: data.student_name || (data.user_profiles as any)?.full_name || 'Unknown User',
          issued_date: data.issued_date,
          user: {
            full_name: data.student_name || (data.user_profiles as any)?.full_name || 'Unknown User',
          },
          course: {
            title: (data.courses as any)?.title || 'Unknown Course',
            level: (data.courses as any)?.level || 'Unknown',
          },
        };
        setCertificate(formattedCertificate);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !certificateRef.current) return;

    const certificateHtml = certificateRef.current.outerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate?.certificate_id}</title>
          <style>
            @page {
              size: landscape;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Georgia, serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${certificateHtml}
        </body>
      </html>
    `);

    printWindow.document.close();

    const images = printWindow.document.getElementsByTagName('img');
    let loadedImages = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      setTimeout(() => printWindow.print(), 250);
    } else {
      Array.from(images).forEach(img => {
        if (img.complete) {
          loadedImages++;
          if (loadedImages === totalImages) {
            setTimeout(() => printWindow.print(), 250);
          }
        } else {
          img.onload = () => {
            loadedImages++;
            if (loadedImages === totalImages) {
              setTimeout(() => printWindow.print(), 250);
            }
          };
        }
      });
    }
  };


  return (
    <Layout>
      <SEO
        title="Verify Certificate | Waste Institute"
        description="Verify the authenticity of Waste Institute certificates"
        canonical="https://wasteinstitute.org/verify"
        noindex={true}
      />
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <Award size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Verify Certificate</h1>
            <p className="text-xl text-emerald-50">
              Enter a verification code or certificate ID to verify authenticity
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 mb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="certificate-id"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Verification Code or Certificate ID
                  </label>
                  <input
                    type="text"
                    id="certificate-id"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., ABCD-1234-EFGH-5678)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !certificateId.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Verify Certificate
                    </>
                  )}
                </button>
              </form>
            </div>

            {searched && !loading && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  {certificate ? (
                    <div className="relative">
                      <div className="absolute top-0 right-0 mt-8 mr-8 transform rotate-12 z-20">
                        <div className="bg-emerald-600 text-white px-8 py-3 rounded-lg shadow-lg text-2xl font-bold border-4 border-emerald-700">
                          VERIFIED
                        </div>
                      </div>
                      <div className="bg-emerald-50 border-b border-emerald-100 p-6">
                        <div className="flex items-center gap-3 text-emerald-700">
                          <div className="bg-emerald-100 p-3 rounded-full">
                            <CheckCircle size={32} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Certificate Verified</h3>
                            <p className="text-emerald-600">This is a valid certificate</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 sm:p-8 space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-1">
                            Verification Code
                          </label>
                          <p className="text-lg font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                            {certificate.verification_code}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-1">
                            Recipient
                          </label>
                          <p className="text-lg text-gray-900 flex items-center gap-2">
                            <User size={18} />
                            {certificate.user.full_name}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-1">
                            Course
                          </label>
                          <p className="text-lg text-gray-900 font-semibold">
                            {certificate.course.title}
                          </p>
                          <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                            {certificate.course.level}
                          </span>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-1">
                            Issue Date
                          </label>
                          <p className="text-lg text-gray-900 flex items-center gap-2">
                            <Calendar size={18} />
                            {new Date(certificate.issued_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={handlePrint}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            <Printer size={20} />
                            Print Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                ) : notFound ? (
                  <div>
                    <div className="bg-red-50 border-b border-red-100 p-6">
                      <div className="flex items-center gap-3 text-red-700">
                        <div className="bg-red-100 p-3 rounded-full">
                          <XCircle size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Certificate Not Found</h3>
                          <p className="text-red-600">This certificate ID is not valid</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8">
                      <p className="text-gray-600">
                        The certificate ID <span className="font-mono font-semibold">{certificateId}</span> does not exist in our system.
                        Please check the ID and try again.
                      </p>
                    </div>
                  </div>
                ) : null}
                </div>

                {certificate && (
                  <div className="hidden">
                    <CertificateTemplate
                      ref={certificateRef}
                      studentName={certificate.user.full_name}
                      courseTitle={certificate.course.title}
                      issueDate={certificate.issued_date}
                      verificationCode={certificate.verification_code}
                      certificateId={certificate.certificate_id}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
