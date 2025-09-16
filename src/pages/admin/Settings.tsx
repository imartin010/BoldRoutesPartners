import React, { useState, useEffect } from 'react';
import { getStorageUsage } from '@/api/admin';

interface StorageInfo {
  fileCount: number;
  totalSize: number | null;
}

export default function Settings() {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ fileCount: 0, totalSize: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      setLoading(true);
      const info = await getStorageUsage();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    } finally {
      setLoading(false);
    }
  };

  const systemInfo = [
    { label: 'Application Version', value: '1.0.0' },
    { label: 'Environment', value: import.meta.env.MODE },
    { label: 'Supabase URL', value: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...' },
    { label: 'Build Date', value: new Date().toLocaleDateString() },
  ];

  const configSettings = [
    { 
      label: 'File Upload Limits',
      description: 'Maximum file size: 10MB per file, 5 files per deal',
      status: 'Active'
    },
    { 
      label: 'Commission Rate Limits',
      description: 'Commission rates must be between 0% and 20%',
      status: 'Active'
    },
    { 
      label: 'Storage Policy',
      description: 'Files uploaded to deals/ prefix only',
      status: 'Active'
    },
    { 
      label: 'Admin Authentication',
      description: 'Email-based OTP authentication required',
      status: 'Active'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <button onClick={loadStorageInfo} className="admin-btn-ghost">
          Refresh Data
        </button>
      </div>

      {/* System Information */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemInfo.map((info, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-b-0">
              <span className="text-sm text-neutral-600">{info.label}</span>
              <span className="text-sm font-medium text-neutral-900">{info.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Information */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Storage Usage</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-neutral-600">Loading storage info...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Files in deal-attachments bucket</span>
              <span className="text-sm font-medium text-neutral-900">{storageInfo.fileCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-600">Total Storage Size</span>
              <span className="text-sm font-medium text-neutral-900">
                {storageInfo.totalSize !== null 
                  ? `${(storageInfo.totalSize / (1024 * 1024)).toFixed(2)} MB`
                  : 'Not available'
                }
              </span>
            </div>
            <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-100">
              <p>• Files are automatically managed by Supabase storage</p>
              <p>• Only admins can download files via signed URLs</p>
              <p>• Files are uploaded to deals/ prefix for security</p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Settings */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Configuration</h3>
        <div className="space-y-4">
          {configSettings.map((setting, index) => (
            <div key={index} className="flex items-start justify-between py-3 border-b border-neutral-100 last:border-b-0">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-neutral-900">{setting.label}</h4>
                <p className="text-xs text-neutral-600 mt-1">{setting.description}</p>
              </div>
              <span className={`admin-tag text-green-600 bg-green-50 border-green-200`}>
                {setting.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Database Tables Info */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Database Tables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'developers',
            'projects', 
            'commission_rates',
            'launches',
            'inventory_items',
            'partner_applications',
            'closed_deals',
            'profiles'
          ].map((table) => (
            <div key={table} className="admin-card bg-neutral-50">
              <h4 className="text-sm font-medium text-neutral-900">{table}</h4>
              <p className="text-xs text-neutral-600 mt-1">
                {table === 'profiles' && 'User authentication data'}
                {table === 'developers' && 'Developer company information'}
                {table === 'projects' && 'Real estate projects'}
                {table === 'commission_rates' && 'Partner commission settings'}
                {table === 'launches' && 'Project launch events'}
                {table === 'inventory_items' && 'Available units inventory'}
                {table === 'partner_applications' && 'Partnership applications'}
                {table === 'closed_deals' && 'Completed sale transactions'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Status */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Migration Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Admin Panel Migration (001)</span>
            <span className="admin-tag text-green-600 bg-green-50 border-green-200">Applied</span>
          </div>
          <div className="text-xs text-neutral-500">
            <p>• Added status and notes columns to applications and deals</p>
            <p>• Created indexes for better query performance</p>
            <p>• Updated storage policies for security</p>
            <p>• Added unique constraints on project names per developer</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-neutral-900">Data Management</h4>
            <button 
              onClick={loadStorageInfo}
              className="admin-btn-ghost w-full text-left"
            >
              Refresh Storage Info
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="admin-btn-ghost w-full text-left"
            >
              Refresh Application
            </button>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-neutral-900">External Links</h4>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="admin-btn-ghost w-full text-left block"
            >
              Open Supabase Dashboard
            </a>
            <a 
              href="/"
              className="admin-btn-ghost w-full text-left block"
            >
              Go to Main Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
