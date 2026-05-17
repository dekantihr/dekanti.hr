import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/cartStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'kupac';
  redirectTo?: string;
}

/**
 * ProtectedRoute - Protects routes from unauthorized access
 * 
 * @param children - Components to render if authorized
 * @param requiredRole - Optional role requirement ('admin' or 'kupac')
 * @param redirectTo - Where to redirect if unauthorized (default: '/prijava')
 * 
 * @example
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRole="admin">
 *     <AdminPanel />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/prijava' 
}: ProtectedRouteProps) {
  const { user } = useAuth();

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: window.location.pathname }} />;
  }

  // Logged in but insufficient role - redirect to home
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Authorized - render children
  return <>{children}</>;
}
