import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Authentication guard component that protects routes based on auth status
 * 
 * @param children - Components to render if auth check passes
 * @param requireAuth - Whether authentication is required (default: true)
 * @param redirectTo - Where to redirect if auth check fails (default: /signin)
 */
export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/signin' 
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Save the attempted location for redirect after login
      const returnTo = location.pathname + location.search;
      navigate(redirectTo, { 
        replace: true,
        state: { returnTo } 
      });
      return;
    }

    // If auth is NOT required but user IS authenticated (e.g., login page when already logged in)
    if (!requireAuth && isAuthenticated) {
      // Check if there's a return URL from previous redirect
      const returnTo = (location.state as any)?.returnTo || '/';
      navigate(returnTo, { replace: true });
      return;
    }
  }, [isAuthenticated, loading, requireAuth, navigate, redirectTo, location]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // If auth is NOT required and user IS authenticated, don't render children
  // (redirect will happen in useEffect)
  if (!requireAuth && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Auth check passed, render children
  return <>{children}</>;
}

/**
 * Component for protecting authenticated routes
 * Redirects to sign-in if not authenticated
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/signin">
      {children}
    </AuthGuard>
  );
}

/**
 * Component for protecting guest-only routes (sign-in, sign-up)
 * Redirects to dashboard if already authenticated
 */
export function RequireGuest({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      {children}
    </AuthGuard>
  );
}
