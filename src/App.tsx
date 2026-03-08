import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { GoogleAnalytics } from './components/GoogleAnalytics';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/Home').then(m => ({ default: m.HomePage })));
const CoursesPage = lazy(() => import('./pages/Courses'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetail'));
const NewsPage = lazy(() => import('./pages/News'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetail'));
const LoginPage = lazy(() => import('./pages/Login'));
const SignUpPage = lazy(() => import('./pages/SignUp'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const MyPaymentsPage = lazy(() => import('./pages/MyPayments'));
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificate'));
const ContactPage = lazy(() => import('./pages/Contact'));
const FAQPage = lazy(() => import('./pages/FAQ'));
const ResourcesPage = lazy(() => import('./pages/Resources'));
const MembershipPage = lazy(() => import('./pages/Membership'));
const MembershipDetail = lazy(() => import('./pages/MembershipDetail').then(m => ({ default: m.MembershipDetail })));
const AboutPage = lazy(() => import('./pages/About'));
const TermsPage = lazy(() => import('./pages/Terms'));
const PrivacyPage = lazy(() => import('./pages/Privacy'));
const CookiesPage = lazy(() => import('./pages/Cookies'));
const AccessibilityPage = lazy(() => import('./pages/Accessibility'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCourses = lazy(() => import('./pages/admin/Courses').then(m => ({ default: m.AdminCourses })));
const AdminCourseForm = lazy(() => import('./pages/admin/CourseForm').then(m => ({ default: m.CourseForm })));
const AdminSectors = lazy(() => import('./pages/admin/Sectors').then(m => ({ default: m.AdminSectors })));
const AdminNews = lazy(() => import('./pages/admin/News').then(m => ({ default: m.AdminNews })));
const AdminNewsForm = lazy(() => import('./pages/admin/NewsForm').then(m => ({ default: m.AdminNewsForm })));
const AdminPages = lazy(() => import('./pages/admin/Pages').then(m => ({ default: m.AdminPages })));
const AdminPageForm = lazy(() => import('./pages/admin/PageForm').then(m => ({ default: m.AdminPageForm })));
const AdminMedia = lazy(() => import('./pages/admin/Media').then(m => ({ default: m.AdminMedia })));
const AdminSEO = lazy(() => import('./pages/admin/SEO').then(m => ({ default: m.AdminSEO })));
const AdminContacts = lazy(() => import('./pages/admin/Contacts').then(m => ({ default: m.AdminContacts })));
const AdminRegistrations = lazy(() => import('./pages/admin/Registrations').then(m => ({ default: m.AdminRegistrations })));
const AdminUsers = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.AdminUsers })));
const AdminSettings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.AdminSettings })));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials').then(m => ({ default: m.AdminTestimonials })));
const AdminFAQs = lazy(() => import('./pages/admin/FAQs'));
const AdminResources = lazy(() => import('./pages/admin/ResourcesAdmin'));
const MediaManager = lazy(() => import('./pages/admin/MediaManager'));
const AdminEnrollments = lazy(() => import('./pages/admin/Enrollments'));
const AdminCertificates = lazy(() => import('./pages/admin/Certificates'));
const AdminFinancials = lazy(() => import('./pages/admin/Financials'));
const MembershipLevels = lazy(() => import('./pages/admin/MembershipLevels').then(m => ({ default: m.MembershipLevels })));
const MembershipLevelForm = lazy(() => import('./pages/admin/MembershipLevelForm').then(m => ({ default: m.MembershipLevelForm })));
const Members = lazy(() => import('./pages/admin/Members').then(m => ({ default: m.Members })));
const NewsAds = lazy(() => import('./pages/admin/NewsAds'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <GoogleAnalytics />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:slug" element={<CourseDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/membership/:slug" element={<MembershipDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/accessibility" element={<AccessibilityPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify" element={<VerifyCertificatePage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-payments"
            element={
              <ProtectedRoute>
                <MyPaymentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="financials" element={<AdminFinancials />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/new" element={<AdminCourseForm />} />
            <Route path="courses/:id" element={<AdminCourseForm />} />
            <Route path="sectors" element={<AdminSectors />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/new" element={<AdminNewsForm />} />
            <Route path="news/:id" element={<AdminNewsForm />} />
            <Route path="news-ads" element={<NewsAds />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/new" element={<AdminPageForm />} />
            <Route path="pages/:id" element={<AdminPageForm />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="enrollments" element={<AdminEnrollments />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="faqs" element={<AdminFAQs />} />
            <Route path="resources" element={<AdminResources />} />
            <Route path="media-manager" element={<MediaManager />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="seo" element={<AdminSEO />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="registrations" element={<AdminRegistrations />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="membership-levels" element={<MembershipLevels />} />
            <Route path="membership-levels/new" element={<MembershipLevelForm />} />
            <Route path="membership-levels/:id" element={<MembershipLevelForm />} />
            <Route path="members" element={<Members />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
