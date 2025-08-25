import React from 'react';
import { X, Megaphone, TrendingUp, Handshake, Rocket } from 'lucide-react';
import { useNotificationPopup } from '../contexts/NotificationPopupContext';
import { Link } from 'react-router-dom';

export default function NotificationPopup() {
  const { currentPopup, dismissCurrentPopup } = useNotificationPopup();

  if (!currentPopup) return null;

  const handleAction = () => {
    if (currentPopup.onAction) {
      currentPopup.onAction();
    }
    dismissCurrentPopup();
  };

  const handleDismiss = () => {
    if (currentPopup.dismissible) {
      dismissCurrentPopup();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 pointer-events-none">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={handleDismiss}
      />
      
      {/* Popup card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl pointer-events-auto transform animate-slide-down">
        {/* Header with category */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              {currentPopup.type === 'welcome' && 'Welcome - Notification'}
              {currentPopup.type === 'commission' && 'Commission - Notification'}
              {currentPopup.type === 'deal' && 'Deal Approval - Notification'}
              {currentPopup.type === 'general' && 'New Updates - Notification'}
            </span>
            {currentPopup.dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="px-4 pb-4">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${currentPopup.iconBgColor}`}>
              {currentPopup.icon === 'HandWave' && <span className="text-2xl">👋</span>}
              {currentPopup.icon === 'Megaphone' && <Megaphone className="w-6 h-6 text-gray-700" />}
              {currentPopup.icon === 'TrendingUp' && <TrendingUp className="w-6 h-6 text-gray-700" />}
              {currentPopup.icon === 'Handshake' && <Handshake className="w-6 h-6 text-gray-700" />}
              {currentPopup.icon === 'Rocket' && <Rocket className="w-6 h-6 text-gray-700" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {currentPopup.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {currentPopup.message}
              </p>

              {/* Action button */}
              {currentPopup.actionText && (
                <div>
                  {currentPopup.actionUrl ? (
                    <Link
                      to={currentPopup.actionUrl}
                      onClick={handleAction}
                      className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
                    >
                      {currentPopup.actionText}
                    </Link>
                  ) : (
                    <button
                      onClick={handleAction}
                      className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
                    >
                      {currentPopup.actionText}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
