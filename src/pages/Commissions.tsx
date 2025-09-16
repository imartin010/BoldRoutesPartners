import { useState, useEffect } from 'react';
import { useDataStore } from '../store/data';
import CurrencyInput from '../components/CurrencyInput';
import { formatCurrencyEGP } from '../utils/format';
import { Calculator, TrendingUp } from 'lucide-react';

export default function Commissions() {
  const { commissions, loadLiveCommissions } = useDataStore();
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [dealValue, setDealValue] = useState('');

  // Load live commission data when component mounts
  useEffect(() => {
    loadLiveCommissions();
  }, [loadLiveCommissions]);

  // Sort commissions alphabetically by developer name
  const sortedCommissions = [...commissions].sort((a, b) => 
    a.developerName.localeCompare(b.developerName)
  );

  const selectedCommission = commissions.find(
    (comm) => comm.developerName === selectedDeveloper
  );

  const calculatedCommission = 
    selectedCommission && dealValue && !isNaN(parseFloat(dealValue))
      ? (parseFloat(dealValue) * selectedCommission.commissionPercent) / 100
      : 0;

  const handleDeveloperSelect = (developerName: string) => {
    setSelectedDeveloper(developerName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section">
      <header className="mb-8 text-center lg:text-left">
        <h1 className="h1 mb-4 text-balance">Commission Rates</h1>
        <p className="lead text-balance">
          View commission rates for all our developer partners and calculate your earnings.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Commission Rates */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 text-brand-fg mr-3" aria-hidden="true" />
            <h2 className="h2">Commission Rates</h2>
          </div>
          
          {/* Mobile: Cards Layout */}
          <div className="block md:hidden space-y-3 max-h-96 overflow-y-auto">
            {sortedCommissions.map((commission) => (
              <button
                key={commission.developerId}
                className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedDeveloper === commission.developerName 
                    ? 'border-brand-fg bg-brand-muted' 
                    : 'border-brand-border hover:border-brand-fg hover:bg-brand-overlay'
                }`}
                onClick={() => handleDeveloperSelect(commission.developerName)}
                aria-pressed={selectedDeveloper === commission.developerName}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-brand-fg truncate">
                      {commission.developerName}
                    </h3>
                    <p className="text-sm text-brand-fg opacity-60">
                      {commission.projects}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-brand-fg ml-4">
                    {commission.commissionPercent}%
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-fg opacity-60 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-fg opacity-60 uppercase tracking-wider">
                    Commission %
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCommissions.map((commission, index) => (
                  <tr
                    key={commission.developerId}
                    className={`cursor-pointer transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-brand-bg' : 'bg-brand-muted/50'
                    } ${
                      selectedDeveloper === commission.developerName 
                        ? 'bg-brand-muted border-l-4 border-brand-fg' 
                        : 'hover:bg-brand-overlay'
                    }`}
                    onClick={() => handleDeveloperSelect(commission.developerName)}
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-brand-fg">
                        {commission.developerName}
                      </div>
                      <div className="text-xs text-brand-fg opacity-60">
                        {commission.projects}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-brand-fg">
                        {commission.commissionPercent}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Calculator */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Calculator className="w-6 h-6 text-brand-fg mr-3" aria-hidden="true" />
            <h2 className="h2">Commission Calculator</h2>
          </div>

          <div className="space-y-6">
            {/* Developer Selection */}
            <div className="form-field">
              <label htmlFor="developer-select" className="form-label">
                Select Developer
              </label>
              <select
                id="developer-select"
                value={selectedDeveloper}
                onChange={(e) => setSelectedDeveloper(e.target.value)}
                className="form-input"
              >
                <option value="">Choose a developer...</option>
                {sortedCommissions.map((commission) => (
                  <option key={commission.developerId} value={commission.developerName}>
                    {commission.developerName} ({commission.commissionPercent}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Deal Value Input */}
            <div className="form-field">
              <label htmlFor="deal-value" className="form-label">
                Deal Value
              </label>
              <CurrencyInput
                value={dealValue}
                onChange={setDealValue}
                placeholder="Enter deal value in EGP"
                className="form-input"
                aria-label="Deal value in Egyptian Pounds"
              />
            </div>

            {/* Results */}
            {selectedCommission && dealValue && (
              <div className="bg-brand-muted rounded-lg p-6">
                <h3 className="h3 mb-4 text-center">Expected Earnings</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-fg opacity-60">Developer:</span>
                    <span className="font-medium text-brand-fg">{selectedCommission.developerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-fg opacity-60">Commission Rate:</span>
                    <span className="font-medium text-brand-fg">
                      {selectedCommission.commissionPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-fg opacity-60">Deal Value:</span>
                    <span className="font-medium text-brand-fg">
                      {dealValue ? formatCurrencyEGP(parseFloat(dealValue) || 0) : 'EGP 0'}
                    </span>
                  </div>
                  <div className="divider my-4"></div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-brand-fg">Your Commission:</span>
                    <span className="font-bold text-2xl text-brand-fg">
                      {formatCurrencyEGP(calculatedCommission)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!selectedDeveloper && (
              <div className="text-center py-12 text-brand-fg opacity-60">
                <Calculator className="w-12 h-12 mx-auto mb-4 text-brand-fg opacity-40" aria-hidden="true" />
                <p className="text-balance">
                  Select a developer and enter a deal value to calculate your commission.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
