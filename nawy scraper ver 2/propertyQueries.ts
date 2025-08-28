// Enhanced Property Queries for Bold Routes Partners
// Copy this to: src/lib/propertyQueries.ts

import { supabase } from './supabase'; // Use your existing supabase client

// TypeScript interfaces for better type safety
export interface PropertyFilter {
  compound?: string;
  area?: string;
  developer?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  finishing?: string;
  is_launch?: boolean;
}

export interface Property {
  id: number;
  nawy_id: number;
  unit_id?: string;
  unit_number?: string;
  unit_area?: number;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  price_in_egp?: number;
  price_per_meter?: number;
  currency: string;
  finishing?: string;
  is_launch: boolean;
  image?: string;
  compound?: {
    name: string;
    location?: string;
  };
  area?: {
    name: string;
    city?: string;
  };
  developer?: {
    name: string;
    phone?: string;
  };
  property_type?: {
    name: string;
    category?: string;
  };
  is_active: boolean;
  is_featured: boolean;
  priority_score: number;
  created_at: string;
}

export interface PropertyResponse {
  properties: Property[];
  error?: any;
  totalCount?: number;
  totalPages?: number;
}

export interface PropertyStats {
  totalProperties: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  avgArea: number;
  topCompounds: Array<{ name: string; count: number }>;
  topAreas: Array<{ name: string; count: number }>;
  topDevelopers: Array<{ name: string; count: number }>;
  topPropertyTypes: Array<{ name: string; count: number }>;
}

// Get all active properties with advanced filtering and pagination
export const getActiveProperties = async (
  page = 1,
  limit = 20,
  filters: PropertyFilter = {}
): Promise<PropertyResponse> => {
  try {
    let query = supabase
      .from('nawy_properties')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('visibility_status', 'public')
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.compound) {
      query = query.ilike('compound->>name', `%${filters.compound}%`);
    }
    if (filters.area) {
      query = query.ilike('area->>name', `%${filters.area}%`);
    }
    if (filters.developer) {
      query = query.ilike('developer->>name', `%${filters.developer}%`);
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
    if (filters.min_area) {
      query = query.gte('unit_area', filters.min_area);
    }
    if (filters.max_area) {
      query = query.lte('unit_area', filters.max_area);
    }
    if (filters.bedrooms) {
      query = query.eq('number_of_bedrooms', filters.bedrooms);
    }
    if (filters.bathrooms) {
      query = query.eq('number_of_bathrooms', filters.bathrooms);
    }
    if (filters.finishing) {
      query = query.ilike('finishing', `%${filters.finishing}%`);
    }
    if (filters.is_launch !== undefined) {
      query = query.eq('is_launch', filters.is_launch);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    return {
      properties: data || [],
      error,
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    return {
      properties: [],
      error,
      totalCount: 0,
      totalPages: 0,
    };
  }
};

// Get featured properties for homepage/highlights
export const getFeaturedProperties = async (limit = 10): Promise<PropertyResponse> => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .eq('visibility_status', 'public')
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    return { properties: data || [], error };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get property by Nawy ID
export const getPropertyById = async (nawyId: number): Promise<{ property?: Property; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .select('*')
      .eq('nawy_id', nawyId)
      .eq('is_active', true)
      .single();

    return { property: data, error };
  } catch (error) {
    return { error };
  }
};

// Full-text search across all property fields
export const searchProperties = async (
  searchTerm: string,
  limit = 20,
  filters: PropertyFilter = {}
): Promise<PropertyResponse> => {
  try {
    let query = supabase
      .from('nawy_properties')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('visibility_status', 'public');

    // Use full-text search if available, otherwise use ILIKE
    if (searchTerm) {
      query = query.or(`
        compound->>name.ilike.%${searchTerm}%,
        area->>name.ilike.%${searchTerm}%,
        developer->>name.ilike.%${searchTerm}%,
        property_type->>name.ilike.%${searchTerm}%,
        unit_number.ilike.%${searchTerm}%,
        finishing.ilike.%${searchTerm}%
      `);
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        switch (key) {
          case 'compound':
            query = query.ilike('compound->>name', `%${value}%`);
            break;
          case 'area':
            query = query.ilike('area->>name', `%${value}%`);
            break;
          case 'min_price':
            query = query.gte('price_in_egp', value);
            break;
          case 'max_price':
            query = query.lte('price_in_egp', value);
            break;
          case 'bedrooms':
            query = query.eq('number_of_bedrooms', value);
            break;
        }
      }
    });

    query = query
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error, count } = await query;

    return {
      properties: data || [],
      error,
      totalCount: count || 0,
    };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get unique values for filter dropdowns
