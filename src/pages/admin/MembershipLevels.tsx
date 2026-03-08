import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Award, DollarSign, Percent } from 'lucide-react';

interface MembershipLevel {
  id: string;
  name: string;
  slug: string;
  post_nominals: string | null;
  description: string;
  criteria: string;
  benefits: string;
  annual_fee: number;
  quarterly_fee: number | null;
  monthly_fee: number | null;
  display_order: number;
  is_invitation_only: boolean;
  course_discount_percent: number;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  page_content: string | null;
  created_at: string;
  updated_at: string;
}

export function MembershipLevels() {
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadLevels();
  }, []);

  async function loadLevels() {
    try {
      const { data, error } = await supabase
        .from('membership_levels')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error loading membership levels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this membership level?')) return;

    try {
      const { error } = await supabase
        .from('membership_levels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLevels(levels.filter(l => l.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting membership level:', error);
      alert('Error deleting membership level. It may be in use.');
    }
  }

  async function togglePublished(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('membership_levels')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setLevels(levels.map(l =>
        l.id === id ? { ...l, published: !currentStatus } : l
      ));
    } catch (error) {
      console.error('Error updating membership level:', error);
      alert('Error updating membership level status.');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Levels</h1>
          <p className="text-gray-600 mt-1">Manage membership tiers, pricing, and benefits</p>
        </div>
        <Link
          to="/admin/membership-levels/new"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Level
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post Nominals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {levels.map((level) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {level.display_order}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {level.name}
                        {level.is_invitation_only && (
                          <Award className="text-amber-500" size={16} />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">/{level.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 font-semibold">
                      {level.post_nominals || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        £{level.annual_fee.toFixed(2)}
                      </div>
                      {level.quarterly_fee && (
                        <div className="text-xs text-gray-500">
                          £{level.quarterly_fee.toFixed(2)}/qtr
                        </div>
                      )}
                      {level.monthly_fee && (
                        <div className="text-xs text-gray-500">
                          £{level.monthly_fee.toFixed(2)}/mo
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <Percent size={12} className="mr-1" />
                      {level.course_discount_percent}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublished(level.id, level.published)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        level.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {level.published ? (
                        <>
                          <Eye size={12} className="mr-1" />
                          Published
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" />
                          Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {level.meta_title ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Configured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Not Set
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/membership-levels/${level.id}`}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(level.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {levels.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No membership levels</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new membership level.</p>
            <div className="mt-6">
              <Link
                to="/admin/membership-levels/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus size={20} className="mr-2" />
                Add Membership Level
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">About Membership Levels</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Each membership level can have its own dedicated page with SEO optimization</li>
          <li>Display order controls how levels appear on the public membership page</li>
          <li>Course discounts are automatically applied at checkout for active members</li>
          <li>Mark levels as "invitation only" for exclusive tiers like Fellowship</li>
          <li>Unpublished levels are only visible to administrators</li>
        </ul>
      </div>
    </div>
  );
}
