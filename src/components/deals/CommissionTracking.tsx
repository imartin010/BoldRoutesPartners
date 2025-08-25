import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { formatCurrencyEGP } from '../../utils/format';

interface CommissionTrackingProps {
  dealId: string;
  totalCommission: number;
  percentage: number;
}

export default function CommissionTracking({ dealId, totalCommission, percentage }: CommissionTrackingProps) {
  // Mock commission data
  const commission = {
    collected: 500000,
    ready: 250000,
    pending: 1650000,
    cheques: [
      { 
        id: '1', 
        number: 'Cheque #2',
        amount: 25000000, 
        status: 'Ready', 
        stage: 'Commission Ready',
        dueDate: '2024-04-15',
        description: 'Commission cheque for deal completion'
      },
      { 
        id: '2', 
        number: 'Cheque #3',
        amount: 25000000, 
        status: 'Pending', 
        stage: 'Cheque Collected',
        dueDate: '2024-06-15',
        description: 'Second installment commission'
      },
      { 
        id: '3', 
        number: 'Cheque Received',
        amount: 25000000, 
        status: 'Collected', 
        stage: 'Cheque Received',
        dueDate: '2024-01-15',
        collectedDate: '2024-01-15',
        description: 'Initial commission payment'
      },
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Collected':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'Ready':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Pending':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Collected':
        return 'text-green-600';
      case 'Ready':
        return 'text-blue-600';
      case 'Pending':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Commission Summary */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Summary</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrencyEGP(commission.collected)}
            </div>
            <div className="text-sm text-gray-500">Collected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatCurrencyEGP(commission.ready)}
            </div>
            <div className="text-sm text-gray-500">Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatCurrencyEGP(commission.pending)}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(commission.collected / totalCommission) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-500 text-center">
          {((commission.collected / totalCommission) * 100).toFixed(1)}% of total commission collected
        </div>
      </div>

      {/* Commission Timeline */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Timeline</h3>
        
        <div className="space-y-4">
          {commission.cheques.map((cheque, index) => (
            <div key={cheque.id} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(cheque.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{cheque.number}</h4>
                  <span className={`text-sm font-medium ${getStatusColor(cheque.status)}`}>
                    {cheque.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{cheque.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">
                    {formatCurrencyEGP(cheque.amount)}
                  </span>
                  <span className="text-gray-500">
                    {cheque.status === 'Collected' && cheque.collectedDate
                      ? `Collected: ${new Date(cheque.collectedDate).toLocaleDateString()}`
                      : `Due: ${new Date(cheque.dueDate).toLocaleDateString()}`
                    }
                  </span>
                </div>
                
                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    {cheque.stage}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
        
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Request Commission Collection
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Download Commission Report
          </button>
        </div>
      </div>
    </div>
  );
}
