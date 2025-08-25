import { useState, useMemo } from 'react';
import { useDataStore } from '../store/data';
import Card from '../components/Card';
import SearchBar from '../components/SearchBar';
import PhoneButtons from '../components/PhoneButtons';
import { formatCurrencyEGP, formatDate, isUpcoming } from '../utils/format';
import { Calendar, MapPin, DollarSign } from 'lucide-react';

export default function Launches() {
  const { launches, getDeveloperById } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active'>('all');

  const filteredLaunches = useMemo(() => {
    let filtered = launches;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (launch) =>
          launch.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getDeveloperById(launch.developerId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          launch.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (filter === 'upcoming') {
      filtered = filtered.filter((launch) => isUpcoming(launch.launchDateISO));
    } else if (filter === 'active') {
      filtered = filtered.filter((launch) => !isUpcoming(launch.launchDateISO));
    }

    return filtered;
  }, [launches, searchTerm, filter, getDeveloperById]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-elegant-900 mb-3 sm:mb-4">New Launches</h1>
        <p className="text-gray-elegant-600 text-sm sm:text-base">
          Discover the latest property launches from our developer partners.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by project, developer, or area..."
        />
        <div className="flex rounded-lg border border-gray-elegant-300 overflow-hidden bg-white">
          {(['all', 'upcoming', 'active'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`flex-1 px-3 py-2 text-sm font-medium capitalize transition-all duration-300 ${
                filter === filterOption
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-elegant-700 hover:bg-gray-elegant-50'
              }`}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Launches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredLaunches.map((launch) => {
          const developer = getDeveloperById(launch.developerId);
          const isUpcomingLaunch = isUpcoming(launch.launchDateISO);

          return (
            <Card key={launch.id}>
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {launch.projectName}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isUpcomingLaunch
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isUpcomingLaunch ? 'Upcoming' : 'Active'}
                    </span>
                  </div>
                  <p className="text-gray-600 font-medium">{developer?.name}</p>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{launch.area}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Starting from {formatCurrencyEGP(launch.minPrice)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Launch: {formatDate(launch.launchDateISO)}
                    </span>
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-4 border-t border-gray-100">
                  <PhoneButtons
                    phone={launch.phone}
                    whatsappMessage={`Hi, I'm interested in ${launch.projectName} in ${launch.area}`}
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredLaunches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || filter !== 'all'
              ? 'No launches match your current filters.'
              : 'No launches available at the moment.'}
          </p>
          {(searchTerm || filter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
