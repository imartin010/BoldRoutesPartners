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
   // Delivery date
   ready_by?: string;
}

export interface PropertyFilter {
  developer?: string;
  compound?: string;
  area?: string;
  property_type?: string;
  areas?: string[];
  property_category?: 'residential' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  min_area?: number;
  max_area?: number;
  min_price?: number;
  max_price?: number;
     finishing?: string;
   search?: string;
   ready_by_year?: string;
}

// Helper function to extract name from any field format
function extractNameFromField(field: any): string | null {
  if (!field) return null;
  
  // If it's already an object with a name property, return it
  if (typeof field === 'object' && field.name) {
    return field.name;
  }
  
  // If it's a string, try to parse it
  if (typeof field === 'string') {
    // Handle the exact format from your CSV: {'id': 15, 'name': 'Mountain View'}
    try {
      // First, try to convert Python dict format to valid JSON
      let cleanField = field.trim();
      
      // Replace Python None with null
      cleanField = cleanField.replace(/None/g, 'null');
      
      // Replace single quotes with double quotes for JSON parsing
      cleanField = cleanField.replace(/'/g, '"');
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleanField);
      if (parsed && parsed.name) {
        console.log(`Successfully parsed: "${field}" -> "${parsed.name}"`);
        return parsed.name;
      }
    } catch (e) {
      console.log(`JSON parsing failed for: "${field}", trying regex...`);
    }
    
    // Try multiple regex patterns to extract the name
    let nameMatch = null;
    
    // Pattern 1: 'name': 'value' (most common in your data)
    nameMatch = field.match(/'name':\s*'([^']+)'/);
    if (nameMatch) {
      console.log(`Regex pattern 1 matched: "${field}" -> "${nameMatch[1]}"`);
      return nameMatch[1].trim();
    }
    
    // Pattern 2: "name": "value"
    nameMatch = field.match(/"name":\s*"([^"]+)"/);
    if (nameMatch) {
      console.log(`Regex pattern 2 matched: "${field}" -> "${nameMatch[1]}"`);
      return nameMatch[1].trim();
    }
    
    // Pattern 3: name: 'value' (without quotes around name)
    nameMatch = field.match(/name:\s*'([^']+)'/);
    if (nameMatch) {
      console.log(`Regex pattern 3 matched: "${field}" -> "${nameMatch[1]}"`);
      return nameMatch[1].trim();
    }
    
    // Pattern 4: name: "value" (without quotes around name)
    nameMatch = field.match(/name:\s*"([^"]+)"/);
    if (nameMatch) {
      console.log(`Regex pattern 4 matched: "${field}" -> "${nameMatch[1]}"`);
      return nameMatch[1].trim();
    }
    
    // Pattern 5: Just extract any text that looks like a name between quotes
    nameMatch = field.match(/['"]([^'"]{2,100})['"]/);
    if (nameMatch && !nameMatch[1].includes('id')) {
      console.log(`Regex pattern 5 matched: "${field}" -> "${nameMatch[1]}"`);
      return nameMatch[1].trim();
    }
    
    // Pattern 6: If it's just a plain string, use it as is
    if (field.length > 2 && field.length < 100 && !field.includes('{') && !field.includes('[')) {
      console.log(`Using plain string: "${field}"`);
      return field.trim();
    }
    
    console.log(`No pattern matched for: "${field}"`);
  }
  
  return null;
}

