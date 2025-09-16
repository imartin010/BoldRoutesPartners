import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Calendar,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Calculator,
  ArrowRight,
  Eye,
  Database,
  X
} from 'lucide-react';
import { getActiveProperties, getFilterOptions, type Property } from '../lib/supabaseQueries';
import { supabase } from '../lib/supabase';

// Commission data interface
interface CommissionRate {
  Developer: string;
  Compound: string;
  'BR Percentage': number;
}

// Project interface
interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  description: string;
  image: string;
  startingPrice: number;
  unitsAvailable: number;
  deliveryDate: string;
  commissionRate: number;
  features: string[];
  status: 'launching' | 'pre-launch' | 'sold-out';
  propertyTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  amenities: string[];
}

const Projects: React.FC = () => {
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryProperties, setInventoryProperties] = useState<Property[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Load commission rates
  useEffect(() => {
    const loadCommissionRates = async () => {
      try {
        const response = await fetch('/commissions_data.json');
        const text = await response.text();
        // Fix NaN values in JSON by replacing them with null
        const cleanedText = text.replace(/: NaN/g, ': null');
        const data = JSON.parse(cleanedText);
        // Filter out entries with null commission rates
        const validRates = data.filter((rate: CommissionRate) => 
          rate['BR Percentage'] !== null && !isNaN(rate['BR Percentage'])
        );
        setCommissionRates(validRates);
      } catch (error) {
        console.error('Error loading commission rates:', error);
      }
    };

    loadCommissionRates();
  }, []);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      
      // Load real inventory projects - fetch ALL properties without pagination
      try {
        console.log('=== FETCHING ALL INVENTORY PROPERTIES ===');
        console.log('Making direct Supabase call to bypass pagination limits...');
        
        // Direct Supabase call to get ALL properties for project grouping
        const { data: allProperties, error: directError, count } = await supabase
          .from('brdata_properties')
          .select(`
            id, unit_id, unit_number, unit_area,
            number_of_bedrooms, number_of_bathrooms, price_per_meter, price_in_egp,
            currency, finishing, is_launch, image,
            compound, area, developer, property_type,
            payment_plans, ready_by
          `, { count: 'exact' })
          .order('id', { ascending: false })
          .limit(20000); // Increased to 20k to get most of your inventory
        
        console.log('=== DIRECT SUPABASE RESULT ===');
        console.log('Total properties fetched:', allProperties?.length || 0);
        console.log('Database total count:', count);
        console.log('Error:', directError);
        
        if (!directError && allProperties && allProperties.length > 0) {
          // Process the raw data (parse JSON fields)
          const processedProperties = allProperties.map(prop => {
            // Simple JSON parsing for the project creation
            const parseField = (field: any) => {
              if (!field) return { name: 'Unknown' };
              if (typeof field === 'object' && field.name) return field;
              if (typeof field === 'string') {
                try {
                  let cleanField = field.replace(/None/g, 'null').replace(/'/g, '"');
                  const parsed = JSON.parse(cleanField);
                  return parsed && parsed.name ? parsed : { name: field };
                } catch {
                  const nameMatch = field.match(/'name':\s*'([^']+)'/);
                  return { name: nameMatch ? nameMatch[1] : field };
                }
              }
              return { name: String(field) };
            };
            
            return {
              ...prop,
              compound: parseField(prop.compound),
              area: parseField(prop.area),
              developer: parseField(prop.developer),
              property_type: parseField(prop.property_type)
            };
          });
          
          const realProjects = convertInventoryToProjects(processedProperties);
          console.log('=== PROJECT CONVERSION DEBUG ===');
          console.log('Raw properties processed:', processedProperties.length);
          console.log('Real projects created:', realProjects.length);
          console.log('Sample projects:', realProjects.slice(0, 5).map(p => ({
            name: p.name,
            units: p.unitsAvailable,
            developer: p.developer,
            location: p.location
          })));
          
          setProjects(realProjects);
          setFilteredProjects(realProjects);
        } else {
          console.error('Direct Supabase call failed:', directError);
          setProjects([]);
          setFilteredProjects([]);
        }
      } catch (error) {
        console.error('Error loading inventory projects:', error);
        setProjects([]);
        setFilteredProjects([]);
      }
      
      setLoading(false);
    };

    loadProjects();
  }, []);

  // Filter projects
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDeveloper) {
      filtered = filtered.filter(project => project.developer === selectedDeveloper);
    }

    if (selectedStatus) {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, selectedDeveloper, selectedStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'launching':
        return 'bg-blue-100 text-blue-800';
      case 'pre-launch':
        return 'bg-purple-100 text-purple-800';
      case 'sold-out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const developers = [...new Set(projects.map(p => p.developer))].sort();

  // Get unique projects from inventory (for modal compatibility)
  const getUniqueInventoryProjects = (properties: Property[]) => {
    return convertInventoryToProjects(properties).map(project => ({
      name: project.name,
      developer: project.developer,
      area: project.location,
      properties: [],
      minPrice: project.priceRange.min,
      maxPrice: project.priceRange.max,
      totalUnits: project.unitsAvailable,
      propertyTypes: project.propertyTypes
    }));
  };


  const loadInventoryProperties = async () => {
    setInventoryLoading(true);
    try {
      const result = await getActiveProperties(1, 100, {}); // Get first 100 properties
      if (!result.error) {
        setInventoryProperties(result.properties);
      }
    } catch (error) {
      console.error('Error loading inventory properties:', error);
    } finally {
      setInventoryLoading(false);
    }
  };



  // Format currency for inventory properties
  const formatInventoryPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M EGP`;
    }
    return `${(price / 1000).toFixed(0)}K EGP`;
  };

  // Convert inventory properties to project format
  const convertInventoryToProjects = (properties: Property[]): Project[] => {
    const projectMap = new Map<string, {
      compound: string;
      developer: string;
      area: string;
      properties: Property[];
      prices: number[];
      propertyTypes: Set<string>;
      readyByYears: Set<string>;
      totalUnits: number;
    }>();
    
    properties.forEach(property => {
      const compoundName = typeof property.compound === 'string' 
        ? property.compound 
        : property.compound?.name || 'Unknown';
      const developerName = typeof property.developer === 'string' 
        ? property.developer 
        : property.developer?.name || 'Unknown';
      const areaName = typeof property.area === 'string' 
        ? property.area 
        : property.area?.name || 'Unknown';
      const propertyType = typeof property.property_type === 'string' 
        ? property.property_type 
        : property.property_type?.name || 'Unknown';
      
      if (!projectMap.has(compoundName)) {
        projectMap.set(compoundName, {
          compound: compoundName,
          developer: developerName,
          area: areaName,
          properties: [],
          prices: [],
          propertyTypes: new Set<string>(),
          readyByYears: new Set<string>(),
          totalUnits: 0
        });
      }
      
      const project = projectMap.get(compoundName)!;
      project.properties.push(property);
      project.totalUnits++;
      
      if (property.price_in_egp) {
        project.prices.push(property.price_in_egp);
      }
      
      project.propertyTypes.add(propertyType);
      
      if (property.ready_by) {
        const year = property.ready_by.toLowerCase() === 'ready' 
          ? 'Ready' 
          : property.ready_by.match(/\b(20\d{2})\b/)?.[1] || property.ready_by;
        project.readyByYears.add(year);
      }
    });
    
    // Convert to Project format
    return Array.from(projectMap.values()).map((projectData, index) => {
      const prices = projectData.prices.sort((a: number, b: number) => a - b);
      const minPrice = prices[0] || 0;
      const maxPrice = prices[prices.length - 1] || 0;
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;
      
      // Determine commission rate based on developer (you can customize this logic)
      let commissionRate = 3.5; // default
      const dev = projectData.developer.toLowerCase();
      if (dev.includes('mountain view')) commissionRate = 4.5;
      else if (dev.includes('emaar')) commissionRate = 4.0;
      else if (dev.includes('sodic')) commissionRate = 4.2;
      else if (dev.includes('ora')) commissionRate = 3.0;
      else if (dev.includes('tatweer')) commissionRate = 4.0;
      else if (dev.includes('misr italia')) commissionRate = 4.5;
      
      // Determine status based on ready date
      const readyYears = Array.from(projectData.readyByYears);
      let status: 'launching' | 'pre-launch' | 'sold-out' = 'launching';
      if (readyYears.includes('Ready')) {
        status = 'launching';
      } else {
        const futureYears = readyYears.filter(year => {
          const yearNum = parseInt(year as string);
          return yearNum && yearNum > new Date().getFullYear();
        });
        if (futureYears.length > 0) {
          status = 'pre-launch';
        }
      }
      
      const propertyTypesArray = Array.from(projectData.propertyTypes);
      
      return {
        id: `inv-${index + 100}`,
        name: projectData.compound,
        developer: projectData.developer,
        location: projectData.area,
        description: `Premium residential project with ${projectData.totalUnits} available units. Multiple property types including ${propertyTypesArray.slice(0, 3).join(', ')}.`,
        image: '/api/placeholder/400/300',
        startingPrice: minPrice,
        unitsAvailable: projectData.totalUnits,
        deliveryDate: readyYears.length > 0 ? readyYears.join(', ') : 'TBD',
        commissionRate,
        features: propertyTypesArray.slice(0, 4),
        status,
        propertyTypes: propertyTypesArray,
        priceRange: { min: minPrice, max: maxPrice },
        amenities: ['Modern Design', 'Security', 'Parking', 'Green Spaces', 'Community Facilities']
      };
    }).filter(project => project.unitsAvailable >= 1); // Changed from 5 to 1 to include smaller projects
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Projects & New Launches</h1>
          <p className="text-gray-600 mt-1">Discover projects from our inventory and latest launches - calculate your commissions</p>
          {filteredProjects.length > 10 && (
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✨ Now showing {filteredProjects.length} total projects with {Math.floor(filteredProjects.reduce((sum, p) => sum + p.unitsAvailable, 0) / 1000)}k+ available units
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
        </div>
      </div>



      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedDeveloper}
            onChange={(e) => setSelectedDeveloper(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Developers</option>
            {developers.map(developer => (
              <option key={developer} value={developer}>{developer}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="launching">Launching</option>
            <option value="pre-launch">Pre-Launch</option>
            <option value="sold-out">Sold Out</option>
          </select>

          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Calculator className="h-4 w-4" />
            <span>Commission Calculator</span>
          </button>
        </div>
      </div>

      {/* Commission Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Commission Calculator</span>
              </h2>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <CommissionCalculator commissionRates={commissionRates} />
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              All Projects ({filteredProjects.length})
            </h2>
            <div className="text-sm text-gray-500">
              {filteredProjects.length} projects from inventory
              {filteredProjects.length > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  (📊 {Math.floor(filteredProjects.reduce((sum, p) => sum + p.unitsAvailable, 0) / 1000)}k+ units total)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredProjects.map((project) => {
          const isInventoryProject = project.id.startsWith('inv-');
          return (
          <div
            key={project.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
              viewMode === 'list' ? 'flex' : ''
            } ${isInventoryProject ? 'border-l-4 border-l-green-500' : ''}`}
          >
            {viewMode === 'grid' ? (
              <div>
                <div className="relative">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-4 left-4">
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      {isInventoryProject && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Inventory
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
                      {project.commissionRate}% commission
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-gray-600">{project.developer} • {project.location}</p>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{project.unitsAvailable} units</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Ready {project.deliveryDate}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        From {formatCurrency(project.startingPrice)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(project.priceRange.min)} - {formatCurrency(project.priceRange.max)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                      Calculate Commission
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-48 h-32 object-cover rounded-l-xl"
                />
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-gray-600">{project.developer} • {project.location}</p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      {isInventoryProject && (
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Inventory
                        </span>
                      )}
                      <span className="bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full">
                        {project.commissionRate}% commission
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{project.unitsAvailable} units</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Ready {project.deliveryDate}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          From {formatCurrency(project.startingPrice)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedProject(project)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Calculate Commission
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}          
          </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedProject.image}
                alt={selectedProject.name}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-gray-800 p-2 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProject.name}</h2>
                  <p className="text-gray-600 text-lg">{selectedProject.developer} • {selectedProject.location}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 text-sm font-medium rounded-full">
                    {selectedProject.commissionRate}% commission
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedProject.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starting Price:</span>
                      <span className="font-medium">{formatCurrency(selectedProject.startingPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Range:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedProject.priceRange.min)} - {formatCurrency(selectedProject.priceRange.max)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Units Available:</span>
                      <span className="font-medium">{selectedProject.unitsAvailable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Date:</span>
                      <span className="font-medium">{selectedProject.deliveryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission Rate:</span>
                      <span className="font-medium text-green-600">{selectedProject.commissionRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Types</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProject.propertyTypes.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Calculate Commission
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Contact Developer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Projects Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                    <Database className="h-6 w-6" />
                    <span>All Inventory Projects</span>
                  </h2>
                  <p className="text-gray-600 mt-1">Real properties available from our inventory database</p>
                </div>
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {inventoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <span className="ml-3 text-gray-600">Loading inventory projects...</span>
                </div>
              ) : (
                <div>
                  {inventoryProperties.length > 0 ? (
                    <div>
                      <div className="mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-800 font-semibold">
                                {inventoryProperties.length.toLocaleString()} Properties Found
                              </p>
                              <p className="text-green-600 text-sm">
                                From {getUniqueInventoryProjects(inventoryProperties).length} unique projects
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href="/inventory"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
                              >
                                <span>📋</span>
                                <span>Full Inventory Sheet</span>
                              </a>
                              <a
                                href="/inventory"
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                View Full Inventory →
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Projects Grid - Enhanced with Inventory Sheet Links */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {getUniqueInventoryProjects(inventoryProperties).slice(0, 12).map((project, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                            <div className="mb-4">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                              <div className="flex items-center text-gray-600 text-sm mb-1">
                                <Building2 className="h-4 w-4 mr-1" />
                                <span>{project.developer}</span>
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{project.area}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Available Units:</span>
                                <span className="font-medium text-gray-900">{project.totalUnits}</span>
                              </div>
                              
                              {project.minPrice && project.maxPrice && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Price Range:</span>
                                  <span className="font-medium text-green-600">
                                    {formatInventoryPrice(project.minPrice)} - {formatInventoryPrice(project.maxPrice)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Property Types:</span>
                                <span className="font-medium text-gray-900">
                                  {project.propertyTypes.slice(0, 2).join(', ')}{project.propertyTypes.length > 2 ? '...' : ''}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <a
                                href={`/inventory?search=${encodeURIComponent(project.name)}`}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
                              >
                                View Units
                              </a>
                              <a
                                href={`/inventory?compound=${encodeURIComponent(project.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                title="Open full inventory sheet for this project in new tab"
                              >
                                📋 Inventory Sheet
                              </a>
                              <button 
                                onClick={() => {
                                  setShowInventoryModal(false);
                                  setShowCalculator(true);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                              >
                                <Calculator className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Properties Table Summary */}
                      <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {inventoryProperties.slice(0, 10).map((property) => (
                                  <tr key={property.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 text-sm text-purple-600 font-medium">
                                      {typeof property.compound === 'string' ? property.compound : property.compound?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-green-600">
                                      {typeof property.area === 'string' ? property.area : property.area?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900">
                                      {typeof property.property_type === 'string' ? property.property_type : property.property_type?.name || 'Unknown'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      {property.number_of_bedrooms || '---'}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                      {property.unit_area ? `${property.unit_area}m²` : '---'}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-semibold text-green-700">
                                      {formatInventoryPrice(property.price_in_egp)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          {inventoryProperties.length > 10 && (
                            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                  Showing 10 of {inventoryProperties.length.toLocaleString()} properties
                                </p>
                                <a
                                  href="/inventory"
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  View all properties →
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory data available</h3>
                      <p className="text-gray-500 mb-4">Unable to load properties from the inventory database.</p>
                      <button
                        onClick={loadInventoryProperties}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Commission Calculator Component
interface CommissionCalculatorProps {
  commissionRates: CommissionRate[];
}

const CommissionCalculator: React.FC<CommissionCalculatorProps> = ({ commissionRates }) => {
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedCompound, setSelectedCompound] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [commissionAmount, setCommissionAmount] = useState(0);

  const developers = [...new Set(commissionRates.map(rate => rate.Developer))].sort();
  const compounds = selectedDeveloper 
    ? commissionRates
        .filter(rate => rate.Developer === selectedDeveloper)
        .map(rate => rate.Compound)
        .sort()
    : [];

  const selectedRate = commissionRates.find(
    rate => rate.Developer === selectedDeveloper && rate.Compound === selectedCompound
  );

  const calculateCommission = () => {
    if (selectedRate && propertyPrice) {
      const price = parseFloat(propertyPrice);
      const commission = (price * selectedRate['BR Percentage']) / 100;
      setCommissionAmount(commission);
    } else {
      setCommissionAmount(0);
    }
  };

  useEffect(() => {
    calculateCommission();
  }, [selectedDeveloper, selectedCompound, propertyPrice]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Developer
          </label>
          <select
            value={selectedDeveloper}
            onChange={(e) => {
              setSelectedDeveloper(e.target.value);
              setSelectedCompound('');
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Developer</option>
            {developers.map(developer => (
              <option key={developer} value={developer}>{developer}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compound/Project
          </label>
          <select
            value={selectedCompound}
            onChange={(e) => setSelectedCompound(e.target.value)}
            disabled={!selectedDeveloper}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Compound</option>
            {compounds.map(compound => (
              <option key={compound} value={compound}>{compound}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Price (EGP)
          </label>
          <input
            type="number"
            value={propertyPrice}
            onChange={(e) => setPropertyPrice(e.target.value)}
            placeholder="Enter property price"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Calculation</h3>
        
        {selectedRate ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Rate:</span>
              <span className="font-medium">{selectedRate['BR Percentage']}%</span>
            </div>
            
            {propertyPrice && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Price:</span>
                  <span className="font-medium">{new Intl.NumberFormat('en-EG').format(parseFloat(propertyPrice))} EGP</span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Your Commission:</span>
                    <span>{new Intl.NumberFormat('en-EG').format(commissionAmount)} EGP</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Select developer and compound to see commission rate</p>
        )}
      </div>
    </div>
  );
};

export default Projects;





