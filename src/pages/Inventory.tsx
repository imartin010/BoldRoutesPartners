import { useState, useEffect } from 'react';
import { getActiveProperties, getFilterOptions, type Property, type PropertyFilter } from '../lib/supabaseQueries';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import FiltersModal from '../components/FiltersModal';
import { ChevronDown, Filter } from 'lucide-react';

export default function Inventory() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [filterOptions, setFilterOptions] = useState({
    compounds: [] as string[],
    areas: [] as string[],
    developers: [] as string[],
    propertyTypes: [] as string[],
    bedroomOptions: [] as number[],
    bathroomOptions: [] as number[],
    finishingOptions: [] as string[],
    readyByYearOptions: [] as number[],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;
  
  // Modal and quick filter states
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilters, setQuickFilters] = useState({
    types: '',
    priceRange: '',
    rooms: '',
    delivery: '',
    finishing: ''
  });

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load properties when filters or page changes
  useEffect(() => {
    loadProperties();
  }, [filters, currentPage]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        setFilters(prev => ({
          ...prev,
          search: searchTerm || undefined
        }));
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions();
      if (!options.error) {
        setFilterOptions({
          compounds: options.compounds,
          areas: options.areas,
          developers: options.developers,
          propertyTypes: options.propertyTypes,
          bedroomOptions: options.bedroomOptions,
          bathroomOptions: options.bathroomOptions,
          finishingOptions: options.finishingOptions,
          readyByYearOptions: options.readyByYearOptions,
        });
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getActiveProperties(currentPage, pageSize, filters);
      
      if (result.error) {
        setError('Failed to load properties. Please try again.');
        console.error('Properties load error:', result.error);
      } else {
        setProperties(result.properties);
        setTotalCount(result.totalCount || 0);
        setTotalPages(result.totalPages || 0);
      }
    } catch (err) {
      setError('Failed to load properties. Please try again.');
      console.error('Properties load error:', err);
    } finally {
      setLoading(false);
    }
  };



  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setQuickFilters({
      types: '',
      priceRange: '',
      rooms: '',
      delivery: '',
      finishing: ''
    });
    setCurrentPage(1);
  };

  const handleQuickFilterChange = (filterType: string, value: string) => {
    setQuickFilters(prev => ({ ...prev, [filterType]: value }));
    
    // Apply quick filter to main filters
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'types':
        newFilters.property_type = value;
        break;
      case 'rooms':
        if (value) {
          const roomCount = parseInt(value.replace(/[^0-9]/g, ''));
          newFilters.bedrooms = roomCount;
        } else {
          delete newFilters.bedrooms;
        }
        break;
      case 'delivery':
        if (value === 'Ready') {
          newFilters.ready_by_year = 2024;
        } else if (value) {
          newFilters.ready_by_year = parseInt(value);
        } else {
          delete newFilters.ready_by_year;
        }
        break;
      case 'finishing':
        newFilters.finishing = value;
        break;
      case 'priceRange':
        if (value === 'under-5m') {
          newFilters.max_price = 5000000;
          delete newFilters.min_price;
        } else if (value === '5m-10m') {
          newFilters.min_price = 5000000;
          newFilters.max_price = 10000000;
        } else if (value === '10m-20m') {
          newFilters.min_price = 10000000;
          newFilters.max_price = 20000000;
        } else if (value === 'over-20m') {
          newFilters.min_price = 20000000;
          delete newFilters.max_price;
        } else {
          delete newFilters.min_price;
          delete newFilters.max_price;
        }
        break;
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const applyFiltersFromModal = () => {
    loadProperties();
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M EGP`;
    }
    return `${(price / 1000).toFixed(0)}K EGP`;
  };

  const formatArea = (area: number | null | undefined) => {
    if (!area) return '';
    return `${Math.round(area)}m²`;
  };

  const formatPricePerMeter = (pricePerMeter: number | null | undefined) => {
    if (!pricePerMeter) return '';
    return `${Math.round(pricePerMeter).toLocaleString()} EGP/m²`;
  };

  const getFinishingBadge = (finishing: string | null | undefined) => {
    if (finishing === 'finished') {
      return <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Finished</span>;
    } else if (finishing === 'not_finished') {
      return <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Not Finished</span>;
    }
    return <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">TBD</span>;
  };

  if (loading && properties.length === 0) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {totalCount.toLocaleString()} PRIMARY Properties Available
            </h1>
          </div>
        </div>
      </div>



      {/* Quick Filters Bar */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Project, Location, Unit ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Types Filter */}
          <div className="relative">
            <select
              value={quickFilters.types}
              onChange={(e) => handleQuickFilterChange('types', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Types</option>
              {filterOptions.propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Price Filter */}
          <div className="relative">
            <select
              value={quickFilters.priceRange}
              onChange={(e) => handleQuickFilterChange('priceRange', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Price</option>
              <option value="under-5m">Under 5M EGP</option>
              <option value="5m-10m">5M - 10M EGP</option>
              <option value="10m-20m">10M - 20M EGP</option>
              <option value="over-20m">Over 20M EGP</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Rooms Filter */}
          <div className="relative">
            <select
              value={quickFilters.rooms}
              onChange={(e) => handleQuickFilterChange('rooms', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Rooms</option>
              <option value="1">1 BR</option>
              <option value="2">2 BR</option>
              <option value="3">3 BR</option>
              <option value="4">4 BR</option>
              <option value="5">5 BR</option>
              <option value="6+">6+ BR</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Delivery Filter */}
          <div className="relative">
            <select
              value={quickFilters.delivery}
              onChange={(e) => handleQuickFilterChange('delivery', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Delivery</option>
              <option value="Ready">Ready</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Finishing Filter */}
          <div className="relative">
            <select
              value={quickFilters.finishing}
              onChange={(e) => handleQuickFilterChange('finishing', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Finishing</option>
              <option value="not_finished">Not Finished</option>
              <option value="semi_finished">Semi Finished</option>
              <option value="finished">Finished</option>
              <option value="furnished">Furnished</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* All Filters Button */}
          <button
            onClick={() => setIsFiltersModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            All Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6">
          <div className="p-4 text-center text-red-600">
            {error}
            <button
              onClick={loadProperties}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {/* Properties Table with Hierarchical Structure */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Developer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compound
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Finishing
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Down Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.nawy_id} className="hover:bg-gray-50 transition-colors">
                  {/* Developer */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-blue-600">
                      {property.developer?.name || 'Unknown Developer'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Real Estate Company
                    </div>
                  </td>

                  {/* Area */}
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {property.area?.name || 'Unknown Area'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Location
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Compound */}
                  <td className="px-4 py-4 text-sm">
                    <div className="text-purple-600 font-medium hover:text-purple-800 cursor-pointer">
                      {property.compound?.name?.trim() || 'Unknown Compound'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Project Name
                    </div>
                  </td>

                  {/* Property Type */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {property.property_type?.name || 'Unknown Type'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Property Category
                    </div>
                  </td>

                  {/* Specs */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {formatArea(property.unit_area)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {property.number_of_bedrooms}BR • {property.number_of_bathrooms}BA
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-bold text-green-600">
                      {formatPrice(property.price_in_egp)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatPricePerMeter(property.price_per_meter)}
                    </div>
                  </td>

                  {/* Finishing */}
                  <td className="px-4 py-4 text-sm">
                    {getFinishingBadge(property.finishing)}
                  </td>

                  {/* Down Payment */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-semibold text-orange-600">
                      {property.down_payment_value ? 
                        `${(property.down_payment_value / 1000000).toFixed(1)}M EGP` : 
                        '---'
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.down_payment_percent ? 
                        `${property.down_payment_percent.toFixed(0)}%` : 
                        ''
                      }
                    </div>
                  </td>

                  {/* Monthly Payment */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-semibold text-blue-600">
                      {property.monthly_installment ? 
                        `${(property.monthly_installment / 1000).toFixed(0)}K EGP` : 
                        '---'
                      }
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.payment_years ? 
                        `${property.payment_years} years` : 
                        ''
                      }
                    </div>
                  </td>

                  {/* Unit ID */}
                  <td className="px-4 py-4 text-sm">
                    <div className="font-mono text-xs bg-blue-50 px-2 py-1 rounded border">
                      {property.unit_id || `Unit-${property.id}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      DB ID: {property.id}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} PRIMARY properties
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Loading overlay for pagination */}
      {loading && properties.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">
            <LoadingSpinner />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && properties.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-base sm:text-lg">
            No properties match your current filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Clear filters to see all properties
          </button>
        </div>
      )}

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        filterOptions={filterOptions}
        onApplyFilters={applyFiltersFromModal}
        onClearAll={clearFilters}
      />
    </div>
  );
}