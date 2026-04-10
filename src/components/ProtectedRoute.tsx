import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRoles?: UserRole[];
}

const STAFF_ROLES: UserRole[] = ['super_admin', 'admin', 'content_editor', 'instructor', 'support'];

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requiredRoles,
}: ProtectedRouteProps) => {
  const { user, loading, profile, isSuperAdmin, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.includes(profile?.role as UserRole);
    if (!hasRole) return <Navigate to="/" replace />;
  } else if (requireAdmin) {
    if (!isStaff) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
