import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { getSession, getMyRole, signInWithEmail } from '@/api/admin';
import NotificationBell from '../../components/admin/NotificationBell';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/admin/applications', label: 'Applications', icon: '📝' },
  { path: '/admin/deals', label: 'Deals', icon: '🤝' },
  { path: '/admin/developers', label: 'Developers', icon: '🏢' },
  { path: '/admin/projects', label: 'Projects', icon: '🏗️' },
  { path: '/admin/commissions', label: 'Commission Rates', icon: '💰' },
  { path: '/admin/launches', label: 'Launches', icon: '🚀' },
  { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInMessage, setSignInMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: session } = await getSession();
      const authenticated = !!session.session;
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const role = await getMyRole();
        const adminStatus = role === 'admin';
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          navigate('/');
        } else if (location.pathname === '/admin') {
          navigate('/admin/dashboard');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSigningIn(true);
    setSignInMessage('');
    
    try {
      await signInWithEmail(email);
      setSignInMessage('Check your email for the sign-in link!');
      setEmail('');
    } catch (error) {
      setSignInMessage('Failed to send sign-in email. Please try again.');
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  // Show loading state while checking auth
  if (isAuthenticated === null || isAdmin === null) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full"></div>
      </div>
    );
  }

  // Show sign-in form if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="admin-card max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Admin Access</h1>
            <p className="text-neutral-600">
              {!isAuthenticated 
                ? "Sign in with your admin email to continue"
                : "You don't have admin privileges"
              }
            </p>
          </div>
          
          {!isAuthenticated ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="admin-input"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSigningIn}
                className="admin-btn w-full"
              >
                {isSigningIn ? 'Sending...' : 'Send Sign-In Link'}
              </button>
              
              {signInMessage && (
                <p className={`text-sm text-center ${
                  signInMessage.includes('Check your email') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {signInMessage}
                </p>
              )}
            </form>
          ) : (
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Your account doesn't have admin privileges. Please contact your administrator.
              </p>
              <button
                onClick={() => navigate('/')}
                className="admin-btn-ghost"
              >
                Go to Main Site
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Admin Panel</h1>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded focus-ring"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 
          w-64 bg-white border-r border-neutral-200 
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-neutral-900">
                  Bold Routes Admin
                </h1>
                <div className="lg:block hidden">
                  <NotificationBell />
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-neutral-200">
              <button
                onClick={() => navigate('/')}
                className="w-full text-left px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                ← Back to Main Site
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