export const getFilterOptions = async () => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .select('compound, area, developer, property_type, finishing, number_of_bedrooms, number_of_bathrooms')
      .eq('is_active', true)
      .eq('visibility_status', 'public');

    if (error) throw error;

    // Extract unique values
    const compounds = [...new Set(data.map(item => item.compound?.name).filter(Boolean))].sort();
    const areas = [...new Set(data.map(item => item.area?.name).filter(Boolean))].sort();
    const developers = [...new Set(data.map(item => item.developer?.name).filter(Boolean))].sort();
    const propertyTypes = [...new Set(data.map(item => item.property_type?.name).filter(Boolean))].sort();
    const finishings = [...new Set(data.map(item => item.finishing).filter(Boolean))].sort();
    const bedroomOptions = [...new Set(data.map(item => item.number_of_bedrooms).filter(n => n !== null))].sort((a, b) => a - b);
    const bathroomOptions = [...new Set(data.map(item => item.number_of_bathrooms).filter(n => n !== null))].sort((a, b) => a - b);

    return {
      compounds,
      areas,
      developers,
      propertyTypes,
      finishings,
      bedroomOptions,
      bathroomOptions,
      error: null,
    };
  } catch (error) {
    return {
      compounds: [],
      areas: [],
      developers: [],
      propertyTypes: [],
      finishings: [],
      bedroomOptions: [],
      bathroomOptions: [],
      error,
    };
  }
};

// Get property statistics for dashboard/analytics
export const getPropertyStats = async (): Promise<{ stats?: PropertyStats; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .select('price_in_egp, unit_area, compound, area, developer, property_type')
      .eq('is_active', true)
      .eq('visibility_status', 'public');

    if (error) throw error;

    const validPrices = data.map(p => p.price_in_egp).filter(p => p && p > 0);
    const validAreas = data.map(p => p.unit_area).filter(a => a && a > 0);

    const stats: PropertyStats = {
      totalProperties: data.length,
      avgPrice: validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length : 0,
      minPrice: validPrices.length > 0 ? Math.min(...validPrices) : 0,
      maxPrice: validPrices.length > 0 ? Math.max(...validPrices) : 0,
      avgArea: validAreas.length > 0 ? validAreas.reduce((sum, a) => sum + a, 0) / validAreas.length : 0,
      topCompounds: getTopValues(data, 'compound', 'name'),
      topAreas: getTopValues(data, 'area', 'name'),
      topDevelopers: getTopValues(data, 'developer', 'name'),
      topPropertyTypes: getTopValues(data, 'property_type', 'name'),
    };

    return { stats, error: null };
  } catch (error) {
    return { error };
  }
};

// Helper function to get top values with counts
function getTopValues(data: any[], field: string, subField: string, limit = 10) {
  const counts: Record<string, number> = {};
  
  data.forEach(item => {
    const value = item[field]?.[subField];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

// Get price ranges for filter sliders
export const getPriceRange = async () => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .select('price_in_egp')
      .eq('is_active', true)
      .eq('visibility_status', 'public')
      .not('price_in_egp', 'is', null)
      .order('price_in_egp', { ascending: true });

    if (error) throw error;

    const prices = data.map(item => item.price_in_egp).filter(p => p > 0);
    
    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      error: null,
    };
  } catch (error) {
    return { minPrice: 0, maxPrice: 0, error };
  }
};

// Get area ranges for filter sliders
export const getAreaRange = async () => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .select('unit_area')
      .eq('is_active', true)
      .eq('visibility_status', 'public')
      .not('unit_area', 'is', null)
      .order('unit_area', { ascending: true });

    if (error) throw error;

    const areas = data.map(item => item.unit_area).filter(a => a > 0);
    
    return {
      minArea: areas.length > 0 ? Math.min(...areas) : 0,
      maxArea: areas.length > 0 ? Math.max(...areas) : 0,
      error: null,
    };
  } catch (error) {
    return { minArea: 0, maxArea: 0, error };
  }
};

// Admin functions (require admin role)
export const updatePropertyStatus = async (nawyId: number, updates: Partial<Property>) => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .update(updates)
      .eq('nawy_id', nawyId)
      .select()
      .single();

    return { property: data, error };
  } catch (error) {
    return { error };
  }
};

export const bulkUpdateProperties = async (nawyIds: number[], updates: Partial<Property>) => {
  try {
    const { data, error } = await supabase
      .from('nawy_properties')
      .update(updates)
      .in('nawy_id', nawyIds)
      .select();

    return { properties: data || [], error };
  } catch (error) {
    return { properties: [], error };
  }
};
