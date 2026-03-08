import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PoundSterling, TrendingUp, Users, CreditCard, Download, Search, Filter } from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at: string;
  user_id: string;
  enrollment: {
    course: {
      title: string;
    };
  };
  user_profiles: {
    full_name: string;
    email: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  status: string;
  issued_at: string;
  user_profiles: {
    full_name: string;
    email: string;
  };
  course_title: string;
}

interface Stats {
  totalRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
}

export default function Financials() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'invoices'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadPayments(), loadInvoices()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, status');

    if (paymentsData) {
      const totalRevenue = paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const completedPayments = paymentsData.filter(p => p.status === 'completed').length;
      const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;

      setStats({
        totalRevenue,
        totalPayments: paymentsData.length,
        completedPayments,
        pendingPayments,
      });
    }
  };

  const loadPayments = async () => {
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        enrollment:course_enrollments(
          course:courses(title)
        ),
        user_profiles!payments_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setPayments(data as any);
  };

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select(`
        *,
        user_profiles!invoices_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) setInvoices(data as any);
  };

  const exportPayments = () => {
    const csv = [
      ['Date', 'Student', 'Email', 'Course', 'Amount', 'Status'].join(','),
      ...payments.map(p => [
        new Date(p.paid_at || p.created_at).toLocaleDateString(),
        p.user_profiles?.full_name || 'N/A',
        p.user_profiles?.email || 'N/A',
        p.enrollment?.course?.title || 'N/A',
        `${p.amount} ${p.currency}`,
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = searchTerm === '' ||
      p.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.enrollment?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = searchTerm === '' ||
      i.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.user?.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.course_title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <button
          onClick={exportPayments}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Download size={20} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <PoundSterling className="text-emerald-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">£{stats.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Payments</p>
            <CreditCard className="text-blue-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
          <p className="text-xs text-gray-500 mt-1">All transactions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
          <p className="text-xs text-gray-500 mt-1">Successful payments</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <Users className="text-orange-600" size={24} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payments ({payments.length})
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
          {(activeTab === 'payments' || activeTab === 'invoices') && (
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by student, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {payments.slice(0, 10).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {payment.user?.user_profiles?.full_name || payment.user?.email}
                        </p>
                        <p className="text-sm text-gray-600">{payment.enrollment?.course?.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${Number(payment.amount).toFixed(2)} {payment.currency}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.user?.user_profiles?.full_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">{payment.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {payment.enrollment?.course?.title || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ${Number(payment.amount).toFixed(2)} {payment.currency}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {payment.payment_method || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(invoice.issued_at || invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {invoice.user_profiles?.full_name || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">{invoice.user_profiles?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {invoice.course_title}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ${Number(invoice.total_amount).toFixed(2)} {invoice.currency}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
