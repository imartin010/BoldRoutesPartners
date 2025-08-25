import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { 
  ChevronRight, 
  Building2, 
  Calculator, 
  Briefcase, 
  Settings, 
  Globe, 
  LogOut,
  X
} from 'lucide-react';
import { useToastTriggers } from '../hooks/useToastTriggers';

export default function More() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { showSuccess } = useToastTriggers();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully', 'See you soon!');
    setShowLogoutModal(false);
    navigate('/');
  };

  const menuItems = [
    {
      icon: Building2,
      label: 'My Company',
      path: '/my-company',
      hasChevron: true
    },
    {
      icon: Calculator,
      label: 'Commission',
      path: '/my-commissions',
      hasChevron: true
    },
    {
      icon: Briefcase,
      label: 'Deals',
      path: '/deals',
      hasChevron: true
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      hasChevron: true
    },
    {
      icon: Globe,
      label: 'Language',
      path: '/language-selection',
      hasChevron: true,
      rightText: currentLanguage
    }
  ];

  const renderLogoutModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          {/* Logout Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Log out?
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            Are you sure you want to Log Out?
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">More</h1>
        </div>

        {/* User Profile Section */}
        {user && (
          <Link to="/profile" className="block mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-blue-600">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'AS'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {user.name || 'Ahmed Sobhi'}
                  </h2>
                  <p className="text-gray-500">
                    {user.phone || '01154282183'}
                  </p>
                </div>
                
                {/* Chevron */}
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </Link>
        )}

        {/* Menu Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <Link
                key={index}
                to={item.path}
                className="block bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  {/* Label */}
                  <div className="flex-1">
                    <span className="text-gray-900 font-medium">{item.label}</span>
                  </div>
                  
                  {/* Right Content */}
                  <div className="flex items-center space-x-2">
                    {item.rightText && (
                      <span className="text-gray-500 text-sm">{item.rightText}</span>
                    )}
                    {item.hasChevron && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        {user && (
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              
              {/* Label */}
              <div className="flex-1 text-left">
                <span className="text-red-600 font-medium">Log out</span>
              </div>
            </div>
          </button>
        )}

        {/* Login/Register for non-authenticated users */}
        {!user && (
          <div className="space-y-3">
            <Link
              to="/signin"
              className="block w-full bg-gray-900 text-white text-center py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="block w-full bg-gray-100 text-gray-900 text-center py-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && renderLogoutModal()}
    </div>
  );
}
