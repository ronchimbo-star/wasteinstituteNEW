import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Download, CreditCard, FileText, DollarSign, Calendar } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  payment_method: string;
  created_at: string;
  enrollment: {
    course: {
      title: string;
    };
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  status: string;
  issued_at: string;
  course_title: string;
  billing_details: any;
}

export default function MyPayments() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices'>('payments');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    await Promise.all([loadPayments(), loadInvoices()]);
    setLoading(false);
  };

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        enrollment:course_enrollments(
          course:courses(title)
        )
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setPayments(data as any);
  };

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setInvoices(data);
  };

  const downloadInvoice = (invoice: Invoice) => {
    const invoiceContent = `
INVOICE ${invoice.invoice_number}

Date: ${new Date(invoice.issued_at).toLocaleDateString()}
Status: ${invoice.status}

---

Course: ${invoice.course_title}
Amount: $${Number(invoice.total_amount).toFixed(2)} ${invoice.currency}

---

Thank you for your business!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoice_number}.txt`;
    a.click();
  };

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>My Payments | Waste Institute</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h1>
            <p className="text-gray-600">View your payment history and download invoices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Paid</p>
                <DollarSign className="text-emerald-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Payments</p>
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              <p className="text-xs text-gray-500 mt-1">Transactions</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Invoices</p>
                <FileText className="text-purple-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              <p className="text-xs text-gray-500 mt-1">Available</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'payments'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Payment History ({payments.length})
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === 'invoices'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Invoices ({invoices.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">No payments yet</p>
                    </div>
                  ) : (
                    payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-lg">
                            <CreditCard className="text-emerald-600" size={24} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.enrollment?.course?.title || 'Course Payment'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar size={14} className="text-gray-400" />
                              <p className="text-sm text-gray-600">
                                {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                              </p>
                              {payment.payment_method && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-sm text-gray-600">{payment.payment_method}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${Number(payment.amount).toFixed(2)} {payment.currency}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="space-y-4">
                  {invoices.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">No invoices available</p>
                    </div>
                  ) : (
                    invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-lg">
                            <FileText className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-sm text-gray-600">{invoice.course_title}</p>
                              <span className="text-gray-400">•</span>
                              <p className="text-sm text-gray-600">
                                {new Date(invoice.issued_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${Number(invoice.total_amount).toFixed(2)} {invoice.currency}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                invoice.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : invoice.status === 'issued'
                                  ? 'bg-blue-100 text-blue-800'
                                  : invoice.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {invoice.status}
                            </span>
                          </div>
                          <button
                            onClick={() => downloadInvoice(invoice)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
