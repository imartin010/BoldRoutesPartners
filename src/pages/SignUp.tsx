import React from 'react';
import { SignupProvider, useSignup } from '../contexts/SignupContext';
import AccountCreationStep from '../components/signup/AccountCreationStep';
import PhoneNumberStep from '../components/signup/PhoneNumberStep';
import VerificationStep from '../components/signup/VerificationStep';
import CompanyDetailsStep from '../components/signup/CompanyDetailsStep';

function SignUpFlow() {
  const { currentStep } = useSignup();

  switch (currentStep) {
    case 'account':
      return <AccountCreationStep />;
    case 'phone':
      return <PhoneNumberStep />;
    case 'verification':
      return <VerificationStep />;
    case 'company':
      return <CompanyDetailsStep />;
    default:
      return <AccountCreationStep />;
  }
}

export default function SignUp() {
  return (
    <SignupProvider>
      <SignUpFlow />
    </SignupProvider>
  );
}
