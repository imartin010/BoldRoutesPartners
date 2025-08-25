import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import { useToastTriggers } from '../../hooks/useToastTriggers';

interface ChangeDealStageProps {
  dealId: string;
  currentStage: string;
  onClose: () => void;
  onStageChanged: (newStage: string) => void;
}

type StageType = 'EOI' | 'Reservation' | 'Contract';
type StepType = 'select-stage' | 'enter-details';

const stageInfo = {
  'EOI': {
    title: 'EOI',
    description: "An initial step that shows your client's interest in a unit before reservation."
  },
  'Reservation': {
    title: 'Reservation',
    description: 'Secures the unit for your client with initial details and a payment.'
  },
  'Contract': {
    title: 'Contract',
    description: 'The official agreement signed between the client and the developer to finalize the deal.'
  }
};

export default function ChangeDealStage({ dealId, currentStage, onClose, onStageChanged }: ChangeDealStageProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('select-stage');
  const [selectedStage, setSelectedStage] = useState<StageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess } = useToastTriggers();

  // Form data for different stages
  const [reservationData, setReservationData] = useState({
    leadId: '',
    reservationDate: '',
    clientName: '',
    developer: '',
    project: '',
    unitNumber: '',
    unitType: '',
    unitArea: '',
    finishingType: '',
    deliveryDate: '',
    downPayment: '',
    expectedContractDate: '',
    reservationUnitPrice: ''
  });

  const [contractData, setContractData] = useState({
    leadId: '',
    contractedDate: '',
    developer: '',
    project: '',
    unitNumber: '',
    unitType: '',
    unitArea: '',
    finishingType: '',
    deliveryDate: '',
    downPayment: '',
    contractUnitPrice: ''
  });

  const handleStageSelect = (stage: StageType) => {
    setSelectedStage(stage);
    if (stage === 'EOI') {
      // EOI doesn't need additional details
      handleStageChange(stage);
    } else {
      setCurrentStep('enter-details');
    }
  };

  const handleStageChange = async (stage: StageType) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Deal stage updated', `Deal has been moved to ${stage} stage`);
      onStageChanged(stage);
      onClose();
    } catch (error) {
      console.error('Failed to change stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReservationSubmit = () => {
    handleStageChange('Reservation');
  };

  const handleContractSubmit = () => {
    handleStageChange('Contract');
  };

  const renderStageSelection = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select new stage</h2>
      
      <div className="space-y-4">
        {Object.entries(stageInfo).map(([stage, info]) => (
          <button
            key={stage}
            onClick={() => handleStageSelect(stage as StageType)}
            disabled={stage === currentStage}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              stage === currentStage
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : selectedStage === stage
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-sm text-gray-600">{info.description}</p>
            {stage === currentStage && (
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Current Stage
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderReservationForm = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Reservation details</h2>
      
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Choose Lead */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Lead</label>
          <div className="relative">
            <select
              value={reservationData.leadId}
              onChange={(e) => setReservationData(prev => ({ ...prev, leadId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Lead</option>
              <option value="lead1">Ahmed Mahmoud</option>
              <option value="lead2">Sara Ali</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Reservation Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reservation date</label>
          <div className="relative">
            <input
              type="date"
              value={reservationData.reservationDate}
              onChange={(e) => setReservationData(prev => ({ ...prev, reservationDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
              placeholder="Select Reservation date"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Client Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
          <input
            type="text"
            value={reservationData.clientName}
            onChange={(e) => setReservationData(prev => ({ ...prev, clientName: e.target.value }))}
            placeholder="Client name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Developer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Developer</label>
          <div className="relative">
            <select
              value={reservationData.developer}
              onChange={(e) => setReservationData(prev => ({ ...prev, developer: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Developer</option>
              <option value="mountain-view">Mountain View</option>
              <option value="taj-misr">Taj Misr</option>
              <option value="reportage">Reportage Properties</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <div className="relative">
            <select
              value={reservationData.project}
              onChange={(e) => setReservationData(prev => ({ ...prev, project: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Developer</option>
              <option value="project1">Elaf Residence</option>
              <option value="project2">Mountain View Akiva</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Unit Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
          <input
            type="text"
            value={reservationData.unitNumber}
            onChange={(e) => setReservationData(prev => ({ ...prev, unitNumber: e.target.value }))}
            placeholder="e.g. 150"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Unit Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type</label>
          <div className="relative">
            <select
              value={reservationData.unitType}
              onChange={(e) => setReservationData(prev => ({ ...prev, unitType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Unit Type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="penthouse">Penthouse</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Unit Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Area</label>
          <div className="relative">
            <input
              type="number"
              value={reservationData.unitArea}
              onChange={(e) => setReservationData(prev => ({ ...prev, unitArea: e.target.value }))}
              placeholder="150"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">m²</span>
          </div>
        </div>

        {/* Finishing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Finishing Type</label>
          <div className="relative">
            <select
              value={reservationData.finishingType}
              onChange={(e) => setReservationData(prev => ({ ...prev, finishingType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Unit Type</option>
              <option value="semi-finished">Semi-Finished</option>
              <option value="fully-finished">Fully Finished</option>
              <option value="core-shell">Core & Shell</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
          <div className="relative">
            <input
              type="date"
              value={reservationData.deliveryDate}
              onChange={(e) => setReservationData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
              placeholder="Delivery Date"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
          <div className="relative">
            <input
              type="number"
              value={reservationData.downPayment}
              onChange={(e) => setReservationData(prev => ({ ...prev, downPayment: e.target.value }))}
              placeholder="ex: 5"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
          </div>
        </div>

        {/* Expected Date of Contracting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Date of Contracting</label>
          <div className="relative">
            <input
              type="date"
              value={reservationData.expectedContractDate}
              onChange={(e) => setReservationData(prev => ({ ...prev, expectedContractDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
              placeholder="Delivery Date"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Reservation Unit Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reservation Unit Price</label>
          <div className="relative">
            <input
              type="text"
              value={reservationData.reservationUnitPrice}
              onChange={(e) => setReservationData(prev => ({ ...prev, reservationUnitPrice: e.target.value }))}
              placeholder="e.g 12,000,000"
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">EGP</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContractForm = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Contract details</h2>
      
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Choose Lead */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Lead</label>
          <div className="relative">
            <select
              value={contractData.leadId}
              onChange={(e) => setContractData(prev => ({ ...prev, leadId: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Lead</option>
              <option value="lead1">Ahmed Mahmoud</option>
              <option value="lead2">Sara Ali</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Contracted Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contracted date</label>
          <div className="relative">
            <input
              type="date"
              value={contractData.contractedDate}
              onChange={(e) => setContractData(prev => ({ ...prev, contractedDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
              placeholder="Write Contract Price"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Developer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Developer</label>
          <div className="relative">
            <select
              value={contractData.developer}
              onChange={(e) => setContractData(prev => ({ ...prev, developer: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Developer</option>
              <option value="mountain-view">Mountain View</option>
              <option value="taj-misr">Taj Misr</option>
              <option value="reportage">Reportage Properties</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
          <div className="relative">
            <select
              value={contractData.project}
              onChange={(e) => setContractData(prev => ({ ...prev, project: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Developer</option>
              <option value="project1">Elaf Residence</option>
              <option value="project2">Mountain View Akiva</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Unit Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Number</label>
          <input
            type="text"
            value={contractData.unitNumber}
            onChange={(e) => setContractData(prev => ({ ...prev, unitNumber: e.target.value }))}
            placeholder="e.g. 150"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Unit Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type</label>
          <div className="relative">
            <select
              value={contractData.unitType}
              onChange={(e) => setContractData(prev => ({ ...prev, unitType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Unit Type</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="penthouse">Penthouse</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Unit Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Unit Area</label>
          <div className="relative">
            <input
              type="number"
              value={contractData.unitArea}
              onChange={(e) => setContractData(prev => ({ ...prev, unitArea: e.target.value }))}
              placeholder="150"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">m²</span>
          </div>
        </div>

        {/* Finishing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Finishing Type</label>
          <div className="relative">
            <select
              value={contractData.finishingType}
              onChange={(e) => setContractData(prev => ({ ...prev, finishingType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-gray-500"
            >
              <option value="">Select Unit Type</option>
              <option value="semi-finished">Semi-Finished</option>
              <option value="fully-finished">Fully Finished</option>
              <option value="core-shell">Core & Shell</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
          <div className="relative">
            <input
              type="date"
              value={contractData.deliveryDate}
              onChange={(e) => setContractData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-500"
              placeholder="Delivery Date"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Down Payment</label>
          <div className="relative">
            <input
              type="number"
              value={contractData.downPayment}
              onChange={(e) => setContractData(prev => ({ ...prev, downPayment: e.target.value }))}
              placeholder="ex: 5"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
          </div>
        </div>

        {/* Contract Unit Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contract Unit Price</label>
          <div className="relative">
            <input
              type="text"
              value={contractData.contractUnitPrice}
              onChange={(e) => setContractData(prev => ({ ...prev, contractUnitPrice: e.target.value }))}
              placeholder="e.g 12,000,000"
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">EGP</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => {
              if (currentStep === 'enter-details') {
                setCurrentStep('select-stage');
              } else {
                onClose();
              }
            }}
            className="p-2"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold">Change Deal Stage</h1>
          <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'select-stage' && renderStageSelection()}
          {currentStep === 'enter-details' && selectedStage === 'Reservation' && renderReservationForm()}
          {currentStep === 'enter-details' && selectedStage === 'Contract' && renderContractForm()}
        </div>

        {/* Footer */}
        {currentStep === 'enter-details' && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep('select-stage')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={selectedStage === 'Reservation' ? handleReservationSubmit : handleContractSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
