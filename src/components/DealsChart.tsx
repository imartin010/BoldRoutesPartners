import React from 'react';

interface DealsChartProps {
  data: { month: string; deals: number }[];
  className?: string;
}

export default function DealsChart({ data, className = '' }: DealsChartProps) {
  const maxDeals = Math.max(...data.map(d => d.deals));
  
  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Deals</h3>
        <span className="text-sm text-gray-500">Top month: July with 99 deals</span>
      </div>
      
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((item, index) => {
          const height = maxDeals > 0 ? (item.deals / maxDeals) * 100 : 0;
          const isMaxMonth = item.deals === maxDeals;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex justify-center items-end h-24 mb-2">
                <div
                  className={`w-full rounded-t transition-all duration-300 ${
                    isMaxMonth ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>0</span>
        <span>20</span>
        <span>40</span>
        <span>60</span>
        <span>80</span>
        <span>100</span>
      </div>
    </div>
  );
}
