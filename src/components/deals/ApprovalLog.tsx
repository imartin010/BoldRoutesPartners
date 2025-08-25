import React from 'react';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

interface ApprovalLogProps {
  dealId: string;
}

export default function ApprovalLog({ dealId }: ApprovalLogProps) {
  // Mock approval log data
  const approvalEvents = [
    {
      id: '1',
      stage: 'Collection',
      status: 'Approved',
      date: '2024-03-15',
      time: '10:30 AM',
      actor: 'Sales Operation',
      note: 'Document verified and approved for collection',
      description: 'All required documents have been verified and the deal is approved for commission collection.'
    },
    {
      id: '2',
      stage: 'Sales Operation', 
      status: 'Approved',
      date: '2024-03-10',
      time: '2:15 PM',
      actor: 'Sales Manager',
      note: 'Initial approval completed',
      description: 'Deal has passed initial verification and approval process.'
    },
    {
      id: '3',
      stage: 'Sales Operation',
      status: 'Rejected',
      date: '2024-03-08',
      time: '11:45 AM',
      actor: 'Documentation Team',
      note: 'Missing required documentation',
      description: 'Deal rejected due to missing client identification documents. Please resubmit with complete documentation.'
    },
    {
      id: '4',
      stage: 'Initial Submission',
      status: 'Pending',
      date: '2024-03-05',
      time: '4:20 PM',
      actor: 'System',
      note: 'Deal submitted for review',
      description: 'Deal has been submitted and is waiting for initial review by the sales team.'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <X className="w-5 h-5 text-red-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-600';
      case 'Rejected':
        return 'bg-red-600';
      case 'Pending':
        return 'bg-orange-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        
        <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex-shrink-0">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-green-900">Collection Approved</h4>
            <p className="text-sm text-green-700">Deal is ready for commission collection</p>
          </div>
        </div>
      </div>

      {/* Approval Timeline */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Approval Timeline</h3>
        
        <div className="space-y-6">
          {approvalEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index < approvalEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
              )}
              
              <div className="flex items-start space-x-4">
                {/* Timeline dot */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getTimelineColor(event.status)}`}>
                  {getStatusIcon(event.status)}
                </div>
                
                {/* Event content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{event.stage}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  
                  {event.note && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 font-medium mb-1">Note:</p>
                      <p className="text-sm text-gray-600">{event.note}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{event.actor}</span>
                    <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Actions</h3>
        
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Request Status Update
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Contact Support
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Download Approval Report
          </button>
        </div>
      </div>
    </div>
  );
}
