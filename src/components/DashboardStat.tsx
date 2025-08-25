import React from 'react';
import { ChevronRight } from 'lucide-react';

interface DashboardStatProps {
  label: string;
  value: string | number;
  onClick?: () => void;
  className?: string;
}

export default function DashboardStat({ 
  label, 
  value, 
  onClick, 
  className = '' 
}: DashboardStatProps) {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`
        flex items-center justify-between p-4 bg-white rounded-lg
        ${onClick ? 'hover:bg-gray-50 transition-colors cursor-pointer' : ''}
        ${className}
      `}
    >
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
      {onClick && (
        <ChevronRight className="w-5 h-5 text-gray-400" />
      )}
    </Component>
  );
}
