// Property Admin Control Component
// Add this to your frontend to control property visibility

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdqqqogshgtpzxtufjzn.supabase.co',
  'YOUR_SUPABASE_ANON_KEY'
);

interface Property {
  id: number;
  nawy_id: number;
  unit_area: number;
  price_in_egp: number;
  compound: { name: string };
  area: { name: string };
  property_type: { name: string };
  is_active: boolean;
  is_featured: boolean;
  visibility_status: string;
  priority_score: number;
}

const PropertyAdminPanel: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    compound: '',
    area: '',
    property_type: '',
    status: 'all'
  });

  // Fetch properties with filters
  const fetchProperties = async () => {
    setLoading(true);
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('priority_score', { ascending: false })
      .order('price_in_egp', { ascending: true })
      .limit(50); // Limit for performance

    if (filters.status === 'active') {
      query = query.eq('is_active', true);
    } else if (filters.status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching properties:', error);
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  // Toggle property active status
  const toggleActive = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (!error) {
      fetchProperties(); // Refresh data
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ is_featured: !currentStatus })
      .eq('id', id);

    if (!error) {
      fetchProperties();
    }
  };

  // Update priority score
  const updatePriority = async (id: number, score: number) => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ priority_score: score })
      .eq('id', id);

    if (!error) {
      fetchProperties();
    }
  };

  // Bulk operations
  const bulkToggleActive = async (activate: boolean) => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ is_active: activate })
      .in('id', properties.map(p => p.id));

    if (!error) {
      fetchProperties();
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Property Inventory Control</h2>
      
      {/* Control Panel */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => bulkToggleActive(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Activate All Visible
          </button>
          <button 
            onClick={() => bulkToggleActive(false)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Deactivate All Visible
          </button>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-4 gap-4">
          <select 
            value={filters.status} 
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="p-2 border rounded"
          >
            <option value="all">All Properties</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          
          <input
            type="text"
            placeholder="Filter by compound..."
            value={filters.compound}
            onChange={(e) => setFilters({...filters, compound: e.target.value})}
            className="p-2 border rounded"
          />
          
          <input
            type="text"
            placeholder="Filter by area..."
            value={filters.area}
            onChange={(e) => setFilters({...filters, area: e.target.value})}
            className="p-2 border rounded"
          />
          
          <input
            type="text"
            placeholder="Filter by type..."
            value={filters.property_type}
            onChange={(e) => setFilters({...filters, property_type: e.target.value})}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Properties Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Compound</th>
              <th className="border p-2">Area</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Size (m²)</th>
              <th className="border p-2">Price (EGP)</th>
              <th className="border p-2">Active</th>
              <th className="border p-2">Featured</th>
              <th className="border p-2">Priority</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center p-4">Loading...</td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className={!property.is_active ? 'bg-red-50' : ''}>
                  <td className="border p-2">{property.nawy_id}</td>
                  <td className="border p-2">{property.compound?.name}</td>
                  <td className="border p-2">{property.area?.name}</td>
                  <td className="border p-2">{property.property_type?.name}</td>
                  <td className="border p-2">{property.unit_area}</td>
                  <td className="border p-2">{property.price_in_egp?.toLocaleString()}</td>
                  
                  {/* Active Toggle */}
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => toggleActive(property.id, property.is_active)}
                      className={`px-3 py-1 rounded text-sm ${
                        property.is_active 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {property.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  
                  {/* Featured Toggle */}
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => toggleFeatured(property.id, property.is_featured)}
                      className={`px-3 py-1 rounded text-sm ${
                        property.is_featured 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {property.is_featured ? 'Featured' : 'Normal'}
                    </button>
                  </td>
                  
                  {/* Priority Score */}
                  <td className="border p-2">
                    <input
                      type="number"
                      value={property.priority_score}
                      onChange={(e) => updatePriority(property.id, parseInt(e.target.value))}
                      className="w-16 p-1 border rounded text-center"
                      min="0"
                      max="100"
                    />
                  </td>
                  
                  <td className="border p-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleActive(property.id, property.is_active)}
                        className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Toggle
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
          <div className="text-sm text-gray-600">Total Visible</div>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <div className="text-2xl font-bold text-green-600">
            {properties.filter(p => p.is_active).length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded">
          <div className="text-2xl font-bold text-yellow-600">
            {properties.filter(p => p.is_featured).length}
          </div>
          <div className="text-sm text-gray-600">Featured</div>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">
            {properties.filter(p => p.price_in_egp > 0).length}
          </div>
          <div className="text-sm text-gray-600">With Prices</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAdminPanel;
