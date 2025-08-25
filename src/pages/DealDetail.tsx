import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Edit, Trash2, RefreshCw, Download, Eye, AlertTriangle, Building, Home, Ruler, Palette } from 'lucide-react';
import { useDeals } from '../contexts/DealsContext';
import { useToastTriggers } from '../hooks/useToastTriggers';
import CommissionTracking from '../components/deals/CommissionTracking';
import ApprovalLog from '../components/deals/ApprovalLog';
import ChangeDealStage from '../components/deals/ChangeDealStage';
import { formatCurrencyEGP } from '../utils/format';

type TabType = 'Main Info' | 'Attachments' | 'Commission' | 'Approval Log';

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deals } = useDeals();
  const { showSuccess, showError, showDealDeleted } = useToastTriggers();
  
  const [activeTab, setActiveTab] = useState<TabType>('Main Info');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangeStage, setShowChangeStage] = useState(false);

  // Find the deal by ID
  const deal = deals.find(d => d.id === id);
  
  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal not found</h2>
          <Link to="/deals" className="text-blue-600 hover:text-blue-800">
            Back to Deals
          </Link>
        </div>
      </div>
    );
  }

  const tabs: TabType[] = ['Main Info', 'Attachments', 'Commission', 'Approval Log'];

  // Mock commission data
  const commission = {
    totalCommission: 2400000,
    percentage: 16,
    cheques: [
      { id: '1', amount: 500000, status: 'Collected', dueDate: '2024-01-15', collectedDate: '2024-01-15' },
      { id: '2', amount: 250000, status: 'Ready', dueDate: '2024-03-15' },
      { id: '3', amount: 250000, status: 'Pending', dueDate: '2024-06-15' },
    ]
  };

  // Mock approval log
  const approvalLog = [
    { stage: 'Collection', status: 'Approved', date: '2024-03-15', note: 'Document verified and approved' },
    { stage: 'Sales Operation', status: 'Approved', date: '2024-03-10', note: 'Initial approval completed' },
    { stage: 'Sales Operation', status: 'Rejected', date: '2024-03-08', note: 'Missing required documentation' },
  ];

  const handleEditDeal = () => {
    setShowActionsMenu(false);
    navigate(`/deals/${id}/edit`);
  };

  const handleChangeDealStage = () => {
    setShowActionsMenu(false);
    setShowChangeStage(true);
  };

  const handleStageChanged = (newStage: string) => {
    // Update deal state here if needed
    console.log('Deal stage changed to:', newStage);
  };

  const handleDeleteDeal = () => {
    setShowDeleteConfirm(false);
    setShowActionsMenu(false);
    showDealDeleted();
    setTimeout(() => navigate('/deals'), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Contract': return 'bg-green-100 text-green-800';
      case 'CIL': return 'bg-blue-100 text-blue-800';
      case 'Reservation': return 'bg-purple-100 text-purple-800';
      case 'EOI': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMainInfo = () => (
    <div className="space-y-6">
      {/* Total Commission Card */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Commission</p>
          <p className="text-3xl font-bold text-gray-900 mb-4">
            {formatCurrencyEGP(commission.totalCommission)}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium">
              Collection Approval
            </button>
            <button className="bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium">
              Collect
            </button>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">Developer</span>
            </div>
            <span className="font-medium text-gray-900">{deal.developer}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">Project</span>
            </div>
            <span className="font-medium text-gray-900">{deal.project}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">#</span>
              </div>
              <span className="text-gray-700">Unit Number</span>
            </div>
            <span className="font-medium text-gray-900">{deal.unitNumber}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Ruler className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">Unit Area</span>
            </div>
            <span className="font-medium text-gray-900">{deal.unitArea} m²</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">Unit Type</span>
            </div>
            <span className="font-medium text-gray-900">{deal.unitType}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700">Finishing Type</span>
            </div>
            <span className="font-medium text-gray-900">{deal.finishingType}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-sm">📅</span>
              </div>
              <span className="text-gray-700">Delivery Date</span>
            </div>
            <span className="font-medium text-gray-900">
              {new Date(deal.deliveryDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Deal Information */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Deal Type</span>
            <span className="font-medium text-gray-900">{deal.status}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Contract Unit Price</span>
            <span className="font-medium text-gray-900">{formatCurrencyEGP(deal.contractPrice)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">Down Payment</span>
            <span className="font-medium text-gray-900">
              {((deal.downPayment / deal.contractPrice) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttachments = () => (
    <div className="space-y-4">
      {deal.attachments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No attachments added yet</p>
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add attachment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mock attachments */}
          {[
            { name: 'Contract.pdf', type: 'PDF', size: '2.5 MB' },
            { name: 'Personal ID.jpg', type: 'JPG', size: '1.2 MB' },
            { name: 'Passport.pdf', type: 'PDF', size: '1.8 MB' },
          ].map((file, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-xs font-medium">{file.type}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    View Comment
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/deals" className="p-2">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Deal #{deal.id}</h1>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
              
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={handleEditDeal}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Deal</span>
                  </button>
                  <button
                    onClick={handleChangeDealStage}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change Deal Stage</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Deal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Info Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-lg">
                {deal.clientName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{deal.clientName}</h2>
              <p className="text-sm text-gray-500">#{deal.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                {deal.status}
              </span>
              <span className="text-sm text-gray-500">Primary</span>
              <span className="text-sm font-medium text-gray-900">{commission.percentage}% Commission</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 px-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'Main Info' && renderMainInfo()}
          {activeTab === 'Attachments' && renderAttachments()}
          {activeTab === 'Commission' && (
            <CommissionTracking 
              dealId={deal.id}
              totalCommission={commission.totalCommission}
              percentage={commission.percentage}
            />
          )}
          {activeTab === 'Approval Log' && (
            <ApprovalLog dealId={deal.id} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Deal?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete deal #{deal.id}?</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDeal}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Stage Modal */}
      {showChangeStage && (
        <ChangeDealStage
          dealId={deal.id}
          currentStage={deal.status}
          onClose={() => setShowChangeStage(false)}
          onStageChanged={handleStageChanged}
        />
      )}
    </div>
  );
}
