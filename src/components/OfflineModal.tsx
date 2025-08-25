import { X, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useEffect, useState } from 'react';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  type?: 'offline' | 'timeout' | 'error';
  title?: string;
  message?: string;
}

export default function OfflineModal({ 
  isOpen, 
  onClose, 
  onRetry, 
  type = 'offline',
  title,
  message 
}: OfflineModalProps) {
  const { isOnline } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto close when back online
  useEffect(() => {
    if (isOnline && type === 'offline') {
      onClose();
    }
  }, [isOnline, type, onClose]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'offline':
        return <WifiOff className="w-12 h-12 text-gray-400" />;
      case 'timeout':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      default:
        return <Wifi className="w-12 h-12 text-gray-400" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'offline':
        return 'No Internet Connection';
      case 'timeout':
        return 'Try again';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Connection Issue';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'offline':
        return 'Please check your internet connection and try again.';
      case 'timeout':
        return 'Request timeout!, Please try again';
      case 'error':
        return 'An unexpected error occurred. Please try again.';
      default:
        return 'Please check your connection and try again.';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm mx-4 w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {getTitle()}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {getMessage()}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetrying ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Retrying...
                </div>
              ) : (
                'Done'
              )}
            </button>

            {type === 'offline' && (
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isOnline ? 'Connected' : 'Disconnected'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
