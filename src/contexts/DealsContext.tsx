import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Deal {
  id: string;
  clientName: string;
  developer: string;
  project: string;
  unitNumber: string;
  unitType: string;
  unitArea: number;
  finishingType: string;
  contractDate: string;
  deliveryDate: string;
  downPayment: number;
  contractPrice: number;
  status: 'Contract' | 'CIL' | 'EOI' | 'Reservation';
  createdAt: string;
  leadId?: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  paymentPlan?: {
    downpaymentPercentage: number;
    installmentYears: number;
    installmentFrequency: 'monthly' | 'quarterly' | 'yearly';
    notes?: string;
  };
  totalPaid?: number;
  paymentStatus?: 'pending' | 'in_progress' | 'ready_to_claim' | 'claimed';
}

export interface DealFormData {
  // Step 1: Deal Type
  dealType: 'Contract' | 'Reservation' | 'EOI' | 'CIL' | '';
  
  // Step 2: Contract Details
  contractedDate: string;
  developer: string;
  project: string;
  unitNumber: string;
  unitType: string;
  unitArea: number;
  finishingType: string;
  deliveryDate: string;
  downPayment: number;
  contractPrice: number;
  
  // Step 3: Lead Selection/Creation
  selectedLead: any | null;
  newLead: {
    name: string;
    phoneNumber: string;
  };
  
  // Step 4: Attachments
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    file: File | null;
  }>;
}

export type DealStep = 'type' | 'details' | 'lead' | 'attachments' | 'complete';

interface DealsContextType {
  deals: Deal[];
  currentStep: DealStep;
  formData: DealFormData;
  updateFormData: (data: Partial<DealFormData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: DealStep) => void;
  resetForm: () => void;
  createDeal: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const DealsContext = createContext<DealsContextType | undefined>(undefined);

const initialFormData: DealFormData = {
  dealType: '',
  contractedDate: '',
  developer: '',
  project: '',
  unitNumber: '',
  unitType: '',
  unitArea: 0,
  finishingType: '',
  deliveryDate: '',
  downPayment: 0,
  contractPrice: 0,
  selectedLead: null,
  newLead: {
    name: '',
    phoneNumber: '',
  },
  attachments: [],
};

// Mock deals data
const mockDeals: Deal[] = [
  {
    id: '1',
    clientName: 'Ayman Mahmoud Khaled',
    developer: 'Mountain View',
    project: 'South Mid',
    unitNumber: 'SM-101',
    unitType: 'Apartment',
    unitArea: 120,
    finishingType: 'Semi-Finished',
    contractDate: '2024-03-15',
    deliveryDate: '2025-12-31',
    downPayment: 500000,
    contractPrice: 35000000,
    status: 'Contract',
    createdAt: '2024-03-15',
    attachments: [],
  },
  {
    id: '2',
    clientName: 'Shokry Mokhtar Hassan',
    developer: 'Mountain View',
    project: 'Aliva',
    unitNumber: 'AL-205',
    unitType: 'Villa',
    unitArea: 250,
    finishingType: 'Fully Finished',
    contractDate: '2024-03-10',
    deliveryDate: '2025-06-30',
    downPayment: 1000000,
    contractPrice: 45000000,
    status: 'CIL',
    createdAt: '2024-03-10',
    attachments: [],
  },
];

interface DealsProviderProps {
  children: React.ReactNode;
}

export function DealsProvider({ children }: DealsProviderProps) {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [currentStep, setCurrentStep] = useState<DealStep>('type');
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = useCallback((data: Partial<DealFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const stepOrder: DealStep[] = ['type', 'details', 'lead', 'attachments', 'complete'];

  const nextStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: DealStep) => {
    setCurrentStep(step);
  }, []);

  const resetForm = useCallback(() => {
    setCurrentStep('type');
    setFormData(initialFormData);
    setError(null);
  }, []);

  const createDeal = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDeal: Deal = {
        id: Date.now().toString(),
        clientName: formData.selectedLead?.name || formData.newLead.name,
        developer: formData.developer,
        project: formData.project,
        unitNumber: formData.unitNumber,
        unitType: formData.unitType,
        unitArea: formData.unitArea,
        finishingType: formData.finishingType,
        contractDate: formData.contractedDate,
        deliveryDate: formData.deliveryDate,
        downPayment: formData.downPayment,
        contractPrice: formData.contractPrice,
        status: formData.dealType as Deal['status'],
        createdAt: new Date().toISOString(),
        attachments: formData.attachments.map(att => ({
          id: att.id,
          name: att.name,
          type: att.type,
          url: `/uploads/${att.name}`, // Mock URL
        })),
      };

      setDeals(prev => [newDeal, ...prev]);
      setCurrentStep('complete');
    } catch (error) {
      setError('Failed to create deal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <DealsContext.Provider
      value={{
        deals,
        currentStep,
        formData,
        updateFormData,
        nextStep,
        previousStep,
        goToStep,
        resetForm,
        createDeal,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  const context = useContext(DealsContext);
  if (context === undefined) {
    throw new Error('useDeals must be used within a DealsProvider');
  }
  return context;
}
