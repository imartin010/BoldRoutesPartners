import React, { useState, useEffect } from 'react';
import { listUsers, updateUserRole } from '@/api/admin';
import DataTable from '@/components/admin/DataTable';
import Drawer from '@/components/admin/Drawer';
import Confirm from '@/components/admin/Confirm';

interface User {
  id: string;
  full_name?: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Filters {
  role: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    role: ''
  });
  
  // Drawer state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  
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
    loadUsers();
  }, [pagination.page, searchQuery, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        q: searchQuery || undefined,
        role: filters.role || undefined
      };
      
      const result = await listUsers(params);
      setUsers(result.rows);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
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

  const handleRoleUpdate = async (newRole: string) => {
    if (!selectedUser) return;
    
    const actionText = newRole === 'admin' ? 'promote to Admin' : 'change role to User';
    
    setConfirmAction({
      isOpen: true,
      title: 'Update User Role',
      message: `Are you sure you want to ${actionText} for "${selectedUser.full_name || 'this user'}"?`,
      action: async () => {
        try {
          setUpdatingRole(true);
          await updateUserRole(selectedUser.id, newRole);
          
          // Update local state
          setUsers(prev => prev.map(user => 
            user.id === selectedUser.id 
              ? { ...user, role: newRole }
              : user
          ));
          setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
        } catch (error) {
          console.error('Failed to update user role:', error);
          alert('Failed to update user role');
        } finally {
          setUpdatingRole(false);
        }
      }
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50 border-red-200';
      case 'user': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (user: User) => (
        <span className="font-medium">{user.full_name || 'Not provided'}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (user: User) => (
        <span className="text-neutral-600">{user.phone || 'Not provided'}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => (
        <span className={`admin-tag ${getRoleColor(user.role)}`}>
          {user.role}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (user: User) => new Date(user.created_at).toLocaleDateString(),
    },
  ];

  const filtersComponent = (
    <div className="flex gap-2">
      <select
        value={filters.role}
        onChange={(e) => handleFilterChange('role', e.target.value)}
        className="admin-input w-auto"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Users</h1>
        <div className="text-sm text-neutral-600">
          {pagination.total} total users
        </div>
      </div>

      <div className="admin-card p-4 bg-orange-50 border-orange-200">
        <h3 className="font-medium text-orange-900 mb-2">User Management</h3>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Users are created automatically when they sign up or sign in</li>
          <li>• Admin users have access to this admin panel and all management features</li>
          <li>• Regular users can only access the main application</li>
          <li>• Email addresses are managed through Supabase Auth and not shown here</li>
        </ul>
      </div>

      <DataTable
        data={users}
        columns={columns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        filters={filtersComponent}
        csvFilename="users.csv"
        loading={loading}
        onRowClick={handleRowClick}
        emptyMessage="No users found"
      />

      {/* User Details Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">User Information</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">User ID</label>
                  <p className="text-sm font-mono">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Full Name</label>
                  <p className="text-sm">{selectedUser.full_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Phone</label>
                  <p className="text-sm">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Current Role</label>
                  <span className={`admin-tag ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Joined Date</label>
                  <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Role Management */}
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-900">Role Management</h3>
              <div className="space-y-2">
                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => handleRoleUpdate('admin')}
                    disabled={updatingRole}
                    className="admin-btn bg-red-600 hover:bg-red-700 border-red-600 w-full"
                  >
                    {updatingRole ? 'Updating...' : 'Promote to Admin'}
                  </button>
                )}
                
                {selectedUser.role !== 'user' && (
                  <button
                    onClick={() => handleRoleUpdate('user')}
                    disabled={updatingRole}
                    className="admin-btn-ghost w-full"
                  >
                    {updatingRole ? 'Updating...' : 'Change to User'}
                  </button>
                )}
              </div>
              
              <div className="text-xs text-neutral-500 space-y-1">
                <p>• Admins can access the admin panel and manage all data</p>
                <p>• Users can only access the main application features</p>
                <p>• Be careful when removing admin privileges</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="text-xs text-neutral-500">
                <p>User ID: {selectedUser.id}</p>
                <p>Account created: {new Date(selectedUser.created_at).toLocaleString()}</p>
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
