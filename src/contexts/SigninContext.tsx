import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SigninData {
  // Step 1: Login credentials
  emailOrPhone: string;
  password: string;
  
  // Step 2: Mobile verification (for existing users)
  phoneNumber: string;
  verificationCode: string;
  
  // Step 3: Password reset
  newPassword: string;
  confirmNewPassword: string;
}

export type SigninStep = 'login' | 'mobile-verify' | 'sms-verify' | 'password-reset' | 'complete';
export type SigninFlow = 'login' | 'forgot-password';

interface SigninContextType {
  currentStep: SigninStep;
  currentFlow: SigninFlow;
  signinData: SigninData;
  updateSigninData: (data: Partial<SigninData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: SigninStep) => void;
  setFlow: (flow: SigninFlow) => void;
  resetSignin: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const SigninContext = createContext<SigninContextType | undefined>(undefined);

const initialSigninData: SigninData = {
  emailOrPhone: '',
  password: '',
  phoneNumber: '',
  verificationCode: '',
  newPassword: '',
  confirmNewPassword: '',
};

interface SigninProviderProps {
  children: React.ReactNode;
}

export function SigninProvider({ children }: SigninProviderProps) {
  const [currentStep, setCurrentStep] = useState<SigninStep>('login');
  const [currentFlow, setCurrentFlow] = useState<SigninFlow>('login');
  const [signinData, setSigninData] = useState<SigninData>(initialSigninData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSigninData = useCallback((data: Partial<SigninData>) => {
    setSigninData(prev => ({ ...prev, ...data }));
  }, []);

  const loginStepOrder: SigninStep[] = ['login', 'mobile-verify', 'sms-verify', 'complete'];
  const forgotPasswordStepOrder: SigninStep[] = ['mobile-verify', 'sms-verify', 'password-reset', 'complete'];

  const nextStep = useCallback(() => {
    const stepOrder = currentFlow === 'login' ? loginStepOrder : forgotPasswordStepOrder;
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  }, [currentStep, currentFlow]);

  const previousStep = useCallback(() => {
    const stepOrder = currentFlow === 'login' ? loginStepOrder : forgotPasswordStepOrder;
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  }, [currentStep, currentFlow]);

  const goToStep = useCallback((step: SigninStep) => {
    setCurrentStep(step);
  }, []);

  const setFlow = useCallback((flow: SigninFlow) => {
    setCurrentFlow(flow);
    if (flow === 'login') {
      setCurrentStep('login');
    } else {
      setCurrentStep('mobile-verify');
    }
  }, []);

  const resetSignin = useCallback(() => {
    setCurrentStep('login');
    setCurrentFlow('login');
    setSigninData(initialSigninData);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <SigninContext.Provider
      value={{
        currentStep,
        currentFlow,
        signinData,
        updateSigninData,
        nextStep,
        previousStep,
        goToStep,
        setFlow,
        resetSignin,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </SigninContext.Provider>
  );
}

export function useSignin() {
  const context = useContext(SigninContext);
  if (context === undefined) {
    throw new Error('useSignin must be used within a SigninProvider');
  }
  return context;
}
