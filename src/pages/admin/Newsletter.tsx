import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Download, Trash2, Users } from 'lucide-react';

interface Subscription {
  id: string;
  email: string;
  first_name: string;
  status: string;
  source: string;
  subscribed_at: string;
}

export function AdminNewsletter() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('active');

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    const query = supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (statusFilter !== 'all') {
      query.eq('status', statusFilter);
    }

    const { data } = await query;
    if (data) setSubscriptions(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('newsletter_subscriptions')
      .update({ status, ...(status === 'unsubscribed' ? { unsubscribed_at: new Date().toISOString() } : {}) })
      .eq('id', id);
    setSubscriptions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s).filter((s) => statusFilter === 'all' || s.status === statusFilter));
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm('Permanently delete this subscription?')) return;
    await supabase.from('newsletter_subscriptions').delete().eq('id', id);
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const exportCSV = () => {
    const headers = ['Email', 'First Name', 'Status', 'Source', 'Subscribed At'];
    const rows = subscriptions.map((s) => [
      s.email,
      s.first_name || '',
      s.status,
      s.source || '',
      new Date(s.subscribed_at).toLocaleDateString('en-GB'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscriptions</h1>
          <p className="text-gray-600">Manage email newsletter subscribers</p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Users className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subscriptions.filter((s) => s.status === 'active').length || activeCount}</p>
              <p className="text-sm text-gray-500">Active Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Mail className="text-gray-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              <p className="text-sm text-gray-500">Showing ({statusFilter})</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {(['active', 'unsubscribed', 'bounced', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                statusFilter === s ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">No subscriptions found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sub.first_name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 capitalize">{sub.source || 'website'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      sub.status === 'unsubscribed' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(sub.subscribed_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {sub.status === 'active' && (
                        <button
                          onClick={() => updateStatus(sub.id, 'unsubscribed')}
                          className="text-xs text-gray-500 hover:text-amber-600 transition-colors px-2 py-1 hover:bg-amber-50 rounded"
                        >
                          Unsubscribe
                        </button>
                      )}
                      {sub.status === 'unsubscribed' && (
                        <button
                          onClick={() => updateStatus(sub.id, 'active')}
                          className="text-xs text-gray-500 hover:text-emerald-600 transition-colors px-2 py-1 hover:bg-emerald-50 rounded"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => deleteSubscription(sub.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
