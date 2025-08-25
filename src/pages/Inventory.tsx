import { useDataStore } from '../store/data';
import Card from '../components/Card';
import PhoneButtons from '../components/PhoneButtons';

export default function Inventory() {
  const { inventory } = useDataStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-elegant-900 mb-3 sm:mb-4">Real Estate Inventory</h1>
        <p className="text-gray-elegant-600 text-sm sm:text-base">
          You'll fill it later with your available units and properties.
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-elegant-200">
            <thead className="bg-gray-elegant-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-elegant-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-elegant-500 uppercase tracking-wider hidden sm:table-cell">
                  Area
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-elegant-500 uppercase tracking-wider hidden md:table-cell">
                  Developer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-elegant-500 uppercase tracking-wider">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-elegant-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-elegant-50 transition-colors duration-200">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="text-sm font-medium text-gray-elegant-900">
                      {item.projectName}
                    </div>
                    <div className="text-xs text-gray-elegant-600 sm:hidden mt-1">
                      {item.area} • {item.developerName}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                    <div className="text-sm text-gray-elegant-900">{item.area}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                    <div className="text-sm text-gray-elegant-900">{item.developerName}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <PhoneButtons 
                      phone={item.devSalesPhone}
                      whatsappMessage={`Hi, I'm interested in ${item.projectName} in ${item.area}`}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {inventory.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-elegant-500 text-base sm:text-lg">No inventory items available at the moment.</p>
        </div>
      )}
    </div>
  );
}
