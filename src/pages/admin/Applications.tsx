import React, { useState, useEffect } from 'react';
import { listApplications, updateApplication } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface Application {
  id: string;
  full_name: string;
  phone: string;
  company_name: string;
  status: string;
  has_papers: boolean;
  notes?: string;
  created_at: string;
}

interface Filters {
  status: string;
  hasPapers: string;
  dateFrom: string;
  dateTo: string;
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    status: '',
    hasPapers: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // Drawer state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
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

  useEffect(() => {
    loadApplications();
  }, [pagination.page, searchQuery, filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        q: searchQuery || undefined,
        status: filters.status || undefined,
        hasPapers: filters.hasPapers ? filters.hasPapers === 'true' : undefined,
        from: filters.dateFrom || undefined,
        to: filters.dateTo || undefined
      };
      
      const result = await listApplications(params);
      setApplications(result.rows);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (application: Application) => {
    setSelectedApplication(application);
    setEditingNotes(application.notes || '');
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
    if (!selectedApplication) return;
    
    const confirmTitle = newStatus === 'approved' ? 'Approve Application' : 'Reject Application';
    const confirmMessage = `Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this application?`;
    
    setConfirmAction({
      isOpen: true,
      title: confirmTitle,
      message: confirmMessage,
      action: async () => {
        try {
          setUpdatingStatus(true);
          await updateApplication(selectedApplication.id, { status: newStatus });
          
          // Update local state
          setApplications(prev => prev.map(app => 
            app.id === selectedApplication.id 
              ? { ...app, status: newStatus }
              : app
          ));
          setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
          console.error('Failed to update status:', error);
          alert('Failed to update application status');
        } finally {
          setUpdatingStatus(false);
        }
      }
    });
  };

  const handleNotesUpdate = async () => {
    if (!selectedApplication) return;
    
    try {
      setUpdatingStatus(true);
      await updateApplication(selectedApplication.id, { notes: editingNotes });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === selectedApplication.id 
          ? { ...app, notes: editingNotes }
          : app
      ));
      setSelectedApplication(prev => prev ? { ...prev, notes: editingNotes } : null);
    } catch (error) {
      console.error('Failed to update notes:', error);
      alert('Failed to update notes');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopyPhone = () => {
    if (selectedApplication?.phone) {
      navigator.clipboard.writeText(selectedApplication.phone);
      alert('Phone number copied to clipboard');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'company_name',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    {
      key: 'status',
      label: 'Status',
      render: (app: Application) => (
        <span className={`admin-tag ${getStatusColor(app.status)}`}>
          {app.status}
        </span>
      ),
    },
    {
      key: 'has_papers',
      label: 'Papers',
      render: (app: Application) => (
        <span className={`admin-tag ${app.has_papers ? 'text-green-600 bg-green-50 border-green-200' : 'text-neutral-600 bg-neutral-50 border-neutral-200'}`}>
          {app.has_papers ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (app: Application) => new Date(app.created_at).toLocaleDateString(),
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
        <option value="new">New</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      
      <select
        value={filters.hasPapers}
        onChange={(e) => handleFilterChange('hasPapers', e.target.value)}
        className="admin-input w-auto"
      >
        <option value="">All Papers</option>
        <option value="true">Has Papers</option>
        <option value="false">No Papers</option>
      </select>
      
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
        className="admin-input w-auto"
        placeholder="From Date"
      />
      
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
        className="admin-input w-auto"
        placeholder="To Date"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Applications</h1>
        <div className="text-sm text-neutral-600">
          {pagination.total} total applications
        </div>
      </div>

      <DataTable
        data={applications}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        filters={filtersComponent}
        csvFilename="applications.csv"
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No applications found"
      />

      {/* Application Details Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Application Details"
        size="md"
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Basic Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Name</label>
                  <p className="text-sm font-medium">{selectedApplication.full_name}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Company</label>
                  <p className="text-sm">{selectedApplication.company_name}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Phone</label>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{selectedApplication.phone}</p>
                    <button
                      onClick={handleCopyPhone}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Status</label>
                  <span className={`admin-tag ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Has Papers</label>
                  <span className={`admin-tag ${selectedApplication.has_papers ? 'text-green-600 bg-green-50 border-green-200' : 'text-neutral-600 bg-neutral-50 border-neutral-200'}`}>
                    {selectedApplication.has_papers ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Applied Date</label>
                  <p className="text-sm">{new Date(selectedApplication.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Internal Notes</h3>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="Add notes about this application..."
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
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updatingStatus || selectedApplication.status === 'approved'}
                  className="admin-btn bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updatingStatus || selectedApplication.status === 'rejected'}
                  className="admin-btn bg-red-600 hover:bg-red-700 border-red-600"
                >
                  Reject
                </button>
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
