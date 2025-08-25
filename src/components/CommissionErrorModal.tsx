import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface CommissionErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  title?: string;
  message?: string;
}

export default function CommissionErrorModal({ 
  isOpen, 
  onClose, 
  onRetry,
  title = "Try again",
  message = "Request timeout!, Please try again"
}: CommissionErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center pt-2">
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-8">
            {message}
          </p>

          {/* Action Button */}
          <button
            onClick={onRetry}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
