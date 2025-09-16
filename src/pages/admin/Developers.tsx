import React, { useState, useEffect } from 'react';
import { getFilterOptions } from '@/lib/supabaseQueries';
import { listDevelopers, createDeveloper, updateDeveloper, deleteDeveloper } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface Developer {
  id?: string;
  name: string;
  propertyCount: number;
  projects: string[];
  description?: string;
  logo_url?: string;
  created_at?: string;
  source: 'inventory' | 'database';
}

interface DeveloperForm {
  name: string;
  description: string;
  logo_url: string;
}

export default function Developers() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  const [editingDeveloper, setEditingDeveloper] = useState<Developer | null>(null);
  const [formData, setFormData] = useState<DeveloperForm>({
    name: '',
    description: '',
    logo_url: ''
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
    loadAllDevelopers();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [developers, searchQuery, pagination.page]);

  const loadAllDevelopers = async () => {
    try {
      setLoading(true);
      
      // Load developers from database
      const dbDevelopers = await listDevelopers({ page: 1, pageSize: 1000 });
      
      // Load developers from inventory
      const options = await getFilterOptions();
      
      const allDevelopers: Developer[] = [];
      
      // Add database developers
      if (dbDevelopers.rows) {
        const databaseDevs: Developer[] = dbDevelopers.rows.map(dev => ({
          id: dev.id,
          name: dev.name,
          description: dev.description,
          logo_url: dev.logo_url,
          created_at: dev.created_at,
          propertyCount: 0,
          projects: [],
          source: 'database' as const
        }));
        allDevelopers.push(...databaseDevs);
      }
      
      // Add inventory developers (only if not already in database)
      if (!options.error && options.developers) {
        const dbDeveloperNames = new Set(allDevelopers.map(d => d.name.toLowerCase()));
        
        const inventoryDevs: Developer[] = Array.from(options.developers)
          .filter(devName => !dbDeveloperNames.has(devName.toLowerCase()))
          .map(devName => ({
            name: devName,
            propertyCount: 0,
            projects: [],
            source: 'inventory' as const
          }));
        
        allDevelopers.push(...inventoryDevs);
      }
      
      setDevelopers(allDevelopers);
      setPagination(prev => ({ ...prev, total: allDevelopers.length }));
    } catch (error) {
      console.error('Failed to load developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    let filtered = developers;
    
    if (searchQuery) {
      filtered = developers.filter(dev => 
        dev.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Pagination
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedDevelopers = filtered.slice(startIndex, endIndex);
    
    setFilteredDevelopers(paginatedDevelopers);
    setPagination(prev => ({ 
      ...prev, 
      total: filtered.length 
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleRowClick = (developer: Developer) => {
    setSelectedDeveloper(developer);
    setEditingDeveloper(null);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingDeveloper(null);
    setSelectedDeveloper(null);
    setFormData({ name: '', description: '', logo_url: '' });
    setDrawerOpen(true);
  };

  const handleEdit = (developer: Developer) => {
    setEditingDeveloper(developer);
    setSelectedDeveloper(null);
    setFormData({
      name: developer.name,
      description: developer.description || '',
      logo_url: developer.logo_url || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = (developer: Developer) => {
    if (developer.source === 'inventory') {
      alert('Cannot delete developers from inventory. They are automatically managed.');
      return;
    }

    setConfirmAction({
      isOpen: true,
      title: 'Delete Developer',
      message: `Are you sure you want to delete "${developer.name}"? This action cannot be undone.`,
      action: async () => {
        try {
          if (developer.id) {
            await deleteDeveloper(developer.id);
            await loadAllDevelopers(); // Reload the list
          }
        } catch (error) {
          console.error('Failed to delete developer:', error);
          alert('Failed to delete developer. It may be referenced by other records.');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      setSubmitting(true);
      
      if (editingDeveloper && editingDeveloper.id) {
        // Update existing developer
        await updateDeveloper(editingDeveloper.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          logo_url: formData.logo_url.trim() || undefined
        });
      } else {
        // Create new developer
        await createDeveloper({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          logo_url: formData.logo_url.trim() || undefined
        });
      }
      
      setDrawerOpen(false);
      await loadAllDevelopers(); // Reload the list
    } catch (error) {
      console.error('Failed to save developer:', error);
      alert('Failed to save developer. The name might already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Developer Name',
      sortable: true,
      render: (dev: Developer) => (
        <div className="flex items-center gap-3">
          {dev.logo_url && (
            <img 
              src={dev.logo_url} 
              alt={dev.name}
              className="w-8 h-8 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <span className="font-medium text-neutral-900">{dev.name}</span>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (dev: Developer) => (
        <span className={`admin-tag ${
          dev.source === 'database' 
            ? 'text-blue-600 bg-blue-50 border-blue-200' 
            : 'text-green-600 bg-green-50 border-green-200'
        }`}>
          {dev.source === 'database' ? 'Database' : 'Inventory'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (dev: Developer) => (
        <span className="text-neutral-600 text-sm">
          {dev.description || (dev.source === 'inventory' ? 'From inventory system' : 'No description')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (dev: Developer) => (
        <div className="flex gap-2">
          {dev.source === 'database' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(dev);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(dev);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </>
          )}
          {dev.source === 'inventory' && (
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
        <h1 className="text-2xl font-bold text-neutral-900">Developers</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleAdd} className="admin-btn">
            Add Developer
          </button>
          <div className="text-sm text-neutral-600">
            {pagination.total} total developers
          </div>
        </div>
      </div>

      <div className="admin-card p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Developer Management</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Database developers</strong> can be created, edited, and deleted</li>
          <li>• <strong>Inventory developers</strong> are automatically pulled from the property system</li>
          <li>• Duplicate names are prevented between database and inventory</li>
        </ul>
      </div>

      <DataTable
        data={filteredDevelopers}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        csvFilename="inventory-developers.csv"
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No developers found in inventory"
      />

      {/* Developer Details/Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingDeveloper ? (editingDeveloper.id ? 'Edit Developer' : 'Add Developer') : 'Developer Details'}
        size="md"
      >
        {editingDeveloper !== null ? (
          /* Add/Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="admin-input"
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="admin-input h-20 resize-none"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                className="admin-input"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.name.trim()}
                className="admin-btn flex-1"
              >
                {submitting ? 'Saving...' : editingDeveloper.id ? 'Update Developer' : 'Add Developer'}
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
        ) : selectedDeveloper ? (
          /* View Details */
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Developer Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Name</label>
                  <p className="text-sm font-medium">{selectedDeveloper.name}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Source</label>
                  <span className={`admin-tag ${
                    selectedDeveloper.source === 'database' 
                      ? 'text-blue-600 bg-blue-50 border-blue-200' 
                      : 'text-green-600 bg-green-50 border-green-200'
                  }`}>
                    {selectedDeveloper.source === 'database' ? 'Database' : 'Inventory'}
                  </span>
                </div>
                {selectedDeveloper.description && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Description</label>
                    <p className="text-sm">{selectedDeveloper.description}</p>
                  </div>
                )}
                {selectedDeveloper.logo_url && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Logo</label>
                    <img 
                      src={selectedDeveloper.logo_url} 
                      alt={selectedDeveloper.name}
                      className="w-16 h-16 rounded object-cover border"
                    />
                  </div>
                )}
                {selectedDeveloper.created_at && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Created</label>
                    <p className="text-sm">{new Date(selectedDeveloper.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Data Source</h3>
              <div className="text-sm text-neutral-600 space-y-1">
                {selectedDeveloper.source === 'database' ? (
                  <>
                    <p>• This developer is stored in the database</p>
                    <p>• You can edit or delete this developer</p>
                    <p>• Changes will be reflected immediately</p>
                  </>
                ) : (
                  <>
                    <p>• This developer is automatically pulled from the inventory system</p>
                    <p>• Property counts and project information are updated in real-time</p>
                    <p>• To modify details, update the inventory data directly</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Actions</h3>
              <div className="flex gap-2">
                {selectedDeveloper.source === 'database' && (
                  <button
                    onClick={() => handleEdit(selectedDeveloper)}
                    className="admin-btn-ghost"
                  >
                    Edit Developer
                  </button>
                )}
                <a href="/admin/inventory" className="admin-btn-ghost">
                  View Properties
                </a>
                <a href="/admin/projects" className="admin-btn-ghost">
                  View Projects
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
