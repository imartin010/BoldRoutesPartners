import React, { useState, useEffect } from 'react';
import { getFilterOptions } from '@/lib/supabaseQueries';
import { listProjects, createProject, updateProject, deleteProject, listDevelopers } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface Project {
  id?: string;
  name: string;
  developer_id?: string;
  developer_name?: string;
  description?: string;
  location?: string;
  created_at?: string;
  developers?: { name: string };
  source: 'inventory' | 'database';
}

interface Developer {
  id: string;
  name: string;
}

interface ProjectForm {
  name: string;
  developer_id: string;
  description: string;
  location: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectForm>({
    name: '',
    developer_id: '',
    description: '',
    location: ''
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
    loadAllProjects();
    loadDevelopers();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, selectedDeveloper, pagination.page]);

  const loadAllProjects = async () => {
    try {
      setLoading(true);
      
      // Load projects from database
      const dbProjects = await listProjects({ page: 1, pageSize: 1000 });
      
      // Load compounds (projects) from inventory
      const options = await getFilterOptions();
      
      const allProjects: Project[] = [];
      
      // Add database projects
      if (dbProjects.rows) {
        const databaseProjects: Project[] = dbProjects.rows.map(proj => ({
          id: proj.id,
          name: proj.name,
          developer_id: proj.developer_id,
          developer_name: proj.developers?.name,
          description: proj.description,
          location: proj.location,
          created_at: proj.created_at,
          developers: proj.developers,
          source: 'database' as const
        }));
        allProjects.push(...databaseProjects);
      }
      
      // Add inventory projects (compounds) - only if not already in database
      if (!options.error && options.compounds) {
        const dbProjectNames = new Set(allProjects.map(p => p.name.toLowerCase()));
        
        const inventoryProjects: Project[] = Array.from(options.compounds)
          .filter(compoundName => compoundName && !dbProjectNames.has(compoundName.toLowerCase()))
          .map(compoundName => ({
            name: compoundName,
            developer_name: 'Various',
            source: 'inventory' as const
          }));
        
        allProjects.push(...inventoryProjects);
      }
      
      setProjects(allProjects);
      setPagination(prev => ({ ...prev, total: allProjects.length }));
    } catch (error) {
      console.error('Failed to load projects:', error);
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

  const filterProjects = () => {
    let filtered = projects;
    
    if (searchQuery) {
      filtered = projects.filter(proj => 
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (proj.developer_name && proj.developer_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedDeveloper) {
      filtered = filtered.filter(proj => 
        proj.developer_id === selectedDeveloper ||
        (proj.developer_name && proj.developer_name.toLowerCase().includes(selectedDeveloper.toLowerCase()))
      );
    }
    
    // Pagination
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedProjects = filtered.slice(startIndex, endIndex);
    
    setFilteredProjects(paginatedProjects);
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

  const handleDeveloperFilter = (developerId: string) => {
    setSelectedDeveloper(developerId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setEditingProject(null);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setSelectedProject(null);
    setFormData({ name: '', developer_id: '', description: '', location: '' });
    setDrawerOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setSelectedProject(null);
    setFormData({
      name: project.name,
      developer_id: project.developer_id || '',
      description: project.description || '',
      location: project.location || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (project.source === 'inventory') {
      alert('Cannot delete projects from inventory. They are automatically managed.');
      return;
    }

    setConfirmAction({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      action: async () => {
        try {
          if (project.id) {
            await deleteProject(project.id);
            await loadAllProjects(); // Reload the list
          }
        } catch (error) {
          console.error('Failed to delete project:', error);
          alert('Failed to delete project. It may be referenced by other records.');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.developer_id) return;
    
    try {
      setSubmitting(true);
      
      if (editingProject && editingProject.id) {
        // Update existing project
        await updateProject(editingProject.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          location: formData.location.trim() || undefined
        });
      } else {
        // Create new project
        await createProject({
          name: formData.name.trim(),
          developer_id: formData.developer_id,
          description: formData.description.trim() || undefined,
          location: formData.location.trim() || undefined
        });
      }
      
      setDrawerOpen(false);
      await loadAllProjects(); // Reload the list
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. The name might already exist for this developer.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Project Name',
      sortable: true,
      render: (proj: Project) => (
        <span className="font-medium text-neutral-900">{proj.name}</span>
      ),
    },
    {
      key: 'developer',
      label: 'Developer',
      render: (proj: Project) => (
        <span className="text-neutral-600">{proj.developer_name || proj.developers?.name || 'Various'}</span>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      render: (proj: Project) => (
        <span className={`admin-tag ${
          proj.source === 'database' 
            ? 'text-blue-600 bg-blue-50 border-blue-200' 
            : 'text-green-600 bg-green-50 border-green-200'
        }`}>
          {proj.source === 'database' ? 'Database' : 'Inventory'}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (proj: Project) => (
        <span className="text-neutral-600 text-sm">
          {proj.location || (proj.source === 'inventory' ? 'From inventory system' : 'Not specified')}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (proj: Project) => (
        <span className="text-neutral-600 text-sm">
          {proj.description ? 
            `${proj.description.substring(0, 50)}${proj.description.length > 50 ? '...' : ''}` :
            (proj.source === 'inventory' ? 'From inventory system' : 'No description')
          }
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (proj: Project) => (
        <div className="flex gap-2">
          {proj.source === 'database' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(proj);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(proj);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </>
          )}
          {proj.source === 'inventory' && (
            <span className="text-neutral-400 text-sm">
              Auto-managed
            </span>
          )}
        </div>
      ),
    },
  ];

  const filtersComponent = (
    <div className="flex gap-2">
      <select
        value={selectedDeveloper}
        onChange={(e) => handleDeveloperFilter(e.target.value)}
        className="admin-input w-auto"
      >
        <option value="">All Developers</option>
        {developers.map(dev => (
          <option key={dev.id} value={dev.id}>{dev.name}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleAdd} className="admin-btn">
            Add Project
          </button>
          <div className="text-sm text-neutral-600">
            {pagination.total} total projects
          </div>
        </div>
      </div>

      <div className="admin-card p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Project Management</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Database projects</strong> can be created, edited, and deleted</li>
          <li>• <strong>Inventory projects</strong> are automatically pulled from the compounds in inventory</li>
          <li>• Duplicate names are prevented between database and inventory</li>
        </ul>
      </div>

      <DataTable
        data={filteredProjects}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        filters={filtersComponent}
        csvFilename="projects.csv"
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No projects found"
      />

      {/* Project Details/Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingProject ? (editingProject.id ? 'Edit Project' : 'Add Project') : 'Project Details'}
        size="md"
      >
        {editingProject !== null ? (
          /* Add/Edit Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Project Name *
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
                Developer *
              </label>
              <select
                value={formData.developer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, developer_id: e.target.value }))}
                className="admin-input"
                required
                disabled={!!editingProject?.id} // Can't change developer for existing projects
              >
                <option value="">Select Developer</option>
                {developers.map(dev => (
                  <option key={dev.id} value={dev.id}>{dev.name}</option>
                ))}
              </select>
              {editingProject?.id && (
                <p className="text-xs text-neutral-500 mt-1">
                  Developer cannot be changed for existing projects
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="admin-input"
                placeholder="Cairo, Egypt"
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !formData.name.trim() || !formData.developer_id}
                className="admin-btn flex-1"
              >
                {submitting ? 'Saving...' : editingProject?.id ? 'Update Project' : 'Add Project'}
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
        ) : selectedProject ? (
          /* View Details */
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Project Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Name</label>
                  <p className="text-sm font-medium">{selectedProject.name}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Developer</label>
                  <p className="text-sm">{selectedProject.developer_name || selectedProject.developers?.name || 'Various'}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Source</label>
                  <span className={`admin-tag ${
                    selectedProject.source === 'database' 
                      ? 'text-blue-600 bg-blue-50 border-blue-200' 
                      : 'text-green-600 bg-green-50 border-green-200'
                  }`}>
                    {selectedProject.source === 'database' ? 'Database' : 'Inventory'}
                  </span>
                </div>
                {selectedProject.location && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Location</label>
                    <p className="text-sm">{selectedProject.location}</p>
                  </div>
                )}
                {selectedProject.description && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Description</label>
                    <p className="text-sm">{selectedProject.description}</p>
                  </div>
                )}
                {selectedProject.created_at && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider">Created</label>
                    <p className="text-sm">{new Date(selectedProject.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Data Source</h3>
              <div className="text-sm text-neutral-600 space-y-1">
                {selectedProject.source === 'database' ? (
                  <>
                    <p>• This project is stored in the database</p>
                    <p>• You can edit or delete this project</p>
                    <p>• Changes will be reflected immediately</p>
                  </>
                ) : (
                  <>
                    <p>• This project is automatically pulled from the inventory compounds</p>
                    <p>• Property information is updated in real-time</p>
                    <p>• To modify details, update the inventory data directly</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Actions</h3>
              <div className="flex gap-2">
                {selectedProject.source === 'database' && (
                  <button
                    onClick={() => handleEdit(selectedProject)}
                    className="admin-btn-ghost"
                  >
                    Edit Project
                  </button>
                )}
                <a href="/admin/inventory" className="admin-btn-ghost">
                  View Properties
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