// Helper function to safely parse JSON fields
function parseJsonField(field: any) {
  if (!field) return null;
  
  // If it's already an object with a name property, return it
  if (typeof field === 'object' && field.name) {
    return field;
  }
  
  // If it's a string, try to parse it
  if (typeof field === 'string') {
    try {
      // First, try to convert Python dict format to valid JSON
      let cleanField = field;
      
      // Replace Python None with null
      cleanField = cleanField.replace(/None/g, 'null');
      
      // Replace single quotes with double quotes for JSON parsing
      cleanField = cleanField.replace(/'/g, '"');
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleanField);
      console.log('Successfully parsed JSON field:', field, '->', parsed);
      return parsed;
    } catch (e) {
      console.log('JSON parse failed for:', field, 'Error:', e);
      
      // Try multiple regex patterns to extract the name
      let nameMatch = null;
      
      // Pattern 1: 'name': 'value'
      nameMatch = field.match(/'name':\s*'([^']+)'/);
      if (nameMatch) {
        const result = { name: nameMatch[1].trim() };
        console.log('Extracted name with pattern 1:', result);
        return result;
      }
      
      // Pattern 2: "name": "value"
      nameMatch = field.match(/"name":\s*"([^"]+)"/);
      if (nameMatch) {
        const result = { name: nameMatch[1].trim() };
        console.log('Extracted name with pattern 2:', result);
        return result;
      }
      
      // Pattern 3: name: 'value' (without quotes around name)
      nameMatch = field.match(/name:\s*'([^']+)'/);
      if (nameMatch) {
        const result = { name: nameMatch[1].trim() };
        console.log('Extracted name with pattern 3:', result);
        return result;
      }
      
      // Pattern 4: name: "value" (without quotes around name)
      nameMatch = field.match(/name:\s*"([^"]+)"/);
      if (nameMatch) {
        const result = { name: nameMatch[1].trim() };
        console.log('Extracted name with pattern 4:', result);
        return result;
      }
      
      // Pattern 5: Just extract any text that looks like a name
      nameMatch = field.match(/['"]([^'"]{2,50})['"]/);
      if (nameMatch) {
        const result = { name: nameMatch[1].trim() };
        console.log('Extracted name with pattern 5 (fallback):', result);
        return result;
      }
      
      console.log('Could not extract name from field:', field);
      return null;
    }
  }
  
  console.log('Field is not a string or object with name:', field);
  return null;
}

// Helper function to process property data
function processPropertyData(rawProperties: any[]): Property[] {
  return rawProperties.map(prop => {
    // Debug: log first property to see structure
    if (prop.id === rawProperties[0]?.id) {
      console.log('=== RAW PROPERTY DATA ===');
      console.log('Payment Plans (raw):', prop.payment_plans);
      console.log('Payment Plans type:', typeof prop.payment_plans);
      console.log('Payment Plans is array:', Array.isArray(prop.payment_plans));
    }
    
    // Extract payment info from payment_plans JSONB
    let paymentData = {
      downPayment: null,
      monthlyPayment: null,
      years: null
    };
    
    // Debug: log the raw payment_plans data
    if (prop.id <= 3) { // Only log first few for debugging
      console.log(`Property ${prop.id} payment_plans:`, prop.payment_plans);
      console.log(`Property ${prop.id} payment_plans type:`, typeof prop.payment_plans);
      console.log(`Property ${prop.id} payment_plans is array:`, Array.isArray(prop.payment_plans));
      console.log(`Property ${prop.id} payment_plans length:`, prop.payment_plans ? prop.payment_plans.length : 'N/A');
    }
    
    if (prop.payment_plans && Array.isArray(prop.payment_plans) && prop.payment_plans.length > 0) {
      const firstPlan = prop.payment_plans[0];
      
      if (prop.id <= 3) { // Only log first few for debugging
        console.log(`Property ${prop.id} first payment plan:`, firstPlan);
        console.log(`Property ${prop.id} first plan keys:`, Object.keys(firstPlan));
      }
      
      // Extract payment data using the exact field names from your data
      paymentData = {
        downPayment: firstPlan.down_payment_value || firstPlan.down_payment,
        monthlyPayment: firstPlan.equal_installments_value || firstPlan.equal_installments,
        years: firstPlan.years
      };
    } else if (prop.payment_plans && typeof prop.payment_plans === 'string') {
      // Handle case where payment_plans is a Python-style string
      try {
        // First, try to convert Python dict format to valid JSON
        let cleanString = prop.payment_plans;
        
        // Replace Python None with null
        cleanString = cleanString.replace(/None/g, 'null');
        
        // Replace single quotes with double quotes for JSON parsing
        cleanString = cleanString.replace(/'/g, '"');
        
        // Handle the specific case where we have a list with dict
        if (cleanString.startsWith('[{') && cleanString.endsWith('}]')) {
          const parsed = JSON.parse(cleanString);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstPlan = parsed[0];
            paymentData = {
              downPayment: firstPlan.down_payment_value || firstPlan.down_payment,
              monthlyPayment: firstPlan.equal_installments_value || firstPlan.equal_installments,
              years: firstPlan.years
            };
          }
        }
      } catch (e) {
        console.log(`Property ${prop.id} failed to parse payment_plans string:`, e);
        console.log(`Original string:`, prop.payment_plans);
      }
    }
    
    if (prop.id <= 3) { // Only log first few for debugging
      console.log(`Property ${prop.id} extracted payment data:`, paymentData);
    }
    
    // Parse JSON fields and add debugging
    const parsedCompound = parseJsonField(prop.compound);
    const parsedArea = parseJsonField(prop.area);
    const parsedDeveloper = parseJsonField(prop.developer);
    const parsedPropertyType = parseJsonField(prop.property_type);
    
    // Debug first few properties to see what's happening
    if (prop.id <= 3) {
      console.log(`Property ${prop.id} JSON parsing debug:`, {
        rawCompound: prop.compound,
        parsedCompound,
        rawDeveloper: prop.developer,
        parsedDeveloper,
        rawArea: prop.area,
        parsedArea,
        rawPropertyType: prop.property_type,
        parsedPropertyType
      });
    }
    
    return {
      ...prop,
      compound: parsedCompound,
      area: parsedArea,
      developer: parsedDeveloper,
      property_type: parsedPropertyType,
      // Add payment data to the property object
      paymentData
    };
  });
}

