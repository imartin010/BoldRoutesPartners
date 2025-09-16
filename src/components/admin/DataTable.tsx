import React, { useState, useMemo } from 'react';
import { downloadCSV } from '@/utils/csv';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface Filters {
  [key: string]: any;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Filters) => void;
  filters?: React.ReactNode;
  csvFilename?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (id: string, selected: boolean) => void;
  getRowId?: (item: T) => string;
  emptyMessage?: string;
}

export default function DataTable<T>({
  data,
  columns,
  pagination,
  onPageChange,
  onSearch,
  onFilter,
  filters,
  csvFilename,
  loading = false,
  onRowClick,
  selectedRows,
  onRowSelect,
  getRowId,
  emptyMessage = "No data found"
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSort = (columnKey: string) => {
    if (!columns.find(c => c.key === columnKey)?.sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (csvFilename && data.length > 0) {
      downloadCSV(csvFilename, data);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(pagination.page * pagination.pageSize, pagination.total);

  const canSelectRows = selectedRows && onRowSelect && getRowId;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          {onSearch && (
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input w-64"
              />
              <button type="submit" className="admin-btn">
                Search
              </button>
            </form>
          )}
          {filters}
        </div>
        
        <div className="flex gap-2">
          {csvFilename && data.length > 0 && (
            <button onClick={handleExportCSV} className="admin-btn-ghost">
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full mx-auto"></div>
            <p className="mt-2 text-neutral-600">Loading...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  {canSelectRows && (
                    <th className="text-left p-3 w-12">
                      <input
                        type="checkbox"
                        checked={data.length > 0 && data.every(item => selectedRows.has(getRowId(item)))}
                        onChange={(e) => {
                          data.forEach(item => {
                            onRowSelect(getRowId(item), e.target.checked);
                          });
                        }}
                        className="rounded border-neutral-300 focus-ring"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`text-left p-3 text-sm font-medium text-neutral-900 ${
                        column.sortable ? 'cursor-pointer hover:bg-neutral-50' : ''
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.sortable && (
                          <span className="text-neutral-400">
                            {sortColumn === column.key ? (
                              sortDirection === 'asc' ? '↑' : '↓'
                            ) : '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const rowId = getRowId?.(item) ?? index.toString();
                  const isSelected = selectedRows?.has(rowId) ?? false;
                  
                  return (
                    <tr
                      key={rowId}
                      className={`border-b border-neutral-100 transition-colors ${
                        onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''
                      } ${isSelected ? 'bg-neutral-50' : ''}`}
                      onClick={() => onRowClick?.(item)}
                    >
                      {canSelectRows && (
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onRowSelect(rowId, e.target.checked)}
                            className="rounded border-neutral-300 focus-ring"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="p-3 text-sm">
                          {column.render ? column.render(item) : (item as any)[column.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-neutral-600">
            Showing {startItem}-{endItem} of {pagination.total} results
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded border border-neutral-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded border text-sm ${
                    pagination.page === pageNum
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="px-3 py-1 rounded border border-neutral-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
