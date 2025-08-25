import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSignup } from '../../contexts/SignupContext';
import { useToastTriggers } from '../../hooks/useToastTriggers';

export default function PhoneNumberStep() {
  const { signupData, updateSignupData, nextStep, previousStep, setIsLoading, setError } = useSignup();
  const { showError, showSuccess } = useToastTriggers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 3) {
      formatted = `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
    } else if (cleaned.length >= 2) {
      formatted = `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else if (cleaned.length >= 1) {
      formatted = `+${cleaned}`;
    }
    
    updateSignupData({ phoneNumber: formatted });
  };

  const handleSendCode = async () => {
    const phoneDigits = signupData.phoneNumber.replace(/\D/g, '');
    
    if (phoneDigits.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Simulate API call to send SMS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('SMS sent', 'Verification code sent to your phone');
      nextStep();
    } catch (error) {
      showError('Failed to send SMS', 'Please try again');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const isPhoneValid = signupData.phoneNumber.replace(/\D/g, '').length >= 10;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={previousStep} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">Mobile Number</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enter your phone number
          </h2>
          <p className="text-gray-500 mb-8">We'll send you a verification code</p>

          <div className="space-y-6">
            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={signupData.phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+20 10 1234 5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
              />
            </div>

            {/* Send Code Button */}
            <button
              onClick={handleSendCode}
              disabled={!isPhoneValid || isSubmitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
