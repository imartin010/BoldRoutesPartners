import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter } from 'lucide-react';
import { useDeals } from '../contexts/DealsContext';
import { formatCurrencyEGP } from '../utils/format';
import EmptyState from '../components/EmptyState';

export default function Deals() {
  const { deals } = useDeals();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Contract' | 'CIL' | 'Reservation'>('All');

  // Filter deals based on search and status
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.developer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || deal.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filters = ['All', 'Contract', 'CIL', 'Reservation'] as const;

  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <Link
              to="/deals/create"
              className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Deal</span>
            </Link>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg p-8">
            <EmptyState
              title="You haven't added any deals yet"
              subtitle="Start by creating your first deal to keep everything organized and boost your commission."
              actionText="Create Deal"
              onAction={() => window.location.href = '/deals/create'}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <Link
            to="/deals/create"
            className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deal</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Deals List */}
        {filteredDeals.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No deals found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`} className="block">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {deal.clientName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {deal.project} • {deal.developer}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    deal.status === 'Contract' ? 'bg-green-100 text-green-800' :
                    deal.status === 'CIL' ? 'bg-blue-100 text-blue-800' :
                    deal.status === 'Reservation' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {deal.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Unit</p>
                    <p className="font-medium">{deal.unitNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium">{deal.unitType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="font-medium">{deal.unitArea} m²</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Contract Price</p>
                    <p className="font-semibold text-lg text-green-600">
                      {formatCurrencyEGP(deal.contractPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Down Payment</p>
                    <p className="font-medium">
                      {formatCurrencyEGP(deal.downPayment)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {new Date(deal.createdAt).toLocaleDateString()}</span>
                  <span>Delivery: {new Date(deal.deliveryDate).toLocaleDateString()}</span>
                </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
