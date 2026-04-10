import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ClipboardList, Search, RefreshCw, User, Calendar, Filter } from 'lucide-react';

interface AuditEntry {
  id: string;
  user_id: string | null;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create:    'bg-emerald-100 text-emerald-800',
  update:    'bg-blue-100 text-blue-800',
  delete:    'bg-red-100 text-red-800',
  publish:   'bg-teal-100 text-teal-800',
  unpublish: 'bg-orange-100 text-orange-800',
  approve:   'bg-green-100 text-green-800',
  reject:    'bg-rose-100 text-rose-800',
  restore:   'bg-amber-100 text-amber-800',
};

const PAGE_SIZE = 50;

export const AdminAuditLog = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [viewingEntry, setViewingEntry] = useState<AuditEntry | null>(null);

  useEffect(() => {
    loadEntries();
  }, [page, filterAction, filterResource]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (filterAction) query = query.eq('action', filterAction);
      if (filterResource) query = query.eq('resource', filterResource);

      const { data, error, count } = await query;
      if (error) throw error;
      setEntries(data ?? []);
      setTotal(count ?? 0);
    } catch (error) {
      console.error('Error loading audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const filtered = entries.filter(e =>
    !searchTerm ||
    e.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.resource_id ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueActions = Array.from(new Set(entries.map(e => e.action)));
  const uniqueResources = Array.from(new Set(entries.map(e => e.resource)));

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-emerald-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-gray-600 mt-1">Track all admin actions across the platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
            {total} total entries
          </span>
          <button
            onClick={() => { setPage(0); loadEntries(); }}
            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by email or resource..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={filterAction}
            onChange={e => { setFilterAction(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filterResource}
            onChange={e => { setFilterResource(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="">All Resources</option>
            {uniqueResources.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {viewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Audit Entry Details</h2>
              <button onClick={() => setViewingEntry(null)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Action</span>
                  <p className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[viewingEntry.action] ?? 'bg-gray-100 text-gray-700'}`}>
                      {viewingEntry.action}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Resource</span>
                  <p className="mt-1 text-gray-900">{viewingEntry.resource}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Resource ID</span>
                  <p className="mt-1 font-mono text-gray-900 text-xs">{viewingEntry.resource_id ?? '—'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Performed By</span>
                  <p className="mt-1 text-gray-900">{viewingEntry.user_email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Timestamp</span>
                  <p className="mt-1 text-gray-900">{formatDate(viewingEntry.created_at)}</p>
                </div>
                {viewingEntry.ip_address && (
                  <div>
                    <span className="font-medium text-gray-500">IP Address</span>
                    <p className="mt-1 text-gray-900">{viewingEntry.ip_address}</p>
                  </div>
                )}
              </div>
              {viewingEntry.details && (
                <div>
                  <span className="block font-medium text-gray-500 mb-2 text-sm">Details</span>
                  <pre className="bg-gray-50 rounded-lg p-4 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(viewingEntry.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audit entries found</h3>
          <p className="text-gray-600">Admin actions will be recorded here as they happen.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map(entry => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {formatDate(entry.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="text-gray-400" />
                          {entry.user_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-700'}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.resource}</td>
                      <td className="px-6 py-4 text-xs font-mono text-gray-500 max-w-[120px] truncate">
                        {entry.resource_id ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        {entry.details && (
                          <button
                            onClick={() => setViewingEntry(entry)}
                            className="text-xs text-emerald-600 hover:underline"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filtered.length}</span> of{' '}
                <span className="font-semibold">{total}</span> entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page + 1}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
