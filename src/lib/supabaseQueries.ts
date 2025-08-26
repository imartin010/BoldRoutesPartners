import { supabase } from './supabase';

export interface Property {
  id: number;
  nawy_id: number;
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
  down_payment_value?: number;
  down_payment_percent?: number;
  monthly_installment?: number;
  payment_years?: number;
}

export interface PropertyFilter {
  developer?: string;
  compound?: string;
  area?: string;
  property_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  min_price?: number;
  max_price?: number;
  finishing?: string;
  ready_by_year?: number;
  search?: string;
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
      console.log('Parsed JSON field:', field, '->', parsed);
      return parsed;
    } catch (e) {
      console.log('JSON parse failed for:', field, 'Error:', e);
      // If JSON parsing fails, try to extract name manually
      const nameMatch = field.match(/'name':\s*'([^']+)'/);
      if (nameMatch) {
        const result = { name: nameMatch[1].trim() };
        console.log('Extracted name manually:', result);
        return result;
      }
      return null;
    }
  }
  return null;
}

// Helper function to process property data
function processPropertyData(rawProperties: any[]): Property[] {
  return rawProperties.map(prop => {
    // Debug: log first property to see structure
    if (prop.nawy_id === rawProperties[0]?.nawy_id) {
      console.log('=== RAW PROPERTY DATA ===');
      console.log('Payment Plans (raw):', prop.payment_plans);
      console.log('Down Payment Value:', prop.down_payment_value);
      console.log('Monthly Installment:', prop.monthly_installment);
      console.log('Payment Years:', prop.payment_years);
    }
    
    // Extract payment info from database fields or payment_plans JSONB
    let downPaymentValue = prop.down_payment_value;
    let downPaymentPercent = prop.down_payment_percent;
    let monthlyInstallment = prop.monthly_installment;
    let paymentYears = prop.payment_years;

    // If payment fields are null but payment_plans exists, extract from JSONB
    if (!downPaymentValue && prop.payment_plans && Array.isArray(prop.payment_plans) && prop.payment_plans.length > 0) {
      const firstPlan = prop.payment_plans[0];
      downPaymentValue = firstPlan.down_payment_value;
      downPaymentPercent = firstPlan.down_payment;
      monthlyInstallment = firstPlan.equal_installments_value;
      paymentYears = firstPlan.years;
    }
    
    return {
      ...prop,
      compound: parseJsonField(prop.compound),
      area: parseJsonField(prop.area),
      developer: parseJsonField(prop.developer),
      property_type: parseJsonField(prop.property_type),
      // Override with extracted payment data
      down_payment_value: downPaymentValue,
      down_payment_percent: downPaymentPercent,
      monthly_installment: monthlyInstallment,
      payment_years: paymentYears,
    };
  });
}

export async function getActiveProperties(
  page: number = 1,
  pageSize: number = 20,
  filters: PropertyFilter = {}
) {
  try {
    console.log('Fetching properties with filters:', filters);
    
    let query = supabase
      .from('nawy_properties')
      .select(`
        id, nawy_id, unit_id, unit_number, unit_area,
        number_of_bedrooms, number_of_bathrooms, price_per_meter, price_in_egp,
        currency, finishing, is_launch, image,
        compound, area, developer, property_type,
        payment_plans, down_payment_value, down_payment_percent, 
        monthly_installment, payment_years
      `, { count: 'exact' });

    // Apply filters
    if (filters.developer) {
      query = query.ilike('developer->>name', `%${filters.developer}%`);
    }
    
    if (filters.compound) {
      query = query.ilike('compound->>name', `%${filters.compound}%`);
    }
    
    if (filters.area) {
      query = query.ilike('area->>name', `%${filters.area}%`);
    }
    
    if (filters.property_type) {
      query = query.ilike('property_type->>name', `%${filters.property_type}%`);
    }
    
    if (filters.bedrooms) {
      query = query.eq('number_of_bedrooms', filters.bedrooms);
    }
    
    if (filters.bathrooms) {
      query = query.eq('number_of_bathrooms', filters.bathrooms);
    }
    
    if (filters.min_area) {
      query = query.gte('unit_area', filters.min_area);
    }
    
    if (filters.max_area) {
      query = query.lte('unit_area', filters.max_area);
    }
    
    if (filters.min_price) {
      query = query.gte('price_in_egp', filters.min_price);
    }
    
    if (filters.max_price) {
      query = query.lte('price_in_egp', filters.max_price);
    }
    
    if (filters.finishing) {
      query = query.ilike('finishing', `%${filters.finishing}%`);
    }
    
    if (filters.ready_by_year) {
      query = query.gte('ready_by', `${filters.ready_by_year}-01-01`);
      query = query.lt('ready_by', `${filters.ready_by_year + 1}-01-01`);
    }
    
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      query = query.or(`compound->>name.ilike.%${searchTerm}%,area->>name.ilike.%${searchTerm}%,developer->>name.ilike.%${searchTerm}%,unit_id.ilike.%${searchTerm}%,unit_number.ilike.%${searchTerm}%`);
    }

    // Add pagination
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    // Order by price (ascending, so cheapest first)
    query = query.order('price_in_egp', { ascending: true, nullsFirst: false });

    const { data, error, count } = await query;

    console.log('Query result:', { data: data?.length || 0, error, count });
    
    if (error) {
      console.error('Database query error:', error);
      return {
        properties: [],
        totalCount: 0,
        totalPages: 0,
        error: error.message || 'Database query failed'
      };
    }



    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    // Process the data to parse JSON fields
    const processedProperties = processPropertyData(data || []);

    return {
      properties: processedProperties,
      totalCount: count || 0,
      totalPages,
      error: null
    };
  } catch (err) {
    console.error('Fetch properties error:', err);
    return { 
      properties: [], 
      totalCount: 0, 
      totalPages: 0, 
      error: err 
    };
  }
}

export async function getFilterOptions() {
  try {
    console.log('Fetching filter options...');
    
    // Get unique compounds
    const { data: compoundData } = await supabase
      .from('nawy_properties')
      .select('compound')
      .not('compound', 'is', null)
      .limit(1000);

    // Get unique areas
    const { data: areaData } = await supabase
      .from('nawy_properties')
      .select('area')
      .not('area', 'is', null)
      .limit(1000);

    // Get unique developers
    const { data: developerData } = await supabase
      .from('nawy_properties')
      .select('developer')
      .not('developer', 'is', null)
      .limit(1000);

    // Get unique property types
    const { data: propertyTypeData } = await supabase
      .from('nawy_properties')
      .select('property_type')
      .not('property_type', 'is', null)
      .limit(1000);

    // Get unique bedroom counts
    const { data: bedroomData } = await supabase
      .from('nawy_properties')
      .select('number_of_bedrooms')
      .not('number_of_bedrooms', 'is', null)
      .order('number_of_bedrooms', { ascending: true });

    // Get unique bathroom counts
    const { data: bathroomData } = await supabase
      .from('nawy_properties')
      .select('number_of_bathrooms')
      .not('number_of_bathrooms', 'is', null)
      .order('number_of_bathrooms', { ascending: true });

    // Get unique finishing types
    const { data: finishingData } = await supabase
      .from('nawy_properties')
      .select('finishing')
      .not('finishing', 'is', null);

    // Get unique ready by years
    const { data: readyByData } = await supabase
      .from('nawy_properties')
      .select('ready_by')
      .not('ready_by', 'is', null);

    // Process the data to extract unique values with proper JSON parsing
    const compounds = [...new Set(
      compoundData?.map(item => {
        const parsed = parseJsonField(item.compound);
        return parsed?.name;
      }).filter(Boolean) || []
    )].sort();

    const areas = [...new Set(
      areaData?.map(item => {
        const parsed = parseJsonField(item.area);
        return parsed?.name;
      }).filter(Boolean) || []
    )].sort();

    const developers = [...new Set(
      developerData?.map(item => {
        const parsed = parseJsonField(item.developer);
        return parsed?.name;
      }).filter(Boolean) || []
    )].sort();

    const propertyTypes = [...new Set(
      propertyTypeData?.map(item => {
        const parsed = parseJsonField(item.property_type);
        return parsed?.name;
      }).filter(Boolean) || []
    )].sort();

    const bedroomOptions = [...new Set(
      bedroomData?.map(item => item.number_of_bedrooms).filter(num => num !== null) || []
    )].sort((a, b) => a - b);

    const bathroomOptions = [...new Set(
      bathroomData?.map(item => item.number_of_bathrooms).filter(num => num !== null) || []
    )].sort((a, b) => a - b);

    const finishingOptions = [...new Set(
      finishingData?.map(item => item.finishing).filter(Boolean) || []
    )].sort();

    const readyByYearOptions = [...new Set(
      readyByData?.map(item => {
        if (item.ready_by) {
          const year = new Date(item.ready_by).getFullYear();
          return year;
        }
        return null;
      }).filter((year): year is number => year !== null && year > 2020 && year < 2040) || []
    )].sort((a, b) => a - b);

    return {
      compounds,
      areas,
      developers,
      propertyTypes,
      bedroomOptions,
      bathroomOptions,
      finishingOptions,
      readyByYearOptions,
      error: null
    };
  } catch (err) {
    console.error('Filter options error:', err);
    return {
      compounds: [],
      areas: [],
      developers: [],
      propertyTypes: [],
      bedroomOptions: [],
      bathroomOptions: [],
      finishingOptions: [],
      readyByYearOptions: [],
      error: err
    };
  }
}