export async function getActiveProperties(
  page: number = 1,
  pageSize: number = 20,
  filters: PropertyFilter = {}
) {
  try {
    console.log('=== FUNCTION STARTED ===');
    console.log('Fetching properties with filters:', filters);
    
         let query = supabase
       .from('brdata_properties')
       .select(`
         id, unit_id, unit_number, unit_area,
         number_of_bedrooms, number_of_bathrooms, price_per_meter, price_in_egp,
         currency, finishing, is_launch, image,
         compound, area, developer, property_type,
         payment_plans, ready_by
       `, { count: 'exact' });

    // Apply numeric filters (these work server-side)
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
       // Filter by year - ready_by is a timestamp column
       if (filters.ready_by_year === 'Ready') {
         // For "Ready" properties, we'll handle this in client-side filtering
         // since we can't easily query for "Ready" in timestamp
       } else {
         // Filter by year range using date boundaries
         const year = parseInt(filters.ready_by_year);
         const startDate = `${year}-01-01T00:00:00`;
         const endDate = `${year + 1}-01-01T00:00:00`;
         
         query = query.gte('ready_by', startDate)
           .lt('ready_by', endDate);
       }
     }

         // Check if we need to fetch more data for client-side filtering
     const hasTextFilters = Boolean(
       (filters.developer && filters.developer.trim()) ||
       (filters.compound && filters.compound.trim()) ||
       (filters.area && filters.area.trim()) ||
       (filters.property_type && filters.property_type.trim()) ||
       (filters.search && filters.search.trim()) ||
       (filters.ready_by_year && filters.ready_by_year.trim())
     );

    console.log('=== PAGINATION STRATEGY DEBUG ===');
    console.log('Has text filters:', hasTextFilters);
    console.log('Page:', page, 'PageSize:', pageSize);

    // Fetch ALL properties - no limit to ensure we get everything
    // This ensures we can search through the complete dataset
    console.log('Fetching ALL properties with no row limit...');

    // Order by id descending to get newest first, then we'll sort client-side
    query = query.order('id', { ascending: false });

    const { data, error, count } = await query;
    
    // Also get the actual total count from the database to verify
    const { count: actualCount } = await supabase
      .from('brdata_properties')
      .select('*', { count: 'exact', head: true });
    
    console.log('=== DATABASE COUNT VERIFICATION ===');
    console.log('Query count:', count);
    console.log('Actual database count:', actualCount);
    console.log('Count difference:', (actualCount || 0) - (count || 0));

    console.log('Query result:', { data: data?.length || 0, error, count });
    console.log('=== COUNT DEBUG ===');
    console.log('Server count:', count);
    console.log('Data length:', data?.length || 0);
    console.log('Count vs Data length difference:', (count || 0) - (data?.length || 0));
    console.log('Expected total properties: ~23,000');
    console.log('Range requested: 0 to 24,999');
    console.log('Actual data fetched:', data?.length || 0);
    
    if (error) {
      console.error('Database query error:', error);
      return {
        properties: [],
        totalCount: 0,
        totalPages: 0,
        error: error.message || 'Database query failed'
      };
    }

    // Process the data to parse JSON fields
    const processedProperties = processPropertyData(data || []);

    // Apply client-side text filtering (if any)
    const toLower = (v: any) => (typeof v === 'string' ? v.toLowerCase() : String(v || '').toLowerCase());
    const includes = (hay: string, needle: string) => hay.includes(needle.trim().toLowerCase());
    const getName = (obj: any) => (obj && typeof obj === 'object' ? (obj as any).name : obj);

    // Debug: log filter values and first few processed properties
    console.log('=== FILTER DEBUG ===');
    console.log('Active filters:', filters);
    console.log('First 3 processed properties:', processedProperties.slice(0, 3).map(p => ({
      id: p.id,
      developer: p.developer,
      compound: p.compound,
      area: p.area,
      property_type: p.property_type
    })));
    
    // Debug: show sample of what we're searching through
    if (processedProperties.length > 0) {
      console.log('=== SEARCH DATA SAMPLE ===');
      processedProperties.slice(0, 5).forEach((p, i) => {
        console.log(`Sample ${i + 1}:`, {
          id: p.id,
          compound: getName(p.compound),
          area: getName(p.area),
          developer: getName(p.developer),
          propertyType: getName(p.property_type),
          unitId: p.unit_id,
          unitNumber: p.unit_number
        });
      });
    }

    let filteredProperties = processedProperties;

    // Apply search FIRST to the full dataset before other filters
    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim().toLowerCase();
      console.log(`=== SEARCH FILTER APPLIED FIRST ===`);
      console.log(`Search term: "${s}"`);
      console.log(`Searching through FULL dataset: ${processedProperties.length} properties`);
      
      const beforeCount = processedProperties.length;
      
      // Enhanced search with better debugging
      filteredProperties = processedProperties.filter(p => {
        // Get all searchable text fields
        const compoundName = getName(p.compound) || '';
        const areaName = getName(p.area) || '';
        const developerName = getName(p.developer) || '';
        const propertyTypeName = getName(p.property_type) || '';
        const unitId = p.unit_id || '';
        const unitNumber = p.unit_number || '';
        
        // Convert all to lowercase for comparison
        const compoundLower = compoundName.toLowerCase();
        const areaLower = areaName.toLowerCase();
        const developerLower = developerName.toLowerCase();
        const propertyTypeLower = propertyTypeName.toLowerCase();
        const unitIdLower = unitId.toLowerCase();
        const unitNumberLower = unitNumber.toLowerCase();
        
        // Check if any field contains the search term
        const matches = (
          compoundLower.includes(s) ||
          areaLower.includes(s) ||
          developerLower.includes(s) ||
          propertyTypeLower.includes(s) ||
          unitIdLower.includes(s) ||
          unitNumberLower.includes(s)
        );
        
        // Debug first few properties to see what's happening
        if (p.id <= 5) {
          console.log(`Property ${p.id} search debug:`, {
            compound: compoundName,
            area: areaName,
            developer: developerName,
            propertyType: propertyTypeName,
            unitId: unitId,
            unitNumber: unitNumber,
            searchTerm: s,
            matches: matches
          });
        }
        
        return matches;
      });
      
      console.log(`Search filter: ${beforeCount} -> ${filteredProperties.length} properties`);
      
      // Enhanced debugging: show ALL properties that matched the search
      console.log('=== ALL PROPERTIES THAT MATCHED SEARCH ===');
      if (filteredProperties.length <= 50) {
        // If 50 or fewer results, show all
        filteredProperties.forEach((p, i) => {
          console.log(`Match ${i + 1}: ID=${p.id}, Compound="${getName(p.compound)}", Area="${getName(p.area)}", Developer="${getName(p.developer)}"`);
        });
      } else {
        // If more than 50, show first 20 and last 20
        console.log('First 20 matches:');
        filteredProperties.slice(0, 20).forEach((p, i) => {
          console.log(`Match ${i + 1}: ID=${p.id}, Compound="${getName(p.compound)}", Area="${getName(p.area)}", Developer="${getName(p.developer)}"`);
        });
        console.log(`... and ${filteredProperties.length - 40} more matches ...`);
        console.log('Last 20 matches:');
        filteredProperties.slice(-20).forEach((p, i) => {
          const actualIndex = filteredProperties.length - 20 + i;
          console.log(`Match ${actualIndex + 1}: ID=${p.id}, Compound="${getName(p.compound)}", Area="${getName(p.area)}", Developer="${getName(p.developer)}"`);
        });
      }
      
      // Also check for specific projects you mentioned
      const alivaMatches = processedProperties.filter(p => {
        const compoundName = getName(p.compound) || '';
        const areaName = getName(p.area) || '';
        const developerName = getName(p.developer) || '';
        return (
          compoundName.toLowerCase().includes('aliva') ||
          areaName.toLowerCase().includes('aliva') ||
          developerName.toLowerCase().includes('aliva')
        );
      });
      
      const madientMatches = processedProperties.filter(p => {
        const compoundName = getName(p.compound) || '';
        const areaName = getName(p.area) || '';
        const developerName = getName(p.developer) || '';
        return (
          compoundName.toLowerCase().includes('madient') ||
          areaName.toLowerCase().includes('madient') ||
          developerName.toLowerCase().includes('madient')
        );
      });
      
      console.log(`=== SPECIFIC PROJECT SEARCH ===`);
      console.log(`Aliva projects found: ${alivaMatches.length}`);
      if (alivaMatches.length > 0) {
        alivaMatches.slice(0, 10).forEach((p, i) => {
          console.log(`Aliva ${i + 1}: ID=${p.id}, Compound="${getName(p.compound)}", Area="${getName(p.area)}", Developer="${getName(p.developer)}"`);
        });
      }
      
      console.log(`Madient Masr projects found: ${madientMatches.length}`);
      if (madientMatches.length > 0) {
        madientMatches.slice(0, 10).forEach((p, i) => {
          console.log(`Madient ${i + 1}: ID=${p.id}, Compound="${getName(p.compound)}", Area="${getName(p.area)}", Developer="${getName(p.developer)}"`);
        });
      }
    }

    // Now apply other filters to the search results (if any) or full dataset
    if (filters.developer) {
      const devFilter = filters.developer.trim().toLowerCase();
      console.log(`=== DEVELOPER FILTER DEBUG ===`);
      console.log(`Developer filter value: "${devFilter}"`);
      console.log(`Total properties before filter: ${filteredProperties.length}`);
      
      const beforeCount = filteredProperties.length;
      filteredProperties = filteredProperties.filter(p => {
        const devName = getName(p.developer);
        const devLower = toLower(devName);
        const matches = devLower.includes(devFilter);
        
        // Debug first few properties
        if (p.id <= 3) {
          console.log(`Property ${p.id} developer filter debug:`, {
            rawDeveloper: p.developer,
            devName,
            devLower,
            devFilter,
            matches
          });
        }
        
        return matches;
      });
      console.log(`Developer filter: ${beforeCount} -> ${filteredProperties.length} properties`);
    }
    
    if (filters.compound) {
      const compFilter = filters.compound.trim().toLowerCase();
      console.log(`=== COMPOUND FILTER DEBUG ===`);
      console.log(`Compound filter value: "${compFilter}"`);
      console.log(`Total properties before filter: ${filteredProperties.length}`);
      
      const beforeCount = filteredProperties.length;
      filteredProperties = filteredProperties.filter(p => {
        const compName = getName(p.compound);
        const compLower = toLower(compName);
        const matches = compLower.includes(compFilter);
        
        // Debug first few properties
        if (p.id <= 3) {
          console.log(`Property ${p.id} compound filter debug:`, {
            rawCompound: p.compound,
            compName,
            compLower,
            compFilter,
            matches
          });
        }
        
        return matches;
      });
      console.log(`Compound filter: ${beforeCount} -> ${filteredProperties.length} properties`);
    }
    
    if (filters.area) {
      const areaFilter = filters.area.trim().toLowerCase();
      console.log(`Filtering by area: "${areaFilter}"`);
      const beforeCount = filteredProperties.length;
      filteredProperties = filteredProperties.filter(p => {
        const areaName = getName(p.area);
        const areaLower = toLower(areaName);
        const matches = areaLower.includes(areaFilter);
        if (p.id <= 3) { // Debug first few
          console.log(`Property ${p.id} area: "${areaName}" -> "${areaLower}" matches "${areaFilter}": ${matches}`);
        }
        return matches;
      });
      console.log(`Area filter: ${beforeCount} -> ${filteredProperties.length} properties`);
    }
    
         if (filters.property_type) {
       const typeFilter = filters.property_type.trim().toLowerCase();
       console.log(`Filtering by property_type: "${typeFilter}"`);
       const beforeCount = filteredProperties.length;
       filteredProperties = filteredProperties.filter(p => {
         const typeName = getName(p.property_type);
         const typeLower = toLower(typeName);
         const matches = typeLower.includes(typeFilter);
         if (p.id <= 3) { // Debug first few
           console.log(`Property ${p.id} property_type: "${typeName}" -> "${typeLower}" matches "${typeFilter}": ${matches}`);
         }
         return matches;
       });
       console.log(`Property type filter: ${beforeCount} -> ${filteredProperties.length} properties`);
     }
     
     if (filters.ready_by_year) {
       const readyFilter = filters.ready_by_year.trim();
       console.log(`Filtering by ready_by_year: "${readyFilter}"`);
       const beforeCount = filteredProperties.length;
       const now = new Date(); // Define now variable here
       filteredProperties = filteredProperties.filter(p => {
         const readyBy = p.ready_by || '';
         // ready_by is a timestamp, so we need to extract the year
         if (readyFilter === 'Ready') {
           // For "Ready" properties, we'll need to determine what constitutes "Ready"
           // This could be properties with past dates or a specific flag
           const readyDate = new Date(readyBy);
           const matches = readyDate <= now; // Properties with past dates are "Ready"
           return matches;
         }
         
         // Extract year from timestamp
         const readyDate = new Date(readyBy);
         const year = readyDate.getFullYear().toString();
         const matches = year === readyFilter;
         if (p.id <= 3) { // Debug first few
           if (readyFilter === 'Ready') {
             console.log(`Property ${p.id} ready_by: "${readyBy}" -> date: ${readyDate} -> isReady: ${readyDate <= now} matches "${readyFilter}": ${matches}`);
           } else {
             console.log(`Property ${p.id} ready_by: "${readyBy}" -> date: ${readyDate} -> year: "${year}" matches "${readyFilter}": ${matches}`);
           }
         }
         return matches;
       });
       console.log(`Ready by year filter: ${beforeCount} -> ${filteredProperties.length} properties`);
     }

    // Custom sort: Mountain View first, keep others in original order (by id desc from query)
    const isMountainView = (name: string) => (name || '').toLowerCase().includes('mountain view');
    const getDevName = (p: any) => {
      const dev = p.developer;
      return typeof dev === 'string' ? dev : (dev && (dev as any).name) || '';
    };
    
    console.log('=== SORTING DEBUG ===');
    console.log('Before sorting - first 5 properties:');
    filteredProperties.slice(0, 5).forEach((p, i) => {
      const devName = getDevName(p);
      console.log(`Property ${i + 1}: ID=${p.id}, Developer="${devName}", IsMountainView=${isMountainView(devName)}`);
    });
    
    filteredProperties = filteredProperties.sort((a, b) => {
      const aDevName = getDevName(a);
      const bDevName = getDevName(b);
      const aIsMV = isMountainView(aDevName);
      const bIsMV = isMountainView(bDevName);
      
      if (aIsMV && !bIsMV) return -1; // a (Mountain View) comes first
      if (!aIsMV && bIsMV) return 1;  // b (Mountain View) comes first
      return 0; // Both same type, keep original order
    });
    
    console.log('After sorting - first 5 properties:');
    filteredProperties.slice(0, 5).forEach((p, i) => {
      const devName = getDevName(p);
      console.log(`Property ${i + 1}: ID=${p.id}, Developer="${devName}", IsMountainView=${isMountainView(devName)}`);
    });

    // Client-side pagination and counts
    // Use the server count for total display, but filtered count for pagination
    const totalCount = count || 0; // This should now be 23k+
    const clientTotalCount = filteredProperties.length;
    const clientTotalPages = Math.ceil(clientTotalCount / pageSize);
    
    // Log the count difference for debugging
    console.log('=== COUNT DEBUG ===');
    console.log('Server count:', totalCount);
    console.log('Filtered count:', clientTotalCount);
    console.log('Count difference:', totalCount - clientTotalCount);
    console.log('Expected total properties: ~23,000');
    
    // Apply pagination to filtered results
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageSlice = filteredProperties.slice(start, end);
    
    console.log('=== PAGINATION DEBUG ===');
    console.log('Total filtered properties:', filteredProperties.length);
    console.log('Page:', page, 'PageSize:', pageSize);
    console.log('Start:', start, 'End:', end);
    console.log('Page slice length:', pageSlice.length);
    console.log('Total pages:', clientTotalPages);
    
    // Debug: show what properties are in the current page
    console.log('=== CURRENT PAGE PROPERTIES ===');
    pageSlice.forEach((prop, i) => {
      const devName = typeof prop.developer === 'string' ? prop.developer : prop.developer?.name || 'Unknown';
      console.log(`Page ${page} Property ${i + 1}: ID=${prop.id}, Developer="${devName}"`);
    });
    
    // Debug: check if any properties have payment data
    const propertiesWithPayment = pageSlice.filter(prop => 
      prop.paymentData?.downPayment || prop.paymentData?.monthlyPayment || prop.paymentData?.years
    );
    console.log(`=== PAYMENT DATA SUMMARY ===`);
    console.log(`Properties with payment data: ${propertiesWithPayment.length}/${pageSlice.length}`);
    if (propertiesWithPayment.length > 0) {
      console.log('Sample payment data:', propertiesWithPayment[0].paymentData);
    }

    return {
      properties: pageSlice,
      totalCount: totalCount, // Use the real server count (23k+)
      totalPages: clientTotalPages,
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
    console.log('=== FETCHING FRESH FILTER OPTIONS FROM DATABASE ===');
    
    // Get ALL properties to extract unique values (no limit)
    const { data: allProperties, error } = await supabase
      .from('brdata_properties')
      .select('compound, area, developer, property_type, number_of_bedrooms, number_of_bathrooms, finishing, ready_by');
    
    if (error) {
      console.error('Error fetching properties for filter options:', error);
      throw error;
    }
    
    console.log(`Fetched ${allProperties?.length || 0} properties for filter options`);
    
    // Extract unique values directly from the data
    const compounds = new Set<string>();
    const areas = new Set<string>();
    const developers = new Set<string>();
    const propertyTypes = new Set<string>();
    const bedroomOptions = new Set<number>();
    const bathroomOptions = new Set<number>();
    const finishingOptions = new Set<string>();
    const readyByYearOptions = new Set<string>();
    
    // Process each property to extract filter options
    allProperties?.forEach((prop, index) => {
      // Debug first few records
      if (index < 5) {
        console.log(`=== SAMPLE RECORD ${index + 1} (ID: ${prop.id}) ===`);
        console.log('Raw compound:', typeof prop.compound, prop.compound);
        console.log('Raw developer:', typeof prop.developer, prop.developer);
        console.log('Raw area:', typeof prop.area, prop.area);
      }
      
      // Extract compound name
      if (prop.compound) {
        const compoundName = extractNameFromField(prop.compound);
        if (compoundName) {
          compounds.add(compoundName);
          if (index < 5) console.log('Extracted compound name:', compoundName);
        }
      }
      
      // Extract area name
      if (prop.area) {
        const areaName = extractNameFromField(prop.area);
        if (areaName) {
          areas.add(areaName);
          if (index < 5) console.log('Extracted area name:', areaName);
        }
      }
      
      // Extract developer name
      if (prop.developer) {
        const developerName = extractNameFromField(prop.developer);
        if (developerName) {
          developers.add(developerName);
          if (index < 5) console.log('Extracted developer name:', developerName);
        }
      }
      
      // Extract property type name
      if (prop.property_type) {
        const propertyTypeName = extractNameFromField(prop.property_type);
        if (propertyTypeName) propertyTypes.add(propertyTypeName);
      }
      
      // Extract numeric values
      if (prop.number_of_bedrooms !== null) bedroomOptions.add(prop.number_of_bedrooms);
      if (prop.number_of_bathrooms !== null) bathroomOptions.add(prop.number_of_bathrooms);
      
      // Extract finishing
      if (prop.finishing) finishingOptions.add(prop.finishing);
      
      // Extract ready_by year
      if (prop.ready_by) {
        try {
          const date = new Date(prop.ready_by);
          if (!isNaN(date.getTime())) {
            readyByYearOptions.add(date.getFullYear().toString());
          }
        } catch (e) {
          // If date parsing fails, try to extract year from string
          const yearMatch = String(prop.ready_by).match(/\b(20\d{2})\b/);
          if (yearMatch) {
            readyByYearOptions.add(yearMatch[1]);
          }
        }
      }
    });
    
    // Convert sets to sorted arrays
    const compoundsArray = Array.from(compounds).sort();
    const areasArray = Array.from(areas).sort();
    const developersArray = Array.from(developers).sort();
    const propertyTypesArray = Array.from(propertyTypes).sort();
    const bedroomOptionsArray = Array.from(bedroomOptions).sort((a, b) => a - b);
    const bathroomOptionsArray = Array.from(bathroomOptions).sort((a, b) => a - b);
    const finishingOptionsArray = Array.from(finishingOptions).sort();
    
    // Add "Ready" option and sort ready by years
    const readyByYearOptionsArray = ['Ready', ...Array.from(readyByYearOptions).sort()];
    
    // Build developer-compound relationships
    const developerCompounds: { [key: string]: string[] } = {};
    allProperties?.forEach(prop => {
      if (prop.developer && prop.compound) {
        const developerName = extractNameFromField(prop.developer);
        const compoundName = extractNameFromField(prop.compound);
        
        if (developerName && compoundName) {
          if (!developerCompounds[developerName]) {
            developerCompounds[developerName] = [];
          }
          if (!developerCompounds[developerName].includes(compoundName)) {
            developerCompounds[developerName].push(compoundName);
          }
        }
      }
    });
    
    // Sort compound lists for each developer
    Object.keys(developerCompounds).forEach(developer => {
      developerCompounds[developer].sort();
    });
    
    console.log('=== FILTER OPTIONS EXTRACTED ===');
    console.log('Compounds found:', compoundsArray.length);
    console.log('Sample compounds:', compoundsArray.slice(0, 10));
    console.log('Areas found:', areasArray.length);
    console.log('Sample areas:', areasArray.slice(0, 10));
    console.log('Developers found:', developersArray.length);
    console.log('Sample developers:', developersArray.slice(0, 10));
    console.log('Property Types found:', propertyTypesArray.length);
    console.log('Bedroom options:', bedroomOptionsArray);
    console.log('Bathroom options:', bathroomOptionsArray);
    console.log('Finishing options:', finishingOptionsArray);
    console.log('Ready by years:', readyByYearOptionsArray);
    console.log('Developer-Compound relationships:', Object.keys(developerCompounds).length);
    
    // Search for Mountain View specifically
    const mountainViewDevelopers = developersArray.filter(dev => 
      dev.toLowerCase().includes('mountain view')
    );
    const mountainViewCompounds = compoundsArray.filter(comp => 
      comp.toLowerCase().includes('mountain view') || 
      comp.toLowerCase().includes('aliva')
    );
    console.log('=== MOUNTAIN VIEW SEARCH ===');
    console.log('Mountain View developers found:', mountainViewDevelopers);
    console.log('Mountain View/Aliva compounds found:', mountainViewCompounds);
    
    return {
      compounds: compoundsArray,
      areas: areasArray,
      developers: developersArray,
      propertyTypes: propertyTypesArray,
      bedroomOptions: bedroomOptionsArray,
      bathroomOptions: bathroomOptionsArray,
      finishingOptions: finishingOptionsArray,
      readyByYearOptions: readyByYearOptionsArray,
      developerCompounds,
      error: null
    };



    console.log('=== FINAL FILTER OPTIONS ===');
    console.log('Compounds:', compounds);
    console.log('Developers:', developers);
    console.log('Areas:', areas);
    console.log('Property Types:', propertyTypes);
    console.log('Developer Compounds:', developerCompounds);
    
    return {
      compounds,
      areas,
      developers,
      propertyTypes,
      bedroomOptions,
      bathroomOptions,
      finishingOptions,
      readyByYearOptions,
      developerCompounds,
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
       developerCompounds: {},
       error: err
     };
  }
}
