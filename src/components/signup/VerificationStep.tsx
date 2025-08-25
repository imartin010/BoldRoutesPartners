import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSignup } from '../../contexts/SignupContext';
import { useToastTriggers } from '../../hooks/useToastTriggers';

export default function VerificationStep() {
  const { signupData, updateSignupData, nextStep, previousStep, setIsLoading } = useSignup();
  const { showError, showMobileConfirmed } = useToastTriggers();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(59);
  const [isVerifying, setIsVerifying] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last digit
    setCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeypadPress = (digit: string) => {
    const emptyIndex = code.findIndex(c => c === '');
    if (emptyIndex !== -1) {
      handleCodeInput(emptyIndex, digit);
    }
  };

  const handleBackspace = () => {
    const lastFilledIndex = code.findLastIndex(c => c !== '');
    if (lastFilledIndex !== -1) {
      const newCode = [...code];
      newCode[lastFilledIndex] = '';
      setCode(newCode);
      
      // Focus the cleared input
      const input = document.getElementById(`code-${lastFilledIndex}`);
      input?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      showError('Invalid code', 'Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setIsLoading(true);

    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, accept any 6-digit code
      updateSignupData({ 
        verificationCode: enteredCode, 
        isPhoneVerified: true 
      });
      
      showMobileConfirmed();
      nextStep();
    } catch (error) {
      showError('Verification failed', 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
    } finally {
      setIsVerifying(false);
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setTimeLeft(59);
    setCode(['', '', '', '', '', '']);
    // In real app, would make API call to resend SMS
  };

  const isCodeComplete = code.every(digit => digit !== '');
  const maskedPhone = signupData.phoneNumber.slice(0, -3) + '***';

  const keypadNumbers = [
    ['7', '7', '4', '3', '1'],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={previousStep} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">Mobile Confirmation</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            We just send you an SMS
          </h2>
          <p className="text-gray-500 mb-8">
            Enter the security code we sent to <br />
            <span className="font-medium">{maskedPhone}</span>
          </p>

          {/* Code Input Grid */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleCodeInput(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    const prevInput = document.getElementById(`code-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
                className="w-full h-12 text-center text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={1}
              />
            ))}
          </div>

          {/* Custom Keypad */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[7, 7, 4, 3, 1, 3].map((num, index) => (
              <button
                key={index}
                onClick={() => handleKeypadPress(num.toString())}
                className="h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-lg transition-colors"
                disabled={isVerifying}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Resend Link */}
          <div className="text-center mb-6">
            {timeLeft > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend code in {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                {String(timeLeft % 60).padStart(2, '0')}
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-gray-900 text-sm font-medium hover:underline"
              >
                Didn't receive a code? Resend
              </button>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isCodeComplete || isVerifying}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
