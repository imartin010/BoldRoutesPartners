import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Toast as ToastType, useToast } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
}

const typeConfig = {
  success: {
    bgColor: 'bg-gray-700',
    textColor: 'text-white',
    iconColor: 'text-green-400',
    defaultIcon: <CheckCircle className="w-5 h-5" />,
  },
  error: {
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    iconColor: 'text-white',
    defaultIcon: <AlertTriangle className="w-5 h-5" />,
  },
  warning: {
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    iconColor: 'text-white',
    defaultIcon: <AlertCircle className="w-5 h-5" />,
  },
  info: {
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    iconColor: 'text-white',
    defaultIcon: <Info className="w-5 h-5" />,
  },
};

export default function Toast({ toast }: ToastProps) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = typeConfig[toast.type];

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (toast.dismissible) {
      setIsLeaving(true);
      setTimeout(() => {
        removeToast(toast.id);
      }, 300); // Animation duration
    }
  };

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      handleDismiss();
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
        w-full max-w-sm ${config.bgColor} ${config.textColor} rounded-lg shadow-lg overflow-hidden
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.iconColor} mr-3`}>
            {toast.icon || config.defaultIcon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">
                {toast.message}
              </p>
            )}
          </div>

          {/* Action Button */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="ml-3 text-sm font-medium underline hover:no-underline transition-all"
            >
              {toast.action.label}
            </button>
          )}

          {/* Close Button */}
          {toast.dismissible && (
            <button
              onClick={handleDismiss}
              className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}