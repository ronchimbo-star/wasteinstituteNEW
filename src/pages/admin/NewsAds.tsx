import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, CreditCard as Edit, Trash2, Eye, EyeOff, Save, X, CheckCircle, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface NewsAd {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  background_color: string;
  text_color: string;
  image_url: string | null;
  course_id: string | null;
  ad_type: 'course' | 'membership' | 'generic';
  is_active: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
}

interface ArticleAd {
  id: string;
  article_id: string;
  ad_id: string;
  position: number;
}

export default function NewsAds() {
  const [ads, setAds] = useState<NewsAd[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [articleAds, setArticleAds] = useState<ArticleAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<NewsAd | null>(null);
  const [selectedArticle, setSelectedArticle] = useState('');
  const [showAssignments, setShowAssignments] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cta_text: 'Learn More',
    cta_link: '',
    background_color: '#10b981',
    text_color: '#ffffff',
    image_url: '',
    course_id: '',
    ad_type: 'generic' as 'course' | 'membership' | 'generic',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adsRes, coursesRes, articlesRes, articleAdsRes] = await Promise.all([
        supabase.from('news_ads').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('id, title, slug').eq('published', true),
        supabase.from('news_articles').select('id, title, slug').eq('published', true),
        supabase.from('news_article_ads').select('*')
      ]);

      if (adsRes.data) setAds(adsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (articlesRes.data) setArticles(articlesRes.data);
      if (articleAdsRes.data) setArticleAds(articleAdsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAd) {
        await supabase.from('news_ads').update(formData).eq('id', editingAd.id);
      } else {
        await supabase.from('news_ads').insert([formData]);
      }
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving ad:', error);
    }
  };

  const toggleActive = async (ad: NewsAd) => {
    try {
      await supabase.from('news_ads').update({ is_active: !ad.is_active }).eq('id', ad.id);
      loadData();
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      await supabase.from('news_ads').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting ad:', error);
    }
  };

  const assignAdToArticle = async (adId: string, position: 1 | 2) => {
    if (!selectedArticle) return;
    try {
      const existing = articleAds.find(
        aa => aa.article_id === selectedArticle && aa.position === position
      );

      if (existing) {
        await supabase.from('news_article_ads').update({ ad_id: adId }).eq('id', existing.id);
      } else {
        await supabase.from('news_article_ads').insert([{
          article_id: selectedArticle,
          ad_id: adId,
          position
        }]);
      }
      loadData();
    } catch (error) {
      console.error('Error assigning ad:', error);
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      await supabase.from('news_article_ads').delete().eq('id', assignmentId);
      loadData();
    } catch (error) {
      console.error('Error removing assignment:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      cta_text: 'Learn More',
      cta_link: '',
      background_color: '#10b981',
      text_color: '#ffffff',
      image_url: '',
      course_id: '',
      ad_type: 'generic',
      is_active: true
    });
    setEditingAd(null);
    setShowForm(false);
  };

  const startEdit = (ad: NewsAd) => {
    setFormData({
      title: ad.title,
      description: ad.description,
      cta_text: ad.cta_text,
      cta_link: ad.cta_link,
      background_color: ad.background_color,
      text_color: ad.text_color,
      image_url: ad.image_url || '',
      course_id: ad.course_id || '',
      ad_type: ad.ad_type,
      is_active: ad.is_active
    });
    setEditingAd(ad);
    setShowForm(true);
  };

  const getArticleAssignments = (articleId: string) => {
    return articleAds.filter(aa => aa.article_id === articleId);
  };

  const getAdTitle = (adId: string) => {
    return ads.find(ad => ad.id === adId)?.title || 'Unknown Ad';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Promotional Cards</h1>
          <p className="text-gray-600 mt-2">Manage promotional ads displayed within news articles</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAssignments(!showAssignments)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {showAssignments ? 'Hide' : 'Show'} Assignments
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Create New Ad
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAd ? 'Edit Ad' : 'Create New Ad'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Type</label>
                <select
                  value={formData.ad_type}
                  onChange={(e) => setFormData({ ...formData, ad_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="generic">Generic</option>
                  <option value="course">Course</option>
                  <option value="membership">Membership</option>
                </select>
              </div>

              {formData.ad_type === 'course' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link to Course (Optional)</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => {
                      const course = courses.find(c => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        course_id: e.target.value,
                        cta_link: course ? `/courses/${course.slug}` : ''
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CTA Link</label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="/courses or /membership"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Background Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="h-10 w-20 rounded-lg border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.background_color}
                      onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Text Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="h-10 w-20 rounded-lg border border-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.text_color}
                      onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active (available for assignment)</label>
              </div>

              <div className="p-6 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preview:</p>
                <div
                  className="rounded-xl p-6 shadow-lg"
                  style={{ backgroundColor: formData.background_color, color: formData.text_color }}
                >
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold mb-2">{formData.title || 'Ad Title'}</h3>
                  <p className="mb-4 opacity-90">{formData.description || 'Ad description'}</p>
                  <button
                    type="button"
                    className="px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold"
                  >
                    {formData.cta_text}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save size={20} />
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-6 mb-8">
        {ads.map(ad => (
          <div
            key={ad.id}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{ad.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ad.ad_type === 'course' ? 'bg-blue-100 text-blue-700' :
                      ad.ad_type === 'membership' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ad.ad_type}
                    </span>
                    {ad.is_active ? (
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle size={12} />
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{ad.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <LinkIcon size={14} />
                      {ad.cta_link}
                    </span>
                    {ad.image_url && (
                      <span className="flex items-center gap-1">
                        <ImageIcon size={14} />
                        Has image
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(ad)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={ad.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {ad.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                  <button
                    onClick={() => startEdit(ad)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => deleteAd(ad.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: ad.background_color, color: ad.text_color }}
              >
                {ad.image_url && (
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h4 className="font-bold mb-1">{ad.title}</h4>
                <p className="text-sm mb-3 opacity-90">{ad.description.substring(0, 100)}...</p>
                <span className="inline-block px-4 py-1 bg-white text-gray-900 rounded-lg text-sm font-semibold">
                  {ad.cta_text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAssignments && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Ads to Articles</h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Article</label>
            <select
              value={selectedArticle}
              onChange={(e) => setSelectedArticle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Choose an article...</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>{article.title}</option>
              ))}
            </select>
          </div>

          {selectedArticle && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Position 1 (1/3 through article)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ads.filter(ad => ad.is_active).map(ad => {
                    const isAssigned = articleAds.some(
                      aa => aa.article_id === selectedArticle && aa.ad_id === ad.id && aa.position === 1
                    );
                    return (
                      <button
                        key={ad.id}
                        onClick={() => assignAdToArticle(ad.id, 1)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isAssigned
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 mb-1">{ad.title}</h4>
                        <p className="text-sm text-gray-600">{ad.ad_type}</p>
                        {isAssigned && (
                          <span className="text-xs text-emerald-600 font-semibold mt-2 inline-block">
                            Currently assigned
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Position 2 (2/3 through article)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ads.filter(ad => ad.is_active).map(ad => {
                    const isAssigned = articleAds.some(
                      aa => aa.article_id === selectedArticle && aa.ad_id === ad.id && aa.position === 2
                    );
                    return (
                      <button
                        key={ad.id}
                        onClick={() => assignAdToArticle(ad.id, 2)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isAssigned
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 mb-1">{ad.title}</h4>
                        <p className="text-sm text-gray-600">{ad.ad_type}</p>
                        {isAssigned && (
                          <span className="text-xs text-emerald-600 font-semibold mt-2 inline-block">
                            Currently assigned
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Current Assignments</h3>
                {getArticleAssignments(selectedArticle).map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <span className="font-semibold">Position {assignment.position}:</span>{' '}
                      {getAdTitle(assignment.ad_id)}
                    </div>
                    <button
                      onClick={() => removeAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {getArticleAssignments(selectedArticle).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No ads assigned to this article yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
