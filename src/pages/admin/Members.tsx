import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Award, Calendar, CheckCircle, XCircle, Clock, Filter, Plus, Trash2, X, Save } from 'lucide-react';

interface Member {
  id: string;
  user_id: string;
  membership_level_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  payment_frequency: string | null;
  auto_renew: boolean;
  created_at: string;
  user_profile: {
    full_name: string;
    email: string;
  };
  membership_level: {
    name: string;
    post_nominals: string | null;
    annual_fee: number;
  };
}

interface MembershipLevel {
  id: string;
  name: string;
  annual_fee: number;
}

interface UserProfileOption {
  id: string;
  full_name: string;
  email: string;
}

export function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [membershipLevels, setMembershipLevels] = useState<MembershipLevel[]>([]);
  const [userOptions, setUserOptions] = useState<UserProfileOption[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    user_id: '',
    membership_level_id: '',
    status: 'pending',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    payment_frequency: 'annual',
    auto_renew: false,
  });

  useEffect(() => {
    loadMembers();
    loadOptions();
  }, []);

  async function loadOptions() {
    const [levelsRes, usersRes] = await Promise.all([
      supabase.from('membership_levels').select('id, name, annual_fee').order('name'),
      supabase.from('user_profiles').select('id, full_name, email').order('full_name'),
    ]);
    if (levelsRes.data) setMembershipLevels(levelsRes.data);
    if (usersRes.data) setUserOptions(usersRes.data);
  }

  async function loadMembers() {
    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select(`
          *,
          user_profile:user_profiles!user_memberships_user_id_fkey(full_name, email),
          membership_level:membership_levels(name, post_nominals, annual_fee)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateMemberStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('user_memberships')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setMembers(members.map(m =>
        m.id === id ? { ...m, status: newStatus } : m
      ));
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('Error updating member status.');
    }
  }

  async function createMembership(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.user_id || !createForm.membership_level_id) {
      alert('Please select a user and membership level.');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        user_id: createForm.user_id,
        membership_level_id: createForm.membership_level_id,
        status: createForm.status,
        start_date: createForm.start_date || null,
        end_date: createForm.end_date || null,
        payment_frequency: createForm.payment_frequency,
        auto_renew: createForm.auto_renew,
      };
      const { error } = await supabase.from('user_memberships').insert([payload]);
      if (error) throw error;
      setShowCreateForm(false);
      setCreateForm({
        user_id: '',
        membership_level_id: '',
        status: 'pending',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        payment_frequency: 'annual',
        auto_renew: false,
      });
      await loadMembers();
    } catch (error) {
      console.error('Error creating membership:', error);
      alert('Failed to create membership.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember(id: string) {
    if (!confirm('Are you sure you want to delete this membership? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('user_memberships').delete().eq('id', id);
      if (error) throw error;
      setMembers(members.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting membership:', error);
      alert('Failed to delete membership.');
    } finally {
      setDeleting(null);
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesSearch = !searchTerm ||
      member.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membership_level?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    pending: members.filter(m => m.status === 'pending').length,
    expired: members.filter(m => m.status === 'expired').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Management</h1>
          <p className="text-gray-600 mt-1">View and manage all member subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Membership
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add Membership</h2>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={createMembership} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  required
                  value={createForm.user_id}
                  onChange={(e) => setCreateForm({ ...createForm, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a user...</option>
                  {userOptions.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Level</label>
                <select
                  required
                  value={createForm.membership_level_id}
                  onChange={(e) => setCreateForm({ ...createForm, membership_level_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a level...</option>
                  {membershipLevels.map(l => (
                    <option key={l.id} value={l.id}>{l.name} — £{l.annual_fee}/yr</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={createForm.start_date}
                    onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={createForm.end_date}
                    onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Frequency</label>
                <select
                  value={createForm.payment_frequency}
                  onChange={(e) => setCreateForm({ ...createForm, payment_frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="annual">Annual</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto_renew"
                  checked={createForm.auto_renew}
                  onChange={(e) => setCreateForm({ ...createForm, auto_renew: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="auto_renew" className="text-sm text-gray-700">Auto-renew</label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Create Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <Users className="text-gray-400" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{stats.pending}</p>
            </div>
            <Clock className="text-amber-400" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.expired}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or membership level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {member.user_profile?.full_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user_profile?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Award className="text-emerald-600" size={16} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.membership_level?.name || 'Unknown'}
                        </div>
                        {member.membership_level?.post_nominals && (
                          <div className="text-xs text-gray-500">
                            {member.membership_level.post_nominals}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : member.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(member.start_date).toLocaleDateString()}
                        </div>
                      )}
                      {member.end_date && (
                        <div className="text-xs text-gray-500 mt-1">
                          Until: {new Date(member.end_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        £{member.membership_level?.annual_fee?.toFixed(2) || '0.00'}
                      </div>
                      {member.payment_frequency && (
                        <div className="text-xs text-gray-500 capitalize">
                          {member.payment_frequency}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={member.status}
                      onChange={(e) => updateMemberStatus(member.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => deleteMember(member.id)}
                      disabled={deleting === member.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Delete membership"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Members will appear here when they subscribe'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Membership Management Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Activate pending memberships after payment verification</li>
          <li>Members with expired subscriptions can be renewed or marked as expired</li>
          <li>Cancelled memberships retain access until the end date</li>
          <li>Course discounts are automatically applied for active members</li>
        </ul>
      </div>
    </div>
  );
}
