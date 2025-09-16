import React, { useState, useEffect } from 'react';
import { listInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, listDevelopers, listProjects } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface InventoryItem {
  id: string;
  unit_number: string;
  unit_type: string;
  developer_id: string;
  project_id: string;
  price?: number;
  is_available: boolean;
  created_at: string;
  developers?: { name: string };
  projects?: { name: string };
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

interface InventoryForm {
  unit_number: string;
  unit_type: string;
  developer_id: string;
  project_id: string;
  price: string;
  is_available: boolean;
}

interface Filters {
  available: string;
  developer: string;
  project: string;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    available: '',
    developer: '',
    project: ''
  });
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryForm>({
    unit_number: '',
    unit_type: '',
    developer_id: '',
    project_id: '',
    price: '',
    is_available: true
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
    loadInventory();
    loadDevelopers();
    loadProjects();
  }, [pagination.page, searchQuery, filters]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        q: searchQuery || undefined,
        available: filters.available ? filters.available === 'true' : undefined
      };
      
      const result = await listInventory(params);
      setInventory(result.rows);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
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

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      unit_number: '',
      unit_type: '',
      developer_id: '',
      project_id: '',
      price: '',
      is_available: true
    });
    setDrawerOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      unit_number: item.unit_number,
      unit_type: item.unit_type,
      developer_id: item.developer_id,
      project_id: item.project_id,
      price: item.price?.toString() || '',
      is_available: item.is_available
    });
    setDrawerOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setConfirmAction({
      isOpen: true,
      title: 'Delete Inventory Item',
      message: `Are you sure you want to delete unit "${item.unit_number}" from ${item.projects?.name || 'Unknown Project'}?`,
      action: async () => {
        try {
          await deleteInventoryItem(item.id);
          setInventory(prev => prev.filter(i => i.id !== item.id));
          setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
          console.error('Failed to delete inventory item:', error);
          alert('Failed to delete inventory item.');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unit_number.trim() || !formData.unit_type.trim() || !formData.developer_id || !formData.project_id) return;
    
    try {
      setSubmitting(true);
      
      const itemData = {
        unit_number: formData.unit_number.trim(),
        unit_type: formData.unit_type.trim(),
        developer_id: formData.developer_id,
        project_id: formData.project_id,
        price: formData.price ? Number(formData.price) : undefined,
        is_available: formData.is_available
      };
      
      if (editingItem) {
        // Update existing item
        await updateInventoryItem(editingItem.id, {
          unit_number: itemData.unit_number,
          unit_type: itemData.unit_type,
          price: itemData.price,
          is_available: itemData.is_available
        });
        
        setInventory(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                unit_number: itemData.unit_number,
                unit_type: itemData.unit_type,
                price: itemData.price,
                is_available: itemData.is_available
              }
            : item
        ));
      } else {
        // Create new item
        const newItem = await createInventoryItem(itemData);
        
        // Add developer and project names for display
        const developer = developers.find(d => d.id === formData.developer_id);
        const project = projects.find(p => p.id === formData.project_id);
        
        const itemWithNames = {
          ...newItem,
          developers: developer ? { name: developer.name } : undefined,
          projects: project ? { name: project.name } : undefined
        };
        
        setInventory(prev => [itemWithNames, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      }
      
      setDrawerOpen(false);
    } catch (error) {
      console.error('Failed to save inventory item:', error);
      alert('Failed to save inventory item. The unit number might already exist for this project.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectsForDeveloper = (developerId: string) => {
    return projects.filter(p => p.developer_id === developerId);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'unit_number',
      label: 'Unit Number',
      sortable: true,
      render: (item: InventoryItem) => (
        <span className="font-medium">{item.unit_number}</span>
      ),
    },
    {
      key: 'unit_type',
      label: 'Type',
      render: (item: InventoryItem) => (
        <span className="text-neutral-600">{item.unit_type}</span>
      ),
    },
    {
      key: 'developer',
      label: 'Developer',
      render: (item: InventoryItem) => (
        <span className="text-neutral-600 text-sm">{item.developers?.name || 'Unknown'}</span>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (item: InventoryItem) => (
        <span className="text-neutral-600 text-sm">{item.projects?.name || 'Unknown'}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (item: InventoryItem) => (
        <span className="text-sm font-medium">{formatCurrency(item.price)}</span>
      ),
    },
    {
      key: 'is_available',
      label: 'Status',
      render: (item: InventoryItem) => (
        <span className={`admin-tag ${
          item.is_available 
            ? 'text-green-600 bg-green-50 border-green-200' 
            : 'text-red-600 bg-red-50 border-red-200'
        }`}>
          {item.is_available ? 'Available' : 'Sold'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: InventoryItem) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const filtersComponent = (
    <div className="flex flex-wrap gap-2">
      <select
        value={filters.available}
        onChange={(e) => handleFilterChange('available', e.target.value)}
        className="admin-input w-auto"
      >
        <option value="">All Status</option>
        <option value="true">Available</option>
        <option value="false">Sold</option>
      </select>
      
      <select
        value={filters.developer}
        onChange={(e) => {
          handleFilterChange('developer', e.target.value);
          setFilters(prev => ({ ...prev, project: '' })); // Reset project filter
        }}
        className="admin-input w-auto"
      >
        <option value="">All Developers</option>
        {developers.map(dev => (
          <option key={dev.id} value={dev.id}>{dev.name}</option>
        ))}
      </select>
      
      <select
        value={filters.project}
        onChange={(e) => handleFilterChange('project', e.target.value)}
        className="admin-input w-auto"
        disabled={!filters.developer}
      >
        <option value="">All Projects</option>
        {filters.developer && getProjectsForDeveloper(filters.developer).map(proj => (
          <option key={proj.id} value={proj.id}>{proj.name}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Inventory</h1>
        <button onClick={handleAdd} className="admin-btn">
          Add Inventory Item
        </button>
      </div>

      <DataTable
        data={inventory}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        filters={filtersComponent}
        csvFilename="inventory.csv"
        loading={loading}
        emptyMessage="No inventory items found"
      />

      {/* Add/Edit Inventory Item Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Unit Number *
            </label>
            <input
              type="text"
              value={formData.unit_number}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
              className="admin-input"
              required
              maxLength={50}
              placeholder="A-101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Unit Type *
            </label>
            <input
              type="text"
              value={formData.unit_type}
              onChange={(e) => setFormData(prev => ({ ...prev, unit_type: e.target.value }))}
              className="admin-input"
              required
              maxLength={50}
              placeholder="2 Bedroom Apartment"
            />
          </div>

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
              disabled={!!editingItem} // Can't change developer for existing items
            >
              <option value="">Select Developer</option>
              {developers.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>
            {editingItem && (
              <p className="text-xs text-neutral-500 mt-1">
                Developer cannot be changed for existing items
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Project *
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
              className="admin-input"
              required
              disabled={!formData.developer_id || !!editingItem}
            >
              <option value="">Select Project</option>
              {formData.developer_id && getProjectsForDeveloper(formData.developer_id).map(proj => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
            {editingItem && (
              <p className="text-xs text-neutral-500 mt-1">
                Project cannot be changed for existing items
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Price (EGP)
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="admin-input"
              placeholder="1500000"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.checked }))}
                className="rounded border-neutral-300 focus-ring"
              />
              <span className="text-sm font-medium text-neutral-700">Available for sale</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || !formData.unit_number.trim() || !formData.unit_type.trim() || !formData.developer_id || !formData.project_id}
              className="admin-btn flex-1"
            >
              {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
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
