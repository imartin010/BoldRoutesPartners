import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

/**
 * User menu component that shows user info and provides logout functionality
 */
export function UserMenu() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate to auth page after logout
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload to clear any cached state
      window.location.href = '/signin';
    } finally {
      setLoggingOut(false);
      setIsOpen(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const userEmail = user.email || 'User';
  const userInitials = userEmail
    .split('@')[0]
    .split('.')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
          {userInitials}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900 truncate max-w-32">
            {userEmail.split('@')[0]}
          </div>
          <div className="text-xs text-gray-500">
            Partner
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-medium">
                  {userInitials}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{userEmail}</div>
                  <div className="text-sm text-gray-500">Partner Account</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/profile');
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 mr-3" />
                My Profile
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 mr-3" />
                {loggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-100 mt-2">
              <div className="text-xs text-gray-500">
                Bold Routes Partners Platform
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

