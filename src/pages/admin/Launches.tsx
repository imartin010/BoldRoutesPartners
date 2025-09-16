import React, { useState, useEffect } from 'react';
import { listLaunches, createLaunch, updateLaunch, deleteLaunch, listDevelopers, listProjects } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface Launch {
  id: string;
  title: string;
  description?: string;
  developer_id: string;
  project_id?: string;
  launch_date: string;
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

interface LaunchForm {
  title: string;
  description: string;
  developer_id: string;
  project_id: string;
  launch_date: string;
}

export default function Launches() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLaunch, setEditingLaunch] = useState<Launch | null>(null);
  const [formData, setFormData] = useState<LaunchForm>({
    title: '',
    description: '',
    developer_id: '',
    project_id: '',
    launch_date: ''
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
    loadLaunches();
    loadDevelopers();
    loadProjects();
  }, [pagination.page, searchQuery]);

  const loadLaunches = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        q: searchQuery || undefined
      };
      
      const result = await listLaunches(params);
      setLaunches(result.rows);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Failed to load launches:', error);
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

  const handleAdd = () => {
    setEditingLaunch(null);
    setFormData({
      title: '',
      description: '',
      developer_id: '',
      project_id: '',
      launch_date: ''
    });
    setDrawerOpen(true);
  };

  const handleEdit = (launch: Launch) => {
    setEditingLaunch(launch);
    setFormData({
      title: launch.title,
      description: launch.description || '',
      developer_id: launch.developer_id,
      project_id: launch.project_id || '',
      launch_date: launch.launch_date.split('T')[0] // Convert to YYYY-MM-DD format
    });
    setDrawerOpen(true);
  };

  const handleDelete = (launch: Launch) => {
    setConfirmAction({
      isOpen: true,
      title: 'Delete Launch',
      message: `Are you sure you want to delete "${launch.title}"? This action cannot be undone.`,
      action: async () => {
        try {
          await deleteLaunch(launch.id);
          setLaunches(prev => prev.filter(l => l.id !== launch.id));
          setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        } catch (error) {
          console.error('Failed to delete launch:', error);
          alert('Failed to delete launch.');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.developer_id || !formData.launch_date) return;
    
    try {
      setSubmitting(true);
      
      if (editingLaunch) {
        // Update existing launch
        await updateLaunch(editingLaunch.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          launch_date: formData.launch_date
        });
        
        setLaunches(prev => prev.map(launch => 
          launch.id === editingLaunch.id 
            ? { 
                ...launch, 
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                launch_date: formData.launch_date
              }
            : launch
        ));
      } else {
        // Create new launch
        const newLaunch = await createLaunch({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          developer_id: formData.developer_id,
          project_id: formData.project_id || undefined,
          launch_date: formData.launch_date
        });
        
        // Add developer and project names for display
        const developer = developers.find(d => d.id === formData.developer_id);
        const project = formData.project_id ? projects.find(p => p.id === formData.project_id) : undefined;
        
        const launchWithNames = {
          ...newLaunch,
          developers: developer ? { name: developer.name } : undefined,
          projects: project ? { name: project.name } : undefined
        };
        
        setLaunches(prev => [launchWithNames, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      }
      
      setDrawerOpen(false);
    } catch (error) {
      console.error('Failed to save launch:', error);
      alert('Failed to save launch.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProjectsForDeveloper = (developerId: string) => {
    return projects.filter(p => p.developer_id === developerId);
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (launch: Launch) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{launch.title}</span>
          {isUpcoming(launch.launch_date) && (
            <span className="admin-tag text-blue-600 bg-blue-50 border-blue-200">
              Upcoming
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'developer',
      label: 'Developer',
      render: (launch: Launch) => (
        <span className="text-neutral-600">{launch.developers?.name || 'Unknown'}</span>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (launch: Launch) => (
        <span className="text-neutral-600 text-sm">
          {launch.projects?.name || 'General'}
        </span>
      ),
    },
    {
      key: 'launch_date',
      label: 'Launch Date',
      render: (launch: Launch) => {
        const date = new Date(launch.launch_date);
        const isUpcomingLaunch = isUpcoming(launch.launch_date);
        return (
          <span className={`text-sm ${isUpcomingLaunch ? 'font-medium text-blue-600' : 'text-neutral-600'}`}>
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (launch: Launch) => (
        <span className="text-neutral-600 text-sm">
          {launch.description ? 
            `${launch.description.substring(0, 50)}${launch.description.length > 50 ? '...' : ''}` :
            'No description'
          }
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (launch: Launch) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(launch)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(launch)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Launches</h1>
        <button onClick={handleAdd} className="admin-btn">
          Add Launch
        </button>
      </div>

      <DataTable
        data={launches}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        csvFilename="launches.csv"
        loading={loading}
        emptyMessage="No launches found"
      />

      {/* Add/Edit Launch Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingLaunch ? 'Edit Launch' : 'Add Launch'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="admin-input"
              required
              maxLength={100}
              placeholder="Summer Collection Launch"
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
            >
              <option value="">Select Developer</option>
              {developers.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Project (Optional)
            </label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
              className="admin-input"
              disabled={!formData.developer_id}
            >
              <option value="">General Launch</option>
              {formData.developer_id && getProjectsForDeveloper(formData.developer_id).map(proj => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Launch Date *
            </label>
            <input
              type="date"
              value={formData.launch_date}
              onChange={(e) => setFormData(prev => ({ ...prev, launch_date: e.target.value }))}
              className="admin-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="admin-input h-24 resize-none"
              maxLength={500}
              placeholder="Describe the launch event, new features, or offerings..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || !formData.title.trim() || !formData.developer_id || !formData.launch_date}
              className="admin-btn flex-1"
            >
              {submitting ? 'Saving...' : editingLaunch ? 'Update Launch' : 'Add Launch'}
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
