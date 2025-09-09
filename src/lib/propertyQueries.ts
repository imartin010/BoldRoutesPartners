import { supabase } from './supabase';

export interface Property {
  id: number;
  unit_id: string;
  unit_number?: string;
  unit_area: number;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  price_per_meter: number;
  price_in_egp: number;
  currency?: string;
  finishing?: string;
  is_launch?: boolean;
  image?: string;
  // JSON fields
  compound?: { id: number; name: string };
  area?: { id: number; name: string };
  developer?: { id: number; name: string; phone?: string };
  property_type?: { id: number; name: string };
  // Payment fields
  payment_plans?: any[];
  paymentData?: {
    downPayment: number | null;
    monthlyPayment: number | null;
    years: number | null;
  };
}

// Helper function to safely parse JSON fields
function parseJsonField(field: any) {
  if (!field) return null;
  if (typeof field === 'object') return field;
  if (typeof field === 'string') {
    try {
      // Handle Python dict format with single quotes
      const cleanField = field.replace(/'/g, '"');
      const parsed = JSON.parse(cleanField);
      return parsed;
    } catch (e) {
      // If JSON parsing fails, try to extract name manually
      const nameMatch = field.match(/'name':\s*'([^']+)'/);
      if (nameMatch) {
        return { name: nameMatch[1].trim() };
      }
      return null;
    }
  }
  return null;
}

// Get properties by compound
export const getPropertiesByCompound = async (compoundName: string) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .not('compound', 'is', null);

    if (error) throw error;

    // Filter by compound name (client-side since JSONB filtering is limited)
    const filteredData = data?.filter(prop => {
      const compound = parseJsonField(prop.compound);
      return compound?.name?.toLowerCase().includes(compoundName.toLowerCase());
    }) || [];

    return { properties: filteredData, error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by area
export const getPropertiesByArea = async (areaName: string) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .not('area', 'is', null);

    if (error) throw error;

    // Filter by area name (client-side since JSONB filtering is limited)
    const filteredData = data?.filter(prop => {
      const area = parseJsonField(prop.area);
      return area?.name?.toLowerCase().includes(areaName.toLowerCase());
    }) || [];

    return { properties: filteredData, error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by developer
export const getPropertiesByDeveloper = async (developerName: string) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .not('developer', 'is', null);

    if (error) throw error;

    // Filter by developer name (client-side since JSONB filtering is limited)
    const filteredData = data?.filter(prop => {
      const developer = parseJsonField(prop.developer);
      return developer?.name?.toLowerCase().includes(developerName.toLowerCase());
    }) || [];

    return { properties: filteredData, error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by property type
export const getPropertiesByType = async (typeName: string) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .not('property_type', 'is', null);

    if (error) throw error;

    // Filter by property type (client-side since JSONB filtering is limited)
    const filteredData = data?.filter(prop => {
      const propertyType = parseJsonField(prop.property_type);
      return propertyType?.name?.toLowerCase().includes(typeName.toLowerCase());
    }) || [];

    return { properties: filteredData, error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by bedrooms
export const getPropertiesByBedrooms = async (bedrooms: number) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .eq('number_of_bedrooms', bedrooms);

    if (error) throw error;

    return { properties: data || [], error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by bathrooms
export const getPropertiesByBathrooms = async (bathrooms: number) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .eq('number_of_bathrooms', bathrooms);

    if (error) throw error;

    return { properties: data || [], error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by price range
export const getPropertiesByPriceRange = async (minPrice: number, maxPrice: number) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .gte('price_in_egp', minPrice)
      .lte('price_in_egp', maxPrice);

    if (error) throw error;

    return { properties: data || [], error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by area range
export const getPropertiesByAreaRange = async (minArea: number, maxArea: number) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .gte('unit_area', minArea)
      .lte('unit_area', maxArea);

    if (error) throw error;

    return { properties: data || [], error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get properties by finishing
export const getPropertiesByFinishing = async (finishing: string) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*')
      .ilike('finishing', `%${finishing}%`);

    if (error) throw error;

    return { properties: data || [], error: null };
  } catch (error) {
    return { properties: [], error };
  }
};



// Search properties
export const searchProperties = async (searchTerm: string) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('*');

    if (error) throw error;

    // Client-side search since JSONB search is limited
    const filteredData = data?.filter(prop => {
      const compound = parseJsonField(prop.compound);
      const area = parseJsonField(prop.area);
      const developer = parseJsonField(prop.developer);
      const propertyType = parseJsonField(prop.property_type);
      
      const searchLower = searchTerm.toLowerCase();
      return (
        compound?.name?.toLowerCase().includes(searchLower) ||
        area?.name?.toLowerCase().includes(searchLower) ||
        developer?.name?.toLowerCase().includes(searchLower) ||
        propertyType?.name?.toLowerCase().includes(searchLower) ||
        prop.unit_id?.toLowerCase().includes(searchLower) ||
        prop.unit_number?.toLowerCase().includes(searchLower)
      );
    }) || [];

    return { properties: filteredData, error: null };
  } catch (error) {
    return { properties: [], error };
  }
};

// Get price ranges for filter sliders
export const getPriceRange = async () => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .select('price_in_egp')
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
      .from('brdata_properties')
      .select('unit_area')
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
export const updatePropertyStatus = async (propertyId: number, updates: Partial<Property>) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .update(updates)
      .eq('id', propertyId)
      .select()
      .single();

    return { property: data, error };
  } catch (error) {
    return { error };
  }
};

export const bulkUpdateProperties = async (propertyIds: number[], updates: Partial<Property>) => {
  try {
    const { data, error } = await supabase
      .from('brdata_properties')
      .update(updates)
      .in('id', propertyIds)
      .select();

    return { properties: data || [], error };
  } catch (error) {
    return { properties: [], error };
  }
};
