import React, { useEffect, useRef } from 'react';

interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function Confirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 border-red-600',
    warning: 'bg-orange-600 hover:bg-orange-700 border-orange-600',
    info: 'bg-neutral-900 hover:bg-neutral-800 border-neutral-900'
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {title}
            </h3>
            <p className="text-neutral-600 mb-6">
              {message}
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="admin-btn-ghost"
              >
                {cancelText}
              </button>
              <button
                ref={confirmRef}
                onClick={handleConfirm}
                className={`rounded-xl border px-4 py-2 text-white text-sm transition active:translate-y-px ${typeStyles[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
