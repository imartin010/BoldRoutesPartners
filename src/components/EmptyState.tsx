import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  subtitle: string;
  actionText: string;
  onAction: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionText,
  onAction,
  className = ''
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 ${className}`}>
      {icon || defaultIcon}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        {subtitle}
      </p>
      
      <button
        onClick={onAction}
        className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>{actionText}</span>
      </button>
    </div>
  );
}
