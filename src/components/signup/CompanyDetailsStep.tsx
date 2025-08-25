import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSignup } from '../../contexts/SignupContext';
import { useAuthStore } from '../../store/auth';
import { useToastTriggers } from '../../hooks/useToastTriggers';
import { useNavigate } from 'react-router-dom';

export default function CompanyDetailsStep() {
  const { signupData, updateSignupData, previousStep, setIsLoading, setError } = useSignup();
  const { login } = useAuthStore();
  const { showSuccess } = useToastTriggers();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    updateSignupData({ [field]: value });
  };

  const handleSkip = () => {
    handleSignUp(true);
  };

  const handleSignUp = async (skipCompanyDetails = false) => {
    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Simulate API call to create account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create user object
      const user = {
        id: Date.now().toString(),
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phoneNumber,
        companyName: skipCompanyDetails ? '' : signupData.companyName,
        companyManpower: skipCompanyDetails ? '' : signupData.companyManpower,
        isVerified: true,
      };

      // Log the user in
      login(user);
      
      showSuccess(
        'Account created successfully!', 
        'Welcome to Bold Routes Partners'
      );
      
      // Navigate to home page
      navigate('/');
      
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const isFormValid = signupData.companyName.trim() && signupData.companyManpower.trim();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={previousStep} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">Mobile Confirmation</h1>
        <button 
          onClick={handleSkip}
          className="text-gray-600 text-sm font-medium hover:text-gray-800"
          disabled={isSubmitting}
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tell us about your company
          </h2>
          <p className="text-gray-500 mb-8">Just a few details to get things started</p>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company name
              </label>
              <input
                type="text"
                value={signupData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="e.g. Bold Routes"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Company Manpower */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company manpower
              </label>
              <input
                type="number"
                value={signupData.companyManpower}
                onChange={(e) => handleInputChange('companyManpower', e.target.value)}
                placeholder="e.g. 150"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Sign Up Button */}
            <button
              onClick={() => handleSignUp(false)}
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
