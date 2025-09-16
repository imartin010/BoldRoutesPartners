import React, { useState, useEffect } from 'react';
import { listDeals, updateDeal, signAttachment } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface Deal {
  id: string;
  developer_name: string;
  project_name: string;
  client_name: string;
  unit_code: string;
  dev_sales_name: string;
  dev_phone: string;
  deal_value: number;
  review_status: string;
  internal_note?: string;
  attachments?: Array<{ path: string }>;
  created_at: string;
  payment_plan?: {
    downpaymentPercentage: number;
    installmentYears: number;
    installmentFrequency: 'monthly' | 'quarterly' | 'yearly';
    notes?: string;
  };
  total_paid?: number;
  payment_status?: 'pending' | 'in_progress' | 'ready_to_claim' | 'claimed';
  ready_to_claim_at?: string;
  claimed_at?: string;
}

interface Filters {
  status: string;
  developer: string;
  minValue: string;
  maxValue: string;
  dateFrom: string;
  dateTo: string;
}

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    developer: '',
    minValue: '',
    maxValue: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Drawer state
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingNote, setEditingNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Confirm dialog state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Selected rows for bulk actions
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadDeals();
  }, [pagination.page, searchQuery, filters]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        q: searchQuery || undefined,
        status: filters.status || undefined,
        developer: filters.developer || undefined,
        min: filters.minValue ? Number(filters.minValue) : undefined,
        max: filters.maxValue ? Number(filters.maxValue) : undefined,
        from: filters.dateFrom || undefined,
        to: filters.dateTo || undefined
      };
      
      const result = await listDeals(params);
      setDeals(result.rows);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setEditingNote(deal.internal_note || '');
    setDrawerOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedDeal) return;
    
    const confirmTitle = newStatus === 'verified' ? 'Verify Deal' : 'Flag Deal';
    const confirmMessage = `Are you sure you want to ${newStatus === 'verified' ? 'verify' : 'flag'} this deal?`;
    
    setConfirmAction({
      isOpen: true,
      title: confirmTitle,
      message: confirmMessage,
      action: async () => {
        try {
          setUpdatingStatus(true);
          await updateDeal(selectedDeal.id, { review_status: newStatus });
          
          // Update local state
          setDeals(prev => prev.map(deal => 
            deal.id === selectedDeal.id 
              ? { ...deal, review_status: newStatus }
              : deal
          ));
          setSelectedDeal(prev => prev ? { ...prev, review_status: newStatus } : null);
        } catch (error) {
          console.error('Failed to update status:', error);
          alert('Failed to update deal status');
        } finally {
          setUpdatingStatus(false);
        }
      }
    });
  };

  const handleNotesUpdate = async () => {
    if (!selectedDeal) return;
    
    try {
      setUpdatingStatus(true);
      await updateDeal(selectedDeal.id, { internal_note: editingNote });
      
      // Update local state
      setDeals(prev => prev.map(deal => 
        deal.id === selectedDeal.id 
          ? { ...deal, internal_note: editingNote }
          : deal
      ));
      setSelectedDeal(prev => prev ? { ...prev, internal_note: editingNote } : null);
    } catch (error) {
      console.error('Failed to update notes:', error);
      alert('Failed to update notes');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenAttachment = async (path: string) => {
    try {
      const signedUrl = await signAttachment(path);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Failed to open attachment:', error);
      alert('Failed to open file');
    }
  };

  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleBulkVerify = async () => {
    if (selectedRows.size === 0) return;
    
    setConfirmAction({
      isOpen: true,
      title: 'Bulk Verify Deals',
      message: `Are you sure you want to verify ${selectedRows.size} selected deals?`,
      action: async () => {
        try {
          setUpdatingStatus(true);
          
          // Update all selected deals
          await Promise.all(
            Array.from(selectedRows).map(id => 
              updateDeal(id, { review_status: 'verified' })
            )
          );
          
          // Update local state
          setDeals(prev => prev.map(deal => 
            selectedRows.has(deal.id) 
              ? { ...deal, review_status: 'verified' }
              : deal
          ));
          
          setSelectedRows(new Set());
        } catch (error) {
          console.error('Failed to bulk verify:', error);
          alert('Failed to verify some deals');
        } finally {
          setUpdatingStatus(false);
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200';
      case 'flagged': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'developer_name',
      label: 'Developer',
      sortable: true,
    },
    {
      key: 'project_name',
      label: 'Project',
      sortable: true,
    },
    {
      key: 'client_name',
      label: 'Client',
      sortable: true,
    },
    {
      key: 'deal_value',
      label: 'Value',
      render: (deal: Deal) => formatCurrency(deal.deal_value),
    },
    {
      key: 'review_status',
      label: 'Review Status',
      render: (deal: Deal) => (
        <span className={`admin-tag ${getStatusColor(deal.review_status)}`}>
          {deal.review_status}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      render: (deal: Deal) => {
        if (!deal.payment_status) return '-';
        const getPaymentStatusColor = (status: string) => {
          switch (status) {
            case 'claimed': return 'bg-green-100 text-green-800';
            case 'ready_to_claim': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };
        return (
          <span className={`admin-tag ${getPaymentStatusColor(deal.payment_status)}`}>
            {deal.payment_status === 'ready_to_claim' ? 'Ready to Claim' :
             deal.payment_status === 'in_progress' ? 'In Progress' :
             deal.payment_status === 'claimed' ? 'Claimed' : 'Pending'}
          </span>
        );
      },
    },
    {
      key: 'attachments',
      label: 'Files',
      render: (deal: Deal) => (
        <span className="text-sm text-neutral-600">
          {deal.attachments?.length || 0} files
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (deal: Deal) => new Date(deal.created_at).toLocaleDateString(),
    },
  ];

  const filtersComponent = (
    <div className="flex flex-wrap gap-2">
      <select
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="admin-input w-auto"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="verified">Verified</option>
        <option value="flagged">Flagged</option>
      </select>
      
      <input
        type="text"
        value={filters.developer}
        onChange={(e) => handleFilterChange('developer', e.target.value)}
        placeholder="Developer name"
        className="admin-input w-40"
      />
      
      <input
        type="number"
        value={filters.minValue}
        onChange={(e) => handleFilterChange('minValue', e.target.value)}
        placeholder="Min value"
        className="admin-input w-32"
      />
      
      <input
        type="number"
        value={filters.maxValue}
        onChange={(e) => handleFilterChange('maxValue', e.target.value)}
        placeholder="Max value"
        className="admin-input w-32"
      />
      
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        className="admin-input w-auto"
      />
      
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        className="admin-input w-auto"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Deals</h1>
        <div className="flex items-center gap-4">
          {selectedRows.size > 0 && (
            <button
              onClick={handleBulkVerify}
              disabled={updatingStatus}
              className="admin-btn bg-green-600 hover:bg-green-700 border-green-600"
            >
              Verify Selected ({selectedRows.size})
            </button>
          )}
          <div className="text-sm text-neutral-600">
            {pagination.total} total deals
          </div>
        </div>
      </div>

      <DataTable
        data={deals}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        filters={filtersComponent}
        csvFilename="deals.csv"
        loading={loading}
        onRowClick={handleRowClick}
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        getRowId={(deal) => deal.id}
        emptyMessage="No deals found"
      />

      {/* Deal Details Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Deal Details"
        size="lg"
      >
        {selectedDeal && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Developer</label>
                <p className="text-sm font-medium">{selectedDeal.developer_name}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Project</label>
                <p className="text-sm">{selectedDeal.project_name}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Client</label>
                <p className="text-sm">{selectedDeal.client_name}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Unit Code</label>
                <p className="text-sm">{selectedDeal.unit_code}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Sales Rep</label>
                <p className="text-sm">{selectedDeal.dev_sales_name}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Phone</label>
                <p className="text-sm">{selectedDeal.dev_phone}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Deal Value</label>
                <p className="text-sm font-semibold">{formatCurrency(selectedDeal.deal_value)}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Review Status</label>
                <span className={`admin-tag ${getStatusColor(selectedDeal.review_status)}`}>
                  {selectedDeal.review_status}
                </span>
              </div>
              {selectedDeal.payment_status && (
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Payment Status</label>
                  <span className={`admin-tag ${
                    selectedDeal.payment_status === 'claimed' ? 'bg-green-100 text-green-800' :
                    selectedDeal.payment_status === 'ready_to_claim' ? 'bg-yellow-100 text-yellow-800' :
                    selectedDeal.payment_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDeal.payment_status === 'ready_to_claim' ? 'Ready to Claim' :
                     selectedDeal.payment_status === 'in_progress' ? 'In Progress' :
                     selectedDeal.payment_status === 'claimed' ? 'Claimed' : 'Pending'}
                  </span>
                </div>
              )}
              {selectedDeal.total_paid !== undefined && (
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Total Paid</label>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(selectedDeal.total_paid)}</p>
                </div>
              )}
            </div>

            {/* Payment Plan Details */}
            {selectedDeal.payment_plan && (
              <div className="space-y-3">
                <h3 className="font-semibold text-neutral-900">Payment Plan</h3>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider">Downpayment</label>
                      <p className="font-medium">{selectedDeal.payment_plan.downpaymentPercentage}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider">Duration</label>
                      <p className="font-medium">{selectedDeal.payment_plan.installmentYears} years</p>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider">Frequency</label>
                      <p className="font-medium capitalize">{selectedDeal.payment_plan.installmentFrequency}</p>
                    </div>
                  </div>
                  {selectedDeal.payment_plan.notes && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <label className="text-xs text-neutral-500 uppercase tracking-wider">Notes</label>
                      <p className="text-sm">{selectedDeal.payment_plan.notes}</p>
                    </div>
                  )}
                  {selectedDeal.deal_value && (
                    <div className="mt-3 pt-3 border-t border-neutral-200">
                      <div className="flex justify-between text-sm">
                        <span>Claim Threshold (10%):</span>
                        <span className="font-semibold">{formatCurrency(selectedDeal.deal_value * 0.10)}</span>
                      </div>
                      {selectedDeal.total_paid !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-neutral-500 mb-1">
                            <span>Progress</span>
                            <span>{((selectedDeal.total_paid / selectedDeal.deal_value) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedDeal.total_paid >= selectedDeal.deal_value * 0.10 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min((selectedDeal.total_paid / selectedDeal.deal_value) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Attachments</h3>
              {selectedDeal.attachments && selectedDeal.attachments.length > 0 ? (
                <div className="space-y-2">
                  {selectedDeal.attachments.map((attachment, index) => (
                    <button
                      key={index}
                      onClick={() => handleOpenAttachment(attachment.path)}
                      className="admin-btn-ghost text-left w-full"
                    >
                      📄 File {index + 1}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No attachments</p>
              )}
            </div>

            {/* Internal Notes */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Internal Notes</h3>
              <textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Add internal notes about this deal..."
                className="admin-input h-24 resize-none"
              />
              <button
                onClick={handleNotesUpdate}
                disabled={updatingStatus}
                className="admin-btn-ghost"
              >
                {updatingStatus ? 'Saving...' : 'Save Notes'}
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Actions</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusUpdate('verified')}
                  disabled={updatingStatus || selectedDeal.review_status === 'verified'}
                  className="admin-btn bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleStatusUpdate('flagged')}
                  disabled={updatingStatus || selectedDeal.review_status === 'flagged'}
                  className="admin-btn bg-red-600 hover:bg-red-700 border-red-600"
                >
                  Flag
                </button>
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="text-xs text-neutral-500">
                Created: {new Date(selectedDeal.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation Dialog */}
      <Confirm
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.action}
        title={confirmAction.title}
        message={confirmAction.message}
        type="warning"
      />
    </div>
  );
}
