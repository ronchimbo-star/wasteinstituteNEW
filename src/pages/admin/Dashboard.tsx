import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BookOpen, Users, Newspaper, FileText, MessageSquare, UserPlus } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    users: 0,
    news: 0,
    pages: 0,
    contacts: 0,
    registrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [courses, profiles, news, pages, contacts, registrations] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('news_articles').select('id', { count: 'exact', head: true }),
        supabase.from('static_pages').select('id', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
        supabase.from('registration_submissions').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        courses: courses.count || 0,
        users: profiles.count || 0,
        news: news.count || 0,
        pages: pages.count || 0,
        contacts: contacts.count || 0,
        registrations: registrations.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: BookOpen, label: 'Total Courses', value: stats.courses, color: 'emerald' },
    { icon: Users, label: 'Total Users', value: stats.users, color: 'blue' },
    { icon: Newspaper, label: 'News Articles', value: stats.news, color: 'purple' },
    { icon: FileText, label: 'Static Pages', value: stats.pages, color: 'orange' },
    { icon: MessageSquare, label: 'Contact Forms', value: stats.contacts, color: 'pink' },
    { icon: UserPlus, label: 'Registrations', value: stats.registrations, color: 'teal' },
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to WasteInstitute Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/courses"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <BookOpen className="text-emerald-600" />
            <span className="font-medium">Manage Courses</span>
          </a>
          <a
            href="/admin/news"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <Newspaper className="text-emerald-600" />
            <span className="font-medium">Create News Article</span>
          </a>
          <a
            href="/admin/pages"
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <FileText className="text-emerald-600" />
            <span className="font-medium">Manage Pages</span>
          </a>
        </div>
      </div>
    </div>
  );
};
