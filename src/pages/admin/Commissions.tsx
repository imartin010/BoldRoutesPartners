import React, { useState, useEffect } from 'react';
import { useDataStore } from '@/store/data';
import { listCommissionRates, createCommissionRate, updateCommissionRate, deleteCommissionRate, listDevelopers, listProjects } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface CommissionRate {
  id?: string;
  developer_id?: string;
  project_id?: string;
  percentage: number;
  created_at?: string;
  developers?: { name: string };
  projects?: { name: string };
  developerName: string;
  projectNames?: string;
  source: 'json' | 'database';
}

interface Developer {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  developer_id: string;
}

interface CommissionForm {
  developer_id: string;
  project_id: string;
  percentage: string;
}

export default function Commissions() {
  const { commissions: liveCommissions, loadLiveCommissions } = useDataStore();
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [filteredRates, setFilteredRates] = useState<CommissionRate[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<CommissionRate | null>(null);
  const [editingRate, setEditingRate] = useState<CommissionRate | null>(null);
  const [formData, setFormData] = useState<CommissionForm>({
    developer_id: '',
    project_id: '',
    percentage: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
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
    // Load live commissions first to ensure we have the JSON data
    loadLiveCommissions();
  }, []);

  useEffect(() => {
    // Load all commission rates when live commissions change
    loadAllCommissionRates();
    loadDevelopers();
    loadProjects();
  }, [liveCommissions]);

  useEffect(() => {
    filterCommissionRates();
  }, [commissionRates, searchQuery, pagination.page]);

  const loadAllCommissionRates = async () => {
    try {
      setLoading(true);
      
      // Load commission rates from database
      const dbRates = await listCommissionRates({ page: 1, pageSize: 1000 });
      
      const allRates: CommissionRate[] = [];
      
      // Add database commission rates
      if (dbRates.rows) {
        const databaseRates: CommissionRate[] = dbRates.rows.map(rate => ({
          id: rate.id,
          developer_id: rate.developer_id,
          project_id: rate.project_id,
          percentage: rate.percentage,
          created_at: rate.created_at,
          developers: rate.developers,
          projects: rate.projects,
          developerName: rate.developers?.name || 'Unknown',
          projectNames: rate.projects?.name,
          source: 'database' as const
        }));
        allRates.push(...databaseRates);
      }
      
      // Add live commission rates (from JSON file)
      if (liveCommissions && liveCommissions.length > 0) {
        const dbDeveloperNames = new Set(allRates.map(r => r.developerName.toLowerCase()));
        
        const liveRates: CommissionRate[] = liveCommissions
          .filter(comm => !dbDeveloperNames.has(comm.developerName.toLowerCase()))
          .map(comm => ({
            percentage: comm.commissionPercent,
            developerName: comm.developerName,
            projectNames: comm.projects || 'All Projects',
            source: 'json' as const
          }));
        
        allRates.push(...liveRates);
      }
      
      setCommissionRates(allRates);
      setPagination(prev => ({ ...prev, total: allRates.length }));
    } catch (error) {
      console.error('Failed to load commission rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCommissionRates = () => {
    let filtered = commissionRates;
    
    if (searchQuery) {
      filtered = commissionRates.filter(rate => 
        rate.developerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rate.projectNames && rate.projectNames.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Pagination
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedRates = filtered.slice(startIndex, endIndex);
    
    setFilteredRates(paginatedRates);
    setPagination(prev => ({ 
      ...prev, 
      total: filtered.length 
    }));
  };

  const loadDevelopers = async () => {
    try {
      const result = await listDevelopers({ page: 1, pageSize: 1000 });
      setDevelopers(result.rows);
    } catch (error) {
      console.error('Failed to load developers:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const result = await listProjects({ page: 1, pageSize: 1000 });
      setProjects(result.rows);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleRowClick = (rate: CommissionRate) => {
    setSelectedRate(rate);
    setEditingRate(null);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingRate(null);
    setSelectedRate(null);
    setFormData({ developer_id: '', project_id: '', percentage: '' });
    setDrawerOpen(true);
  };

  const handleEdit = (rate: CommissionRate) => {
    setEditingRate(rate);
    setSelectedRate(null);
    setFormData({
      developer_id: rate.developer_id || '',
      project_id: rate.project_id || '',
      percentage: rate.percentage.toString()
    });
    setDrawerOpen(true);
  };

  const handleDelete = (rate: CommissionRate) => {
    if (rate.source === 'json') {
      alert('Cannot delete commission rates from the live system. They are automatically managed.');
      return;
    }

    const projectName = rate.projects?.name;
    const developerName = rate.developerName;
    const rateDescription = projectName 
      ? `${developerName} - ${projectName} (${rate.percentage}%)`
      : `${developerName} - All Projects (${rate.percentage}%)`;
      
    setConfirmAction({
      isOpen: true,
      title: 'Delete Commission Rate',
      message: `Are you sure you want to delete the commission rate for "${rateDescription}"?`,
      action: async () => {
        try {
          if (rate.id) {
            await deleteCommissionRate(rate.id);
            await loadAllCommissionRates(); // Reload the list
            await loadLiveCommissions(); // Update the main commissions page data
          }
        } catch (error) {
          console.error('Failed to delete commission rate:', error);
          alert('Failed to delete commission rate.');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const percentage = parseFloat(formData.percentage);
    
    if (!formData.developer_id || isNaN(percentage) || percentage < 0 || percentage > 20) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (editingRate && editingRate.id) {
        // Update existing rate
        await updateCommissionRate(editingRate.id, { percentage });
      } else {
        // Create new rate
        await createCommissionRate({
          developer_id: formData.developer_id,
          project_id: formData.project_id || undefined,
          percentage
        });
      }
      
      setDrawerOpen(false);
      await loadAllCommissionRates(); // Reload the list
      await loadLiveCommissions(); // Update the main commissions page data
    } catch (error) {
      console.error('Failed to save commission rate:', error);
      alert('Failed to save commission rate. A rate for this developer/project combination may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectsForDeveloper = (developerId: string) => {
    return projects.filter(p => p.developer_id === developerId);
  };

  const columns = [
    {
      key: 'developer',
      label: 'Developer',
      render: (rate: CommissionRate) => (
        <span className="font-medium text-neutral-900">{rate.developerName}</span>
      ),
    },
    {
      key: 'project',
      label: 'Projects',
      render: (rate: CommissionRate) => (
        <span className="text-neutral-600 text-sm">
          {rate.projectNames || rate.projects?.name || 'All Projects'}
        </span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (rate: CommissionRate) => (
        <span className={`admin-tag ${
          rate.source === 'database' 
            ? 'text-blue-600 bg-blue-50 border-blue-200' 
            : 'text-green-600 bg-green-50 border-green-200'
        }`}>
          {rate.source === 'database' ? 'Database' : 'Live System'}
        </span>
      ),
    },
    {
      key: 'percentage',
      label: 'Commission %',
      render: (rate: CommissionRate) => (
        <span className="font-semibold text-green-600">
          {rate.percentage}%
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (rate: CommissionRate) => (
        <div className="flex gap-2">
          {rate.source === 'database' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(rate);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(rate);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </>
          )}
          {rate.source === 'json' && (
            <span className="text-neutral-400 text-sm">
              Auto-managed
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Commission Rates</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleAdd} className="admin-btn">
            Add Commission Rate
          </button>
          <div className="text-sm text-neutral-600">
            {pagination.total} total commission rates
          </div>
        </div>
      </div>

      <div className="admin-card p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Commission Rate Management</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Live System rates</strong> are automatically pulled from the active commission data</li>
          <li>• <strong>Database rates</strong> can be created, edited, and deleted</li>
          <li>• Database rates override live system rates for the same developer</li>
          <li>• Commission rates must be between 0% and 20%</li>
          <li>• Changes to database rates will be reflected in the main /commissions page</li>
        </ul>
      </div>

      <DataTable
        data={filteredRates}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        csvFilename="commission-rates.csv"
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No commission rates found"
      />

      {/* Commission Rate Details/Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingRate ? (editingRate.id ? 'Edit Commission Rate' : 'Add Commission Rate') : 'Commission Rate Details'}
        size="md"
      >
        {editingRate !== null ? (
          /* Add/Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Developer *
              </label>
              <select
                value={formData.developer_id}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    developer_id: e.target.value,
                    project_id: '' // Reset project when developer changes
                  }));
                }}
                className="admin-input"
                required
                disabled={!!editingRate?.id} // Can't change developer for existing rates
              >
                <option value="">Select Developer</option>
                {developers.map(dev => (
                  <option key={dev.id} value={dev.id}>{dev.name}</option>
                ))}
              </select>
              {editingRate?.id && (
                <p className="text-xs text-neutral-500 mt-1">
                  Developer cannot be changed for existing rates
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Project (Optional)
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
                className="admin-input"
                disabled={!formData.developer_id || !!editingRate?.id}
              >
                <option value="">All Projects</option>
                {formData.developer_id && getProjectsForDeveloper(formData.developer_id).map(proj => (
                  <option key={proj.id} value={proj.id}>{proj.name}</option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">
                Leave empty to apply to all projects for this developer
              </p>
              {editingRate?.id && (
                <p className="text-xs text-neutral-500 mt-1">
                  Project cannot be changed for existing rates
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Commission Percentage * (0-20%)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.01"
                value={formData.percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                className="admin-input"
                required
                placeholder="5.0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.developer_id || !formData.percentage}
                className="admin-btn flex-1"
              >
                {submitting ? 'Saving...' : editingRate?.id ? 'Update Rate' : 'Add Rate'}
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="admin-btn-ghost flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : selectedRate ? (
          /* View Details */
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Commission Rate Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Developer</label>
                  <p className="text-sm font-medium">{selectedRate.developerName}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Projects</label>
                  <p className="text-sm">{selectedRate.projectNames || selectedRate.projects?.name || 'All Projects'}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Commission Rate</label>
                  <p className="text-lg font-semibold text-green-600">{selectedRate.percentage}%</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Source</label>
                  <span className={`admin-tag ${
                    selectedRate.source === 'database' 
                      ? 'text-blue-600 bg-blue-50 border-blue-200' 
                      : 'text-green-600 bg-green-50 border-green-200'
                  }`}>
                    {selectedRate.source === 'database' ? 'Database' : 'Live System'}
                  </span>
                </div>
                {selectedRate.created_at && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Created</label>
                    <p className="text-sm">{new Date(selectedRate.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Data Source</h3>
              <div className="text-sm text-neutral-600 space-y-1">
                {selectedRate.source === 'database' ? (
                  <>
                    <p>• This commission rate is stored in the database</p>
                    <p>• You can edit or delete this rate</p>
                    <p>• Changes will be reflected in the main /commissions page</p>
                  </>
                ) : (
                  <>
                    <p>• This commission rate is automatically pulled from the live system</p>
                    <p>• It appears in the main /commissions page</p>
                    <p>• To modify this rate, update the live commission data</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Actions</h3>
              <div className="flex gap-2">
                {selectedRate.source === 'database' && (
                  <button
                    onClick={() => handleEdit(selectedRate)}
                    className="admin-btn-ghost"
                  >
                    Edit Commission Rate
                  </button>
                )}
                <a href="/commissions" className="admin-btn-ghost">
                  View in Commission Calculator
                </a>
                <a href="/admin/developers" className="admin-btn-ghost">
                  View Developers
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Confirmation Dialog */}
      <Confirm
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.action}
        title={confirmAction.title}
        message={confirmAction.message}
        type="danger"
      />
    </div>
  );
}
