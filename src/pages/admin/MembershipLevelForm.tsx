import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, ArrowLeft, Award } from 'lucide-react';

interface FormData {
  name: string;
  slug: string;
  post_nominals: string;
  description: string;
  criteria: string;
  benefits: string;
  annual_fee: string;
  quarterly_fee: string;
  monthly_fee: string;
  display_order: string;
  is_invitation_only: boolean;
  course_discount_percent: string;
  published: boolean;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  page_content: string;
}

export function MembershipLevelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    post_nominals: '',
    description: '',
    criteria: '',
    benefits: '',
    annual_fee: '0.00',
    quarterly_fee: '',
    monthly_fee: '',
    display_order: '0',
    is_invitation_only: false,
    course_discount_percent: '0',
    published: true,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    page_content: '',
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadLevel();
    }
  }, [id]);

  async function loadLevel() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('membership_levels')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          post_nominals: data.post_nominals || '',
          description: data.description || '',
          criteria: data.criteria || '',
          benefits: data.benefits || '',
          annual_fee: data.annual_fee?.toString() || '0.00',
          quarterly_fee: data.quarterly_fee?.toString() || '',
          monthly_fee: data.monthly_fee?.toString() || '',
          display_order: data.display_order?.toString() || '0',
          is_invitation_only: data.is_invitation_only || false,
          course_discount_percent: data.course_discount_percent?.toString() || '0',
          published: data.published ?? true,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          page_content: data.page_content || '',
        });
      }
    } catch (error) {
      console.error('Error loading membership level:', error);
      alert('Error loading membership level');
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        name: formData.name,
        slug: formData.slug,
        post_nominals: formData.post_nominals || null,
        description: formData.description,
        criteria: formData.criteria,
        benefits: formData.benefits,
        annual_fee: parseFloat(formData.annual_fee) || 0,
        quarterly_fee: formData.quarterly_fee ? parseFloat(formData.quarterly_fee) : null,
        monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
        display_order: parseInt(formData.display_order) || 0,
        is_invitation_only: formData.is_invitation_only,
        course_discount_percent: parseInt(formData.course_discount_percent) || 0,
        published: formData.published,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords || null,
        page_content: formData.page_content || null,
        updated_at: new Date().toISOString(),
      };

      if (id && id !== 'new') {
        const { error } = await supabase
          .from('membership_levels')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('membership_levels')
          .insert([dataToSave]);

        if (error) throw error;
      }

      navigate('/admin/membership-levels');
    } catch (error: any) {
      console.error('Error saving membership level:', error);
      alert('Error saving membership level: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/membership-levels')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {id && id !== 'new' ? 'Edit Membership Level' : 'New Membership Level'}
          </h1>
          <p className="text-gray-600 mt-1">Configure membership tier details and SEO</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award size={20} />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Associate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., associate"
              />
              <p className="text-xs text-gray-500 mt-1">URL: /membership/{formData.slug}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Nominals
              </label>
              <input
                type="text"
                value={formData.post_nominals}
                onChange={(e) => setFormData({ ...formData, post_nominals: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., AssocIW, TechIW, CIWM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order *
              </label>
              <input
                type="number"
                required
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Brief overview of this membership level..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Criteria & Requirements *
            </label>
            <textarea
              required
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Who is eligible for this level? What are the requirements?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefits *
            </label>
            <textarea
              required
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="List all benefits (use bullet points with •)"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Pricing & Discounts</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Fee (£) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.annual_fee}
                onChange={(e) => setFormData({ ...formData, annual_fee: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quarterly Fee (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quarterly_fee}
                onChange={(e) => setFormData({ ...formData, quarterly_fee: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Fee (£)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monthly_fee}
                onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Discount (%) *
            </label>
            <input
              type="number"
              required
              value={formData.course_discount_percent}
              onChange={(e) => setFormData({ ...formData, course_discount_percent: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              min="0"
              max="100"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">Members get this percentage off all courses</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., Associate Membership (AssocIW) | Waste Institute"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.meta_title.length}/60 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Brief description for search engines..."
              maxLength={155}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/155 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              value={formData.meta_keywords}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Content
            </label>
            <textarea
              value={formData.page_content}
              onChange={(e) => setFormData({ ...formData, page_content: e.target.value })}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Additional content for the dedicated membership level page..."
            />
            <p className="text-xs text-gray-500 mt-1">This appears on the individual membership level page</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="invitation_only"
              checked={formData.is_invitation_only}
              onChange={(e) => setFormData({ ...formData, is_invitation_only: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="invitation_only" className="text-sm font-medium text-gray-700">
              Invitation Only (e.g., Fellowship)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Published (visible to public)
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/membership-levels')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Level'}
          </button>
        </div>
      </form>
    </div>
  );
}
