// Simple API to work with Nawy CSV data directly
// No database needed - reads from CSV file

export interface Property {
  id: number;
  unit_id?: string;
  unit_number?: string;
  unit_area?: number;
  number_of_bedrooms?: number;
  number_of_bathrooms?: number;
  price_in_egp?: number;
  price_per_meter?: number;
  currency?: string;
  finishing?: string;
  is_launch?: boolean;
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
  [key: string]: any;
}

export interface PropertyFilter {
  compound?: string;
  area?: string;
  developer?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  search?: string;
}

export interface PropertyResponse {
  properties: Property[];
  totalCount: number;
  totalPages: number;
  error?: string;
}

// Mock data for now - we'll replace this with actual API calls
const MOCK_PROPERTIES: Property[] = [
  {
    id: 1,
    unit_number: "A-101",
    unit_area: 120,
    number_of_bedrooms: 2,
    number_of_bathrooms: 2,
    price_in_egp: 2500000,
    price_per_meter: 20833,
    currency: "EGP",
    finishing: "Super Lux",
    is_launch: true,
    compound: { name: "Palm Hills October", location: "6th of October" },
    area: { name: "6th of October", city: "Giza" },
    developer: { name: "Palm Hills Developments", phone: "+201234567890" },
    property_type: { name: "Apartment", category: "Residential" }
  },
  {
    id: 2,
    unit_number: "B-205",
    unit_area: 95,
    number_of_bedrooms: 2,
    number_of_bathrooms: 1,
    price_in_egp: 1800000,
    price_per_meter: 18947,
    currency: "EGP",
    finishing: "Semi Finished",
    is_launch: false,
    compound: { name: "Cairo Gate", location: "Sheikh Zayed" },
    area: { name: "Sheikh Zayed", city: "Giza" },
    developer: { name: "Emaar Misr", phone: "+201098765432" },
    property_type: { name: "Apartment", category: "Residential" }
  },
  {
    id: 3,
    unit_number: "C-301",
    unit_area: 140,
    number_of_bedrooms: 3,
    number_of_bathrooms: 2,
    price_in_egp: 3200000,
    price_per_meter: 22857,
    currency: "EGP",
    finishing: "Fully Finished",
    is_launch: false,
    compound: { name: "Eastown Residence", location: "New Cairo" },
    area: { name: "New Cairo", city: "Cairo" },
    developer: { name: "Sodic", phone: "+201555444333" },
    property_type: { name: "Apartment", category: "Residential" }
  },
  {
    id: 4,
    unit_number: "D-102",
    unit_area: 160,
    number_of_bedrooms: 3,
    number_of_bathrooms: 3,
    price_in_egp: 4500000,
    price_per_meter: 28125,
    currency: "EGP",
    finishing: "Super Lux",
    is_launch: true,
    compound: { name: "Swan Lake Residences", location: "New Administrative Capital" },
    area: { name: "New Administrative Capital", city: "Cairo" },
    developer: { name: "Hassan Allam Properties", phone: "+201222333444" },
    property_type: { name: "Apartment", category: "Residential" }
  },
  {
    id: 5,
    unit_number: "E-401",
    unit_area: 200,
    number_of_bedrooms: 4,
    number_of_bathrooms: 3,
    price_in_egp: 6000000,
    price_per_meter: 30000,
    currency: "EGP",
    finishing: "Fully Finished",
    is_launch: false,
    compound: { name: "Monorail City", location: "New Administrative Capital" },
    area: { name: "New Administrative Capital", city: "Cairo" },
    developer: { name: "Capital Group Properties", phone: "+201777888999" },
    property_type: { name: "Penthouse", category: "Residential" }
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get properties with filtering and pagination
export const getActiveProperties = async (
  page = 1,
  limit = 20,
  filters: PropertyFilter = {}
): Promise<PropertyResponse> => {
  try {
    console.log('Fetching properties via API...', { page, limit, filters });
    
    // Simulate API delay
    await delay(300);
    
    // Filter properties
    let filteredProperties = MOCK_PROPERTIES;
    
    if (filters.compound) {
      filteredProperties = filteredProperties.filter(p => 
        p.compound?.name.toLowerCase().includes(filters.compound!.toLowerCase())
      );
    }
    
    if (filters.area) {
      filteredProperties = filteredProperties.filter(p => 
        p.area?.name.toLowerCase().includes(filters.area!.toLowerCase())
      );
    }
    
    if (filters.bedrooms) {
      filteredProperties = filteredProperties.filter(p => 
        p.number_of_bedrooms === filters.bedrooms
      );
    }
    
    if (filters.min_price) {
      filteredProperties = filteredProperties.filter(p => 
        (p.price_in_egp || 0) >= filters.min_price!
      );
    }
    
    if (filters.max_price) {
      filteredProperties = filteredProperties.filter(p => 
        (p.price_in_egp || 0) <= filters.max_price!
      );
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProperties = filteredProperties.filter(p => 
        p.compound?.name.toLowerCase().includes(searchTerm) ||
        p.area?.name.toLowerCase().includes(searchTerm) ||
        p.developer?.name.toLowerCase().includes(searchTerm) ||
        p.unit_number?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const totalCount = filteredProperties.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);
    
    console.log(`API returned ${paginatedProperties.length} properties (${totalCount} total)`);
    
    return {
      properties: paginatedProperties,
      totalCount,
      totalPages,
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return {
      properties: [],
      totalCount: 0,
      totalPages: 0,
      error: 'Failed to fetch properties from API'
    };
  }
};

// Get filter options
export const getFilterOptions = async () => {
  try {
    await delay(200);
    
    const compounds = [...new Set(MOCK_PROPERTIES.map(p => p.compound?.name).filter(Boolean))].sort();
    const areas = [...new Set(MOCK_PROPERTIES.map(p => p.area?.name).filter(Boolean))].sort();
    const developers = [...new Set(MOCK_PROPERTIES.map(p => p.developer?.name).filter(Boolean))].sort();
    const propertyTypes = [...new Set(MOCK_PROPERTIES.map(p => p.property_type?.name).filter(Boolean))].sort();
    const bedroomOptions = [...new Set(MOCK_PROPERTIES.map(p => p.number_of_bedrooms).filter(n => n !== null && n !== undefined))].sort((a, b) => a - b);
    
    return {
      compounds,
      areas,
      developers,
      propertyTypes,
      finishings: ['Semi Finished', 'Fully Finished', 'Super Lux'],
      bedroomOptions,
      bathroomOptions: [1, 2, 3, 4],
      error: null,
    };
  } catch (error) {
    console.error('Filter options error:', error);
    return {
      compounds: [],
      areas: [],
      developers: [],
      propertyTypes: [],
      finishings: [],
      bedroomOptions: [],
      bathroomOptions: [],
      error: 'Failed to load filter options'
    };
  }
};

// Get featured properties
export const getFeaturedProperties = async (limit = 10): Promise<PropertyResponse> => {
  try {
    await delay(200);
    
    const featuredProperties = MOCK_PROPERTIES.filter(p => p.is_launch).slice(0, limit);
    
    return {
      properties: featuredProperties,
      totalCount: featuredProperties.length,
      totalPages: 1
    };
  } catch (error) {
    console.error('Featured properties error:', error);
    return {
      properties: [],
      totalCount: 0,
      totalPages: 0,
      error: 'Failed to fetch featured properties'
    };
  }
};

// Get property by ID
export const getPropertyById = async (id: number): Promise<{ property?: Property; error?: string }> => {
  try {
    await delay(100);
    
    const property = MOCK_PROPERTIES.find(p => p.id === id);
    
    if (property) {
      return { property };
    } else {
      return { error: 'Property not found' };
    }
  } catch (error) {
    console.error('Get property by ID error:', error);
    return { error: 'Failed to fetch property' };
  }
};

// Search properties
export const searchProperties = async (
  searchTerm: string,
  limit = 20
): Promise<PropertyResponse> => {
  return getActiveProperties(1, limit, { search: searchTerm });
};












