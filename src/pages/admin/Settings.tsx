import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Settings as SettingsIcon } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: string;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, key: string, value: string) => {
    setSavingKey(key);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      alert(`${formatKey(key)} updated successfully`);
    } catch (error) {
      console.error('Error updating setting:', error);
      alert('Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  };

  const handleChange = (id: string, value: string) => {
    setSettings(settings.map((s) => (s.id === id ? { ...s, value } : s)));
  };

  const formatKey = (key: string): string => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getInputType = (key: string): string => {
    if (key.includes('email')) return 'email';
    if (key.includes('color')) return 'color';
    if (key.includes('url') || key.includes('logo') || key.includes('favicon')) return 'url';
    return 'text';
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      site_name: 'The name of your website',
      header_logo: 'Logo displayed in the header (URL)',
      footer_logo: 'Logo displayed in the footer (URL)',
      favicon: 'Favicon for browser tabs (URL)',
      primary_color: 'Primary brand color (hex code)',
      admin_email: 'Email for admin notifications',
      google_analytics_id: 'Google Analytics Measurement ID (e.g., G-XXXXXXXXXX)',
    };
    return descriptions[key] || '';
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
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-emerald-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
            <p className="text-gray-600 mt-2">Configure your website settings</p>
          </div>
        </div>
      </div>

      {settings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <SettingsIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No settings found</h3>
          <p className="text-gray-600">Site settings will be created automatically</p>
        </div>
      ) : (
        <div className="space-y-6">
          {settings.map((setting) => (
            <div key={setting.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {formatKey(setting.key)}
                  </label>
                  {getSettingDescription(setting.key) && (
                    <p className="text-sm text-gray-500 mb-3">
                      {getSettingDescription(setting.key)}
                    </p>
                  )}
                  <div className="flex gap-3 items-start">
                    {setting.key.includes('color') ? (
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          value={setting.value || '#10b981'}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={setting.value}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder={`Enter ${formatKey(setting.key).toLowerCase()}`}
                        />
                      </div>
                    ) : (
                      <input
                        type={getInputType(setting.key)}
                        value={setting.value}
                        onChange={(e) => handleChange(setting.id, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={`Enter ${formatKey(setting.key).toLowerCase()}`}
                      />
                    )}
                    <button
                      onClick={() => updateSetting(setting.id, setting.key, setting.value)}
                      disabled={savingKey === setting.key}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <Save size={18} />
                      {savingKey === setting.key ? 'Saving...' : 'Update'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
