import React, { createContext, useContext, useState, useEffect } from 'react';

type SplashStep = 'loading' | 'welcome' | 'language' | 'complete';
type Language = 'en' | 'ar';

interface SplashContextType {
  currentStep: SplashStep;
  selectedLanguage: Language;
  isFirstVisit: boolean;
  nextStep: () => void;
  selectLanguage: (lang: Language) => void;
  skipSplash: () => void;
  completeSplash: () => void;
}

const SplashContext = createContext<SplashContextType | undefined>(undefined);

interface SplashProviderProps {
  children: React.ReactNode;
}

export function SplashProvider({ children }: SplashProviderProps) {
  const [currentStep, setCurrentStep] = useState<SplashStep>('loading');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisited');
    const savedLanguage = localStorage.getItem('preferredLanguage') as Language;
    
    console.log('Splash init - hasVisited:', hasVisited, 'savedLanguage:', savedLanguage);
    
    if (hasVisited) {
      setIsFirstVisit(false);
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      // Skip splash for returning users
      console.log('Returning user - skipping to complete in 1.5s');
      setTimeout(() => {
        console.log('Setting splash to complete');
        setCurrentStep('complete');
      }, 1500);
    } else {
      // First time visitor - show full flow
      console.log('First time visitor - showing welcome in 2s');
      setTimeout(() => {
        console.log('Setting splash to welcome');
        setCurrentStep('welcome');
      }, 2000);
    }
  }, []);

  const nextStep = () => {
    switch (currentStep) {
      case 'loading':
        setCurrentStep('welcome');
        break;
      case 'welcome':
        if (isFirstVisit) {
          setCurrentStep('language');
        } else {
          setCurrentStep('complete');
        }
        break;
      case 'language':
        setCurrentStep('complete');
        break;
    }
  };

  const selectLanguage = (lang: Language) => {
    setSelectedLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  const skipSplash = () => {
    setCurrentStep('complete');
  };

  const completeSplash = () => {
    console.log('Completing splash with language:', selectedLanguage);
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('preferredLanguage', selectedLanguage);
    setCurrentStep('complete');
  };

  return (
    <SplashContext.Provider
      value={{
        currentStep,
        selectedLanguage,
        isFirstVisit,
        nextStep,
        selectLanguage,
        skipSplash,
        completeSplash,
      }}
    >
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider');
  }
  return context;
}
