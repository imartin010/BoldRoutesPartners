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
        readyByYearOptions: [] as string[],
        developerCompounds: {} as { [developer: string]: string[] },
      });
    const [filterOptionsLoading, setFilterOptionsLoading] = useState(true);
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
          console.log('=== SEARCH TRIGGERED ===');
          console.log('Search term:', searchTerm);
          console.log('Previous search:', filters.search);
          
          setFilters(prev => ({
            ...prev,
            search: searchTerm || undefined
          }));
          setCurrentPage(1);
        }
      }, 300); // Reduced from 500ms to 300ms for better responsiveness

      return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadFilterOptions = async () => {
      try {
        setFilterOptionsLoading(true);
        const options = await getFilterOptions();
        if (!options.error) {
          setFilterOptions({
            compounds: Array.from(options.compounds || []),
            areas: Array.from(options.areas || []),
            developers: Array.from(options.developers || []),
            propertyTypes: Array.from(options.propertyTypes || []),
            bedroomOptions: Array.from(options.bedroomOptions || []),
            bathroomOptions: Array.from(options.bathroomOptions || []),
            finishingOptions: Array.from(options.finishingOptions || []),
            readyByYearOptions: Array.from(options.readyByYearOptions || []),
            developerCompounds: options.developerCompounds || {},
          });
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      } finally {
        setFilterOptionsLoading(false);
      }
    };

    const loadProperties = async () => {
      console.log('=== LOAD PROPERTIES CALLED ===');
      console.log('Current page:', currentPage);
      console.log('Page size:', pageSize);
      console.log('Filters:', filters);
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await getActiveProperties(currentPage, pageSize, filters);
        
        console.log('=== LOAD PROPERTIES RESULT ===');
        console.log('Result:', result);
        console.log('Properties count:', result.properties?.length || 0);
        console.log('Total count:', result.totalCount);
        console.log('Total pages:', result.totalPages);
        
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
          if (value) {
            newFilters.ready_by_year = value;
          } else {
            delete newFilters.ready_by_year;
          }
          break;
        case 'finishing':
          if (value) {
            newFilters.finishing = value;
          } else {
            delete newFilters.finishing;
          }
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

    // Unused helpers kept for future UI variants

    const getFinishingBadge = (finishing: string | null | undefined) => {
      if (finishing === 'finished') {
        return <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Finished</span>;
      } else if (finishing === 'not_finished') {
        return <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Not Finished</span>;
      }
      return <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">TBD</span>;
    };

    const formatDeliveryDate = (readyBy: string | null | undefined) => {
      if (!readyBy) return '---';
      
      // Handle "Ready" case
      if (readyBy.toLowerCase() === 'ready') {
        return 'Ready';
      }
      
      // Try to parse date and format as Month Year
      try {
        const date = new Date(readyBy);
        if (isNaN(date.getTime())) {
          // If not a valid date, try to extract year from string
          const yearMatch = readyBy.match(/\b(20\d{2})\b/);
          if (yearMatch) {
            return yearMatch[1];
          }
          return readyBy; // Return as is if we can't parse
        }
        
        // Format as "Dec 2025" - clean and simple
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${month} ${year}`;
      } catch (e) {
        // If parsing fails, try to extract year
        const yearMatch = readyBy.match(/\b(20\d{2})\b/);
        if (yearMatch) {
          return yearMatch[1];
        }
        return readyBy; // Return as is if we can't parse
      }
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
            <div className="flex-1 min-w-[200px] relative">
              <input
                type="text"
                placeholder="Project, Location, Unit ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 pr-8"
              />
              {searchTerm && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-4 h-4 text-teal-500">🔍</div>
                  )}
                </div>
              )}
            </div>

            {/* Types Filter */}
            <div className="relative">
              <select
                value={quickFilters.types}
                onChange={(e) => handleQuickFilterChange('types', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Types</option>
                {filterOptions.propertyTypes && filterOptions.propertyTypes.length > 0 ? (
                  filterOptions.propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))
                ) : (
                  <option value="" disabled>Loading types...</option>
                )}
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
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
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
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>

                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Baths</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Down payment</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Pay</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Years</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finishing</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>

                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden">Floor</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden">Floor plan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    {/* Developer */}
                    <td className="px-2 py-2 text-xs text-blue-600 font-medium">
                      {typeof property.developer === 'string' ? property.developer : property.developer?.name || 'Unknown'}
                    </td>

                    {/* Location (Area name) */}
                    <td className="px-2 py-2 text-xs text-green-600 font-medium">
                      {typeof property.area === 'string' ? property.area : property.area?.name || 'Unknown'}
                    </td>

                    {/* Project (Compound) */}
                    <td className="px-2 py-2 text-xs text-purple-600 font-medium">
                      {typeof property.compound === 'string' ? property.compound : property.compound?.name || 'Unknown'}
                    </td>



                    {/* Type */}
                    <td className="px-2 py-2 text-xs text-gray-800 font-medium">
                      {typeof property.property_type === 'string' ? property.property_type : property.property_type?.name || 'Unknown'}
                    </td>

                    {/* Area (unit size) */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {property.unit_area ? `${property.unit_area}m²` : '---'}
                    </td>

                    {/* Beds */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {property.number_of_bedrooms || '---'}
                    </td>

                    {/* Baths */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {property.number_of_bathrooms || '---'}
                    </td>

                    {/* Price */}
                    <td className="px-2 py-2 text-xs text-green-700 font-bold">
                      {property.price_in_egp ? formatPrice(property.price_in_egp) : '---'}
                    </td>

                    {/* Down payment */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {property.paymentData?.downPayment ? `${Number(property.paymentData.downPayment).toLocaleString()} EGP` : '---'}
                    </td>

                    {/* Monthly Pay */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {property.paymentData?.monthlyPayment ? `${Number(property.paymentData.monthlyPayment).toLocaleString()} EGP` : '---'}
                    </td>

                    {/* Years */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {property.paymentData?.years ? `${property.paymentData.years} years` : '---'}
                    </td>

                    {/* Finishing */}
                    <td className="px-2 py-2 text-xs">
                      {getFinishingBadge(property.finishing)}
                    </td>

                    {/* Delivery */}
                    <td className="px-2 py-2 text-xs text-gray-700">
                      {formatDeliveryDate(property.ready_by)}
                    </td>

                    {/* Floor plan (hidden) */}
                    <td className="px-2 py-2 text-xs text-blue-600 hidden">
                      {property.image ? 'Open' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Search Status */}
          {filters.search && (
            <div className="px-6 py-3 border-t border-gray-200 bg-blue-50">
              <div className="text-sm text-blue-700">
                🔍 Searching for: <span className="font-semibold">"{filters.search}"</span>
                {loading && <span className="ml-2">(Searching...)</span>}
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} PRIMARY properties
                  {filters.search && <span className="text-blue-600"> (filtered results)</span>}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log('=== PREVIOUS BUTTON CLICKED ===');
                      console.log('Current page before:', currentPage);
                      setCurrentPage(prev => {
                        const newPage = Math.max(1, prev - 1);
                        console.log('Setting page to:', newPage);
                        return newPage;
                      });
                    }}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => {
                      console.log('=== NEXT BUTTON CLICKED ===');
                      console.log('Current page before:', currentPage);
                      setCurrentPage(prev => {
                        const newPage = Math.min(totalPages, prev + 1);
                        console.log('Setting page to:', newPage);
                        return newPage;
                      });
                    }}
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
 
 