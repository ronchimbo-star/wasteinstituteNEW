import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Newspaper,
  FileText,
  Image,
  Settings,
  Users,
  MessageSquare,
  UserPlus,
  Tag,
  Search,
  LogOut,
  Menu,
  X,
  Star,
  HelpCircle,
  FolderOpen,
  Upload,
  GraduationCap,
  Award,
  PoundSterling,
  Megaphone
} from 'lucide-react';
import { useState } from 'react';
import NotificationsPanel from './NotificationsPanel';

export const AdminLayout = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: PoundSterling, label: 'Financials', path: '/admin/financials' },
    { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
    { icon: Tag, label: 'Sectors', path: '/admin/sectors' },
    { icon: GraduationCap, label: 'Enrollments', path: '/admin/enrollments' },
    { icon: Award, label: 'Certificates', path: '/admin/certificates' },
    { icon: Users, label: 'Members', path: '/admin/members' },
    { icon: Award, label: 'Membership Levels', path: '/admin/membership-levels' },
    { icon: Newspaper, label: 'News', path: '/admin/news' },
    { icon: Megaphone, label: 'News Ads', path: '/admin/news-ads' },
    { icon: FileText, label: 'Pages', path: '/admin/pages' },
    { icon: Star, label: 'Testimonials', path: '/admin/testimonials' },
    { icon: HelpCircle, label: 'FAQs', path: '/admin/faqs' },
    { icon: FolderOpen, label: 'Resources', path: '/admin/resources' },
    { icon: Upload, label: 'Media Manager', path: '/admin/media-manager' },
    { icon: Image, label: 'Media', path: '/admin/media' },
    { icon: Search, label: 'SEO', path: '/admin/seo' },
    { icon: MessageSquare, label: 'Contact Forms', path: '/admin/contacts' },
    { icon: UserPlus, label: 'Registrations', path: '/admin/registrations' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-emerald-600">WI Admin</h1>
        <div className="flex items-center gap-2">
          <NotificationsPanel />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-emerald-600">WasteInstitute</h1>
            <p className="text-sm text-gray-600 mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="hidden lg:flex items-center justify-end px-8 py-4 bg-white border-b border-gray-200">
          <NotificationsPanel />
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
