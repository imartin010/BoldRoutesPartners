import { useEffect, useState } from "react";
import { signInWithEmail, signOut, getSession, listApplications, listDeals, signUrl } from "@/api/admin";
import { useSupabaseRole } from "@/hooks/useSupabaseRole";
import { Search, Download, Copy, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface SearchFilters {
  applications: {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
  deals: {
    search: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
}

export default function AdminEnhanced() {
  const [email, setEmail] = useState("");
  const { isAdmin, isLoading: roleLoading, error: roleError } = useSupabaseRole();
  const [apps, setApps] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [appsPagination, setAppsPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0
  });
  const [dealsPagination, setDealsPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0
  });
  
  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    applications: { search: "", status: "", dateFrom: "", dateTo: "" },
    deals: { search: "", status: "", dateFrom: "", dateTo: "" }
  });

  const loadData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [appsData, dealsData] = await Promise.all([
        listApplications(),
        listDeals()
      ]);
      
      // Apply client-side filtering (in production, this should be server-side)
      const filteredApps = appsData.filter(app => {
        const matchesSearch = filters.applications.search === "" || 
          app.full_name.toLowerCase().includes(filters.applications.search.toLowerCase()) ||
          app.company_name.toLowerCase().includes(filters.applications.search.toLowerCase()) ||
          app.phone.includes(filters.applications.search);
        
        const matchesStatus = filters.applications.status === "" || app.status === filters.applications.status;
        
        return matchesSearch && matchesStatus;
      });
      
      const filteredDeals = dealsData.filter(deal => {
        const matchesSearch = filters.deals.search === "" ||
          deal.developer_name.toLowerCase().includes(filters.deals.search.toLowerCase()) ||
          deal.project_name.toLowerCase().includes(filters.deals.search.toLowerCase()) ||
          deal.client_name.toLowerCase().includes(filters.deals.search.toLowerCase());
        
        const matchesStatus = filters.deals.status === "" || deal.review_status === filters.deals.status;
        
        return matchesSearch && matchesStatus;
      });
      
      // Apply pagination (client-side for now)
      const appsStart = (appsPagination.page - 1) * appsPagination.pageSize;
      const appsEnd = appsStart + appsPagination.pageSize;
      const paginatedApps = filteredApps.slice(appsStart, appsEnd);
      
      const dealsStart = (dealsPagination.page - 1) * dealsPagination.pageSize;
      const dealsEnd = dealsStart + dealsPagination.pageSize;
      const paginatedDeals = filteredDeals.slice(dealsStart, dealsEnd);
      
      setApps(paginatedApps);
      setDeals(paginatedDeals);
      
      setAppsPagination(prev => ({ ...prev, total: filteredApps.length }));
      setDealsPagination(prev => ({ ...prev, total: filteredDeals.length }));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAdmin, filters, appsPagination.page, dealsPagination.page]);

  const handleSearch = (type: 'applications' | 'deals', field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
    
    // Reset to first page when searching
    if (type === 'applications') {
      setAppsPagination(prev => ({ ...prev, page: 1 }));
    } else {
      setDealsPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // In a real app, you'd show a toast notification here
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const renderPagination = (pagination: PaginationState, setPagination: (fn: (prev: PaginationState) => PaginationState) => void) => {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} entries
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 py-1 text-sm">
            {pagination.page} of {totalPages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
            disabled={pagination.page === totalPages}
            className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (roleError) {
    return (
      <div className="p-4 mx-auto max-w-md">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Error checking permissions: {roleError.message}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-4">
        <h1 className="text-2xl font-semibold mb-2">Admin Sign-In</h1>
        <p className="muted mb-4">Enter your email to receive a magic link.</p>
        <div className="space-y-2">
          <input 
            className="input w-full" 
            placeholder="you@company.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <button 
            className="btn w-full" 
            onClick={async () => {
              try {
                await signInWithEmail(email);
                alert("Check your email for the magic link.");
              } catch (err) {
                alert("Failed to send magic link. Please try again.");
              }
            }}
          >
            Send Magic Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 mx-auto max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={loadData}
            disabled={loading}
            className="btn-ghost flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="btn-ghost" onClick={signOut}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Partner Applications Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Partner Applications</h2>
          <button
            onClick={() => exportToCSV(apps, 'partner-applications.csv')}
            className="btn-ghost flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="input pl-10 w-full"
              placeholder="Search name, company, phone..."
              value={filters.applications.search}
              onChange={e => handleSearch('applications', 'search', e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filters.applications.status}
            onChange={e => handleSearch('applications', 'status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="date"
            className="input"
            placeholder="From Date"
            value={filters.applications.dateFrom}
            onChange={e => handleSearch('applications', 'dateFrom', e.target.value)}
          />
          <input
            type="date"
            className="input"
            placeholder="To Date"
            value={filters.applications.dateTo}
            onChange={e => handleSearch('applications', 'dateTo', e.target.value)}
          />
        </div>
        
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No applications found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Phone</th>
                      <th className="text-left p-3">Company</th>
                      <th className="text-left p-3">Agents</th>
                      <th className="text-left p-3">Papers</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(app => (
                      <tr key={app.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium">{app.full_name}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span>{app.phone}</span>
                            <button
                              onClick={() => copyToClipboard(app.phone)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy phone number"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3">{app.company_name}</td>
                        <td className="p-3">{app.agents_count}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            app.has_papers 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {app.has_papers ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            app.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            app.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status || 'new'}
                          </span>
                        </td>
                        <td className="p-3">{new Date(app.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            {/* In a real app, these would trigger status update modals */}
                            <button className="text-green-600 hover:text-green-800 text-xs">Approve</button>
                            <button className="text-red-600 hover:text-red-800 text-xs">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(appsPagination, setAppsPagination)}
            </>
          )}
        </div>
      </section>

      {/* Closed Deals Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Closed Deals</h2>
          <button
            onClick={() => exportToCSV(deals, 'closed-deals.csv')}
            className="btn-ghost flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="input pl-10 w-full"
              placeholder="Search developer, project, client..."
              value={filters.deals.search}
              onChange={e => handleSearch('deals', 'search', e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filters.deals.status}
            onChange={e => handleSearch('deals', 'status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="date"
            className="input"
            placeholder="From Date"
            value={filters.deals.dateFrom}
            onChange={e => handleSearch('deals', 'dateFrom', e.target.value)}
          />
          <input
            type="date"
            className="input"
            placeholder="To Date"
            value={filters.deals.dateTo}
            onChange={e => handleSearch('deals', 'dateTo', e.target.value)}
          />
        </div>
        
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No deals found matching your criteria.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Developer</th>
                      <th className="text-left p-3">Project</th>
                      <th className="text-left p-3">Client</th>
                      <th className="text-left p-3">Value</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Files</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.map(deal => (
                      <tr key={deal.id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="p-3 font-medium">{deal.developer_name}</td>
                        <td className="p-3">{deal.project_name}</td>
                        <td className="p-3">{deal.client_name}</td>
                        <td className="p-3 font-mono">
                          {Number(deal.deal_value).toLocaleString()} EGP
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            deal.review_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            deal.review_status === 'verified' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {deal.review_status || 'pending'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(deal.attachments || []).map((attachment: any, index: number) => (
                              <button 
                                key={index} 
                                className="text-blue-600 hover:text-blue-800 text-xs underline"
                                onClick={async () => {
                                  try {
                                    const url = await signUrl(attachment.path);
                                    window.open(url, "_blank");
                                  } catch (err) {
                                    alert("Failed to open file");
                                  }
                                }}
                              >
                                File {index + 1}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">{new Date(deal.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <button className="text-green-600 hover:text-green-800 text-xs">Verify</button>
                            <button className="text-red-600 hover:text-red-800 text-xs">Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination(dealsPagination, setDealsPagination)}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
