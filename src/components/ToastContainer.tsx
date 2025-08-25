import React from 'react';
import { useToast } from '../contexts/ToastContext';
import Toast from './Toast';

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
};

export default function ToastContainer({ position = 'bottom-right' }: ToastContainerProps) {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className={`
        fixed z-[200] pointer-events-none
        ${positionClasses[position]}
      `}
    >
      <div className="space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  );
}
