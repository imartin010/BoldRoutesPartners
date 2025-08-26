import { useState } from 'react';
import { X } from 'lucide-react';
import { PropertyFilter } from '../lib/supabaseQueries';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PropertyFilter;
  onFiltersChange: (filters: PropertyFilter) => void;
  filterOptions: {
    compounds: string[];
    areas: string[];
    developers: string[];
    propertyTypes: string[];
    bedroomOptions: number[];
    bathroomOptions: number[];
    finishingOptions: string[];
    readyByYearOptions: number[];
  };
  onApplyFilters: () => void;
  onClearAll: () => void;
}

export default function FiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filterOptions,
  onApplyFilters,
  onClearAll
}: FiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<PropertyFilter>(filters);

  if (!isOpen) return null;

  const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({});
    onFiltersChange({});
    onClearAll();
  };

  const propertyTypeButtons = [
    'Apartment', 'Villa', 'Chalet', 'Townhouse', 'Duplex',
    'Twinhouse', 'Serviced chalet', 'One-story Villa',
    'Branded Apartment', 'Branded Villa', 'Pharmacy', 'Loft',
    'Building', 'Serviced Studio', 'Serviced Apartment', 'Studio',
    'Cabin', 'Serviced Duplex', 'Ultra Luxury Villa', 'Penthouse',
    'Family House'
  ];

  const commercialTypes = ['Office', 'Retail', 'Clinic'];

  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5, 6];
  const floorOptions = [1, 2, 3, 4, 5, 6];

  const deliveryYears = ['Ready', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033', '2034'];

  const finishingTypes = [
    { key: 'not_finished', label: 'Not Finished' },
    { key: 'semi_finished', label: 'Semi Finished' },
    { key: 'finished', label: 'Finished' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'flexi_finished', label: 'Flexi Finished' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Developer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Developer</label>
            <select
              value={localFilters.developer || ''}
              onChange={(e) => handleFilterChange('developer', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Any developers</option>
              {filterOptions.developers.map(developer => (
                <option key={developer} value={developer}>{developer}</option>
              ))}
            </select>
          </div>

          {/* Compound */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compound</label>
            <select
              value={localFilters.compound || ''}
              onChange={(e) => handleFilterChange('compound', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Any compounds</option>
              {filterOptions.compounds.map(compound => (
                <option key={compound} value={compound}>{compound}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={localFilters.area || ''}
              onChange={(e) => handleFilterChange('area', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Any areas</option>
              {filterOptions.areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min price (EGP)"
                value={localFilters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Max price (EGP)"
                value={localFilters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Installment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Installment</label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Max down payment"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  placeholder="Max monthly payment"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Installment Years</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(year => (
                    <button
                      key={year}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Min area"
                value={localFilters.min_area || ''}
                onChange={(e) => handleFilterChange('min_area', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <input
                type="number"
                placeholder="Max area"
                value={localFilters.max_area || ''}
                onChange={(e) => handleFilterChange('max_area', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Unit Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type</label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Residential</label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypeButtons.map(type => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('property_type', localFilters.property_type === type ? '' : type)}
                      className={`px-3 py-1 border rounded text-sm ${
                        localFilters.property_type === type 
                          ? 'bg-orange-100 border-orange-300 text-orange-800' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Commercial</label>
                <div className="flex flex-wrap gap-2">
                  {commercialTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('property_type', localFilters.property_type === type ? '' : type)}
                      className={`px-3 py-1 border rounded text-sm ${
                        localFilters.property_type === type 
                          ? 'bg-orange-100 border-orange-300 text-orange-800' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Bedrooms</label>
                <div className="flex flex-wrap gap-2">
                  {bedroomOptions.map(num => (
                    <button
                      key={num}
                      onClick={() => handleFilterChange('bedrooms', localFilters.bedrooms === num ? undefined : num)}
                      className={`px-3 py-1 border rounded text-sm ${
                        localFilters.bedrooms === num 
                          ? 'bg-orange-100 border-orange-300 text-orange-800' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFilterChange('bedrooms', localFilters.bedrooms === 6 ? undefined : 6)}
                    className={`px-3 py-1 border rounded text-sm ${
                      localFilters.bedrooms === 6 
                        ? 'bg-orange-100 border-orange-300 text-orange-800' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    6+
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">Bathrooms</label>
                <div className="flex flex-wrap gap-2">
                  {bathroomOptions.map(num => (
                    <button
                      key={num}
                      onClick={() => handleFilterChange('bathrooms', localFilters.bathrooms === num ? undefined : num)}
                      className={`px-3 py-1 border rounded text-sm ${
                        localFilters.bathrooms === num 
                          ? 'bg-orange-100 border-orange-300 text-orange-800' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => handleFilterChange('bathrooms', localFilters.bathrooms === 6 ? undefined : 6)}
                    className={`px-3 py-1 border rounded text-sm ${
                      localFilters.bathrooms === 6 
                        ? 'bg-orange-100 border-orange-300 text-orange-800' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    6+
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
            <div className="flex flex-wrap gap-2">
              {floorOptions.map(num => (
                <button
                  key={num}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  {num}
                </button>
              ))}
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                +6
              </button>
            </div>
          </div>

          {/* Delivery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery</label>
            <div className="flex flex-wrap gap-2">
              {deliveryYears.map(year => (
                <button
                  key={year}
                  onClick={() => handleFilterChange('ready_by_year', localFilters.ready_by_year === (year === 'Ready' ? 2024 : Number(year)) ? undefined : (year === 'Ready' ? 2024 : Number(year)))}
                  className={`px-3 py-1 border rounded text-sm ${
                    localFilters.ready_by_year === (year === 'Ready' ? 2024 : Number(year))
                      ? 'bg-orange-100 border-orange-300 text-orange-800' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Finishing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Finishing</label>
            <div className="flex flex-wrap gap-2">
              {finishingTypes.map(finish => (
                <button
                  key={finish.key}
                  onClick={() => handleFilterChange('finishing', localFilters.finishing === finish.key ? '' : finish.key)}
                  className={`px-3 py-1 border rounded text-sm ${
                    localFilters.finishing === finish.key 
                      ? 'bg-orange-100 border-orange-300 text-orange-800' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {finish.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Show 100+ units
          </button>
        </div>
      </div>
    </div>
  );
}
