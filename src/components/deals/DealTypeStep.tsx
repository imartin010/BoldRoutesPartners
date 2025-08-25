import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useDeals } from '../../contexts/DealsContext';
import { Link } from 'react-router-dom';

export default function DealTypeStep() {
  const { formData, updateFormData, nextStep } = useDeals();

  const dealTypes = [
    {
      type: 'Contract',
      title: 'Contract',
      description: 'Full contract agreement signed between the client and the Developer to finalize the deal.',
      selected: formData.dealType === 'Contract'
    },
    {
      type: 'Reservation',
      title: 'Reservation',
      description: 'Secures the unit for your client with initial details and a payment.',
      selected: formData.dealType === 'Reservation'
    },
    {
      type: 'EOI',
      title: 'EOI',
      description: 'An initial step that shows your client\'s interest in a unit before reservation.',
      selected: formData.dealType === 'EOI'
    },
    {
      type: 'CIL',
      title: 'CIL',
      description: 'CIL confirms your client is linked to the developer.',
      selected: formData.dealType === 'CIL'
    }
  ];

  const handleTypeSelect = (type: string) => {
    updateFormData({ dealType: type as any });
  };

  const handleNext = () => {
    if (formData.dealType) {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link to="/deals" className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">Creating Deal</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            What is the TCR type?
          </h2>
          <p className="text-gray-500 mb-8">
            Choose the deal type to proceed with creating your deal.
          </p>

          <div className="space-y-4 mb-8">
            {dealTypes.map((dealType) => (
              <button
                key={dealType.type}
                onClick={() => handleTypeSelect(dealType.type)}
                className={`w-full p-4 text-left border rounded-lg transition-all ${
                  dealType.selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{dealType.title}</h3>
                  {dealType.selected && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{dealType.description}</p>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex space-x-4">
            <Link
              to="/deals"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium text-center hover:bg-gray-300 transition-colors"
            >
              Back
            </Link>
            
            <button
              onClick={handleNext}
              disabled={!formData.dealType}
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
