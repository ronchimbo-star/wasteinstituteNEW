import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { Plus, CreditCard as Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';

interface Sector {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  show_in_public: boolean;
  created_at: string;
}

interface SectorForm {
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  show_in_public: boolean;
}

const initialFormState: SectorForm = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  display_order: 0,
  show_in_public: true,
};

export const AdminSectors = () => {
  const { toast } = useToast();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SectorForm>(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSectors(data || []);
    } catch (error) {
      console.error('Error loading sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (sector?: Sector) => {
    if (sector) {
      setEditingId(sector.id);
      setFormData({
        name: sector.name,
        slug: sector.slug,
        description: sector.description,
        icon: sector.icon,
        display_order: sector.display_order,
        show_in_public: sector.show_in_public,
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('sectors')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('sectors').insert([formData]);
        if (error) throw error;
      }

      await loadSectors();
      closeModal();
    } catch (error) {
      console.error('Error saving sector:', error);
      toast('Failed to save sector', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublicVisibility = async (sector: Sector) => {
    try {
      const { error } = await supabase
        .from('sectors')
        .update({ show_in_public: !sector.show_in_public })
        .eq('id', sector.id);

      if (error) throw error;
      setSectors(prev => prev.map(s => s.id === sector.id ? { ...s, show_in_public: !s.show_in_public } : s));
    } catch (error) {
      console.error('Error updating sector visibility:', error);
    }
  };

  const deleteSector = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sector?')) return;

    try {
      const { error } = await supabase.from('sectors').delete().eq('id', id);
      if (error) throw error;
      setSectors(sectors.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Error deleting sector:', error);
      toast('Failed to delete sector', 'error');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'display_order' ? parseInt(value) || 0 : value,
    }));
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sectors</h1>
          <p className="text-gray-600 mt-2">Manage course sectors and categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Add Sector
        </button>
      </div>

      {sectors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sectors yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first sector</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Create Sector
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Public Filter</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sectors.map((sector) => (
                  <tr key={sector.id} className={`hover:bg-gray-50 ${!sector.show_in_public ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-900">{sector.display_order}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{sector.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sector.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sector.icon}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-md">{sector.description}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => togglePublicVisibility(sector)}
                        title={sector.show_in_public ? 'Visible in public filter — click to hide' : 'Hidden from public filter — click to show'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          sector.show_in_public
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {sector.show_in_public ? <Eye size={12} /> : <EyeOff size={12} />}
                        {sector.show_in_public ? 'Visible' : 'Admin only'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(sector)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteSector(sector.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Sector' : 'Add New Sector'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., renewable-energy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., wind, solar, leaf"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter icon name from lucide-react</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    id="show_in_public"
                    checked={formData.show_in_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, show_in_public: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <label htmlFor="show_in_public" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Show in public course filter
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Uncheck to keep this sector for internal admin use only — it will not appear in the public course catalogue filter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {submitting ? 'Saving...' : editingId ? 'Update Sector' : 'Create Sector'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
