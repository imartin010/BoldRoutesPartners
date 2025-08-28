// Property queries for your existing website
// Copy this file to your existing project's lib/ or utils/ folder

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdqqqogshgtpzxtufjzn.supabase.co',
  'YOUR_SUPABASE_ANON_KEY' // Replace with your actual key
);

// Get all active properties with pagination
export const getActiveProperties = async (page = 1, limit = 20, filters = {}) => {
  let query = supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('priority_score', { ascending: false })
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.compound) {
    query = query.ilike('compound->>name', `%${filters.compound}%`);
  }
  if (filters.area) {
    query = query.ilike('area->>name', `%${filters.area}%`);
  }
  if (filters.property_type) {
    query = query.ilike('property_type->>name', `%${filters.property_type}%`);
  }
  if (filters.min_price) {
    query = query.gte('price_in_egp', filters.min_price);
  }
  if (filters.max_price) {
    query = query.lte('price_in_egp', filters.max_price);
  }
  if (filters.bedrooms) {
    query = query.eq('number_of_bedrooms', filters.bedrooms);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  
  return {
    properties: data || [],
    error,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / limit)
  };
};

// Get featured properties
export const getFeaturedProperties = async (limit = 10) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('priority_score', { ascending: false })
    .limit(limit);

  return { properties: data || [], error };
};

// Get property by ID
export const getPropertyById = async (id) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('nawy_id', id)
    .eq('is_active', true)
    .single();

  return { property: data, error };
};

// Get unique compounds for filters
export const getCompounds = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('compound')
    .eq('is_active', true)
    .not('compound', 'is', null);

  if (error) return { compounds: [], error };

  // Extract unique compound names
  const compounds = [...new Set(data.map(item => item.compound?.name).filter(Boolean))];
  return { compounds, error: null };
};

// Get unique areas for filters
export const getAreas = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('area')
    .eq('is_active', true)
    .not('area', 'is', null);

  if (error) return { areas: [], error };

  const areas = [...new Set(data.map(item => item.area?.name).filter(Boolean))];
  return { areas, error: null };
};

// Get property statistics
export const getPropertyStats = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('price_in_egp, unit_area, compound, area, property_type')
    .eq('is_active', true);

  if (error) return { stats: null, error };

  const stats = {
    totalProperties: data.length,
    avgPrice: data.reduce((sum, p) => sum + (p.price_in_egp || 0), 0) / data.length,
    minPrice: Math.min(...data.map(p => p.price_in_egp || 0).filter(p => p > 0)),
    maxPrice: Math.max(...data.map(p => p.price_in_egp || 0)),
    avgArea: data.reduce((sum, p) => sum + (p.unit_area || 0), 0) / data.length,
    topCompounds: getTopValues(data, 'compound', 'name'),
    topAreas: getTopValues(data, 'area', 'name'),
    topPropertyTypes: getTopValues(data, 'property_type', 'name')
  };

  return { stats, error: null };
};

// Helper function to get top values
function getTopValues(data, field, subField, limit = 5) {
  const counts = {};
  data.forEach(item => {
    const value = item[field]?.[subField];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

// Search properties
export const searchProperties = async (searchTerm, limit = 20) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .or(`compound->>name.ilike.%${searchTerm}%,area->>name.ilike.%${searchTerm}%,developer->>name.ilike.%${searchTerm}%,property_type->>name.ilike.%${searchTerm}%`)
    .limit(limit);

  return { properties: data || [], error };
};
