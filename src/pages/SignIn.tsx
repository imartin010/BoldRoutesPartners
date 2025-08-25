import React from 'react';
import { SigninProvider, useSignin } from '../contexts/SigninContext';
import LoginStep from '../components/signin/LoginStep';
import MobileVerifyStep from '../components/signin/MobileVerifyStep';
import SmsVerifyStep from '../components/signin/SmsVerifyStep';
import PasswordResetStep from '../components/signin/PasswordResetStep';

function SignInFlow() {
  const { currentStep, currentFlow } = useSignin();

  switch (currentStep) {
    case 'login':
      return <LoginStep />;
    case 'mobile-verify':
      return <MobileVerifyStep />;
    case 'sms-verify':
      return <SmsVerifyStep />;
    case 'password-reset':
      return <PasswordResetStep />;
    default:
      return <LoginStep />;
  }
}

export default function SignIn() {
  return (
    <SigninProvider>
      <SignInFlow />
    </SigninProvider>
  );
}
