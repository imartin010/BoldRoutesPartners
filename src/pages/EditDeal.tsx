import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useDeals } from '../contexts/DealsContext';
import { useToastTriggers } from '../hooks/useToastTriggers';

export default function EditDeal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deals } = useDeals();
  const { showSuccess } = useToastTriggers();
  
  const deal = deals.find(d => d.id === id);
  
  const [formData, setFormData] = useState({
    clientName: deal?.clientName || '',
    developer: deal?.developer || '',
    project: deal?.project || '',
    unitNumber: deal?.unitNumber || '',
    unitType: deal?.unitType || '',
    unitArea: deal?.unitArea || 0,
    contractPrice: deal?.contractPrice || 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Deal updated successfully', 'Your changes have been saved');
      navigate(`/deals/${id}`);
    } catch (error) {
      console.error('Failed to update deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Deal not found</h2>
          <Link to="/deals" className="text-blue-600 hover:text-blue-800">
            Back to Deals
          </Link>
        </div>
      </div>
    );
  }

  const developers = ['Mountain View', 'Taj Misr', 'Reportage Properties'];
  const unitTypes = ['Villa', 'Twin House', 'Penthouse', 'Apartment', 'Duplex'];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link to={`/deals/${id}`} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">Edit Deal</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enter contract details
          </h2>
          <p className="text-gray-500 mb-8">Choose Lead</p>
          
          <div className="mb-6">
            <p className="text-gray-700 font-medium">{formData.clientName}</p>
          </div>

          <div className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Developer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developers
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

            {/* Unit Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Number
              </label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                placeholder="24"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
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
                  placeholder="170"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  m²
                </span>
              </div>
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
          </div>

          {/* Navigation */}
          <div className="flex space-x-4 mt-8 pb-8">
            <Link
              to={`/deals/${id}`}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium text-center hover:bg-gray-300 transition-colors"
            >
              Back
            </Link>
            
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
