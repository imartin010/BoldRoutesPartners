import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useSidebar } from '../contexts/SidebarContext';
import { useNotificationStore } from '../store/notifications';
import { Bell } from 'lucide-react';

export default function Nav() {
  const { user, login, logout } = useAuthStore();
  const { isExpanded } = useSidebar();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();

  const handleAuthToggle = () => {
    if (user) {
      logout();
    } else {
      login({ name: 'Demo User' });
    }
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <nav 
        className="bg-brand-card border-b border-brand-border fixed top-0 left-0 right-0 z-40 shadow-elegant"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'lg:pl-64' : 'lg:pl-16'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fg rounded-lg"
                aria-label="Bold Routes Partners home"
              >
                <img 
                  src="/images/logo.png" 
                  alt="Bold Routes Partners logo" 
                  className="h-10 sm:h-12 w-auto"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <span className="text-lg sm:text-xl font-bold text-brand-fg hidden">
                  Bold Routes Partners
                </span>
              </Link>

              {/* Right side - Notifications & Auth */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-brand-fg opacity-60 hover:opacity-100 hover:bg-brand-overlay rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fg"
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <Bell className="w-6 h-6" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                      aria-label={`${unreadCount} unread notifications`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Auth Button Mobile Only */}
                <div className="lg:hidden">
                  <button
                    onClick={handleAuthToggle}
                    className={`btn btn-sm ${
                      user ? 'btn-secondary' : 'btn-primary'
                    }`}
                    aria-label={user ? 'Sign out' : 'Sign in'}
                  >
                    {user ? 'Logout' : 'Login'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
