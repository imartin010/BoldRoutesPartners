import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SignupData {
  // Step 1: Account creation
  name: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Mobile verification
  phoneNumber: string;
  verificationCode: string;
  isPhoneVerified: boolean;
  
  // Step 3: Company details
  companyName: string;
  companyManpower: string;
}

export type SignupStep = 'account' | 'phone' | 'verification' | 'company' | 'complete';

interface SignupContextType {
  currentStep: SignupStep;
  signupData: SignupData;
  updateSignupData: (data: Partial<SignupData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: SignupStep) => void;
  resetSignup: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

const initialSignupData: SignupData = {
  name: '',
  email: '',
  confirmEmail: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  verificationCode: '',
  isPhoneVerified: false,
  companyName: '',
  companyManpower: '',
};

interface SignupProviderProps {
  children: React.ReactNode;
}

export function SignupProvider({ children }: SignupProviderProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('account');
  const [signupData, setSignupData] = useState<SignupData>(initialSignupData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSignupData = useCallback((data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
  }, []);

  const stepOrder: SignupStep[] = ['account', 'phone', 'verification', 'company', 'complete'];

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

  const goToStep = useCallback((step: SignupStep) => {
    setCurrentStep(step);
  }, []);

  const resetSignup = useCallback(() => {
    setCurrentStep('account');
    setSignupData(initialSignupData);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <SignupContext.Provider
      value={{
        currentStep,
        signupData,
        updateSignupData,
        nextStep,
        previousStep,
        goToStep,
        resetSignup,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
}
