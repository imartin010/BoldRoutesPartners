import React from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useDeals } from '../../contexts/DealsContext';

export default function ContractDetailsStep() {
  const { formData, updateFormData, nextStep, previousStep } = useDeals();

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  const handleNext = () => {
    // Basic validation
    if (formData.developer && formData.project && formData.unitNumber && 
        formData.unitType && formData.contractPrice > 0) {
      nextStep();
    }
  };

  const developers = [
    'Mountain View', 'Taj Misr', 'Reportage Properties', 'V Development', 
    'Maven', 'PRE', 'The Land Developer - TLD', 'Radix Development'
  ];

  const projects = {
    'Mountain View': ['Aliva', 'South Mid', 'Garden Heights'],
    'Taj Misr': ['Bold Routes Community'],
    'Reportage Properties': ['Montenapoleone'],
  };

  const unitTypes = ['Villa', 'Twin House', 'Penthouse', 'Apartment', 'Duplex'];
  const finishingTypes = ['Core & Shell', 'Semi-Finished', 'Fully Finished', 'Fully Furnished'];

  const isFormValid = formData.developer && formData.project && formData.unitNumber && 
                     formData.unitType && formData.contractPrice > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={previousStep} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">Creating Deal</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enter Contract details
          </h2>
          <p className="text-gray-500 mb-8">Choose Lead</p>

          <div className="space-y-6">
            {/* Contracted Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contracted date
              </label>
              <input
                type="date"
                value={formData.contractedDate}
                onChange={(e) => handleInputChange('contractedDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Developer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer
              </label>
              <div className="relative">
                <select
                  value={formData.developer}
                  onChange={(e) => handleInputChange('developer', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="">Select Developer</option>
                  {developers.map((dev) => (
                    <option key={dev} value={dev}>{dev}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <div className="relative">
                <select
                  value={formData.project}
                  onChange={(e) => handleInputChange('project', e.target.value)}
                  disabled={!formData.developer}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none disabled:bg-gray-50"
                >
                  <option value="">Select Developer</option>
                  {formData.developer && projects[formData.developer as keyof typeof projects]?.map((proj) => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Unit Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Number
              </label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Unit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Type
              </label>
              <div className="relative">
                <select
                  value={formData.unitType}
                  onChange={(e) => handleInputChange('unitType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="">Select Unit Type</option>
                  {unitTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Unit Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Area
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.unitArea || ''}
                  onChange={(e) => handleInputChange('unitArea', parseInt(e.target.value) || 0)}
                  placeholder="150"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  m²
                </span>
              </div>
            </div>

            {/* Finishing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finishing Type
              </label>
              <div className="relative">
                <select
                  value={formData.finishingType}
                  onChange={(e) => handleInputChange('finishingType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="">Select Unit Type</option>
                  {finishingTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Down Payment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.downPayment || ''}
                  onChange={(e) => handleInputChange('downPayment', parseInt(e.target.value) || 0)}
                  placeholder="EGP"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  EGP
                </span>
              </div>
            </div>

            {/* Contract Unit Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Unit Price
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.contractPrice || ''}
                  onChange={(e) => handleInputChange('contractPrice', parseInt(e.target.value) || 0)}
                  placeholder="e.g 12,000,000"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  EGP
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-4 mt-8 pb-8">
            <button
              onClick={previousStep}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={!isFormValid}
              className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
