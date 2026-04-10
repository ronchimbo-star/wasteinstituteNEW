import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Save, Loader } from 'lucide-react';

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  event_type: string;
  featured_image: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  online_link: string;
  is_online: boolean;
  capacity: string;
  price: string;
  currency: string;
  registration_deadline: string;
  organiser_name: string;
  organiser_email: string;
  published: boolean;
  featured: boolean;
  seo_title: string;
  seo_description: string;
}

const defaultForm: EventFormData = {
  title: '',
  slug: '',
  description: '',
  excerpt: '',
  event_type: 'webinar',
  featured_image: '',
  start_date: '',
  end_date: '',
  location: '',
  address: '',
  online_link: '',
  is_online: false,
  capacity: '',
  price: '0',
  currency: 'GBP',
  registration_deadline: '',
  organiser_name: 'Waste Institute',
  organiser_email: 'info@wasteinstitute.org',
  published: false,
  featured: false,
  seo_title: '',
  seo_description: '',
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function toLocalDatetimeValue(isoStr: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminEventForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    const { data } = await supabase.from('events').select('*').eq('id', eventId).maybeSingle();
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        excerpt: data.excerpt || '',
        event_type: data.event_type,
        featured_image: data.featured_image || '',
        start_date: toLocalDatetimeValue(data.start_date),
        end_date: toLocalDatetimeValue(data.end_date || ''),
        location: data.location || '',
        address: data.address || '',
        online_link: data.online_link || '',
        is_online: data.is_online,
        capacity: data.capacity?.toString() || '',
        price: data.price?.toString() || '0',
        currency: data.currency || 'GBP',
        registration_deadline: toLocalDatetimeValue(data.registration_deadline || ''),
        organiser_name: data.organiser_name || 'Waste Institute',
        organiser_email: data.organiser_email || 'info@wasteinstitute.org',
        published: data.published,
        featured: data.featured,
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
      });
    }
    setLoading(false);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      excerpt: form.excerpt.trim(),
      event_type: form.event_type,
      featured_image: form.featured_image.trim(),
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      location: form.location.trim(),
      address: form.address.trim(),
      online_link: form.online_link.trim(),
      is_online: form.is_online,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null,
      organiser_name: form.organiser_name.trim(),
      organiser_email: form.organiser_email.trim(),
      published: form.published,
      featured: form.featured,
      seo_title: form.seo_title.trim(),
      seo_description: form.seo_description.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = isEditing
      ? await supabase.from('events').update(payload).eq('id', id)
      : await supabase.from('events').insert(payload);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
    } else {
      navigate('/admin/events');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/events"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Event' : 'New Event'}</h1>
          <p className="text-gray-600 text-sm">{isEditing ? 'Update event details' : 'Create a new event or webinar'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
            <select
              value={form.event_type}
              onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="conference">Conference</option>
              <option value="cleanup">Community Cleanup</option>
              <option value="networking">Networking</option>
              <option value="training">Training</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              placeholder="Brief summary shown on listing cards"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={8}
              placeholder="Full event description visible on the event page"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
            <input
              type="url"
              value={form.featured_image}
              onChange={(e) => setForm({ ...form, featured_image: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline</label>
            <input
              type="datetime-local"
              value={form.registration_deadline}
              onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none sm:max-w-xs"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_online"
              checked={form.is_online}
              onChange={(e) => setForm({ ...form, is_online: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <label htmlFor="is_online" className="text-sm font-medium text-gray-700">This is an online event</label>
          </div>

          {form.is_online ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Online Join Link</label>
              <input
                type="url"
                value={form.online_link}
                onChange={(e) => setForm({ ...form, online_link: e.target.value })}
                placeholder="https://zoom.us/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Mildenhall Community Centre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  placeholder="Street, City, Postcode, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Pricing & Capacity</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (leave blank for unlimited)</label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="Unlimited"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Organiser</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organiser Name</label>
              <input
                type="text"
                value={form.organiser_name}
                onChange={(e) => setForm({ ...form, organiser_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organiser Email</label>
              <input
                type="email"
                value={form.organiser_email}
                onChange={(e) => setForm({ ...form, organiser_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input
              type="text"
              value={form.seo_title}
              onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
              placeholder={`${form.title} | Waste Institute`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
            <textarea
              value={form.seo_description}
              onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
              rows={2}
              placeholder="Short description for search engines (150–160 characters)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Visibility</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Published</span>
                <p className="text-xs text-gray-500">Visible to the public</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Featured</span>
                <p className="text-xs text-gray-500">Highlighted on the homepage</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pb-8">
          <Link
            to="/admin/events"
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
