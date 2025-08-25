import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useSignin } from '../../contexts/SigninContext';
import { useAuthStore } from '../../store/auth';
import { useToastTriggers } from '../../hooks/useToastTriggers';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginStep() {
  const { signinData, updateSigninData, nextStep, setFlow, setIsLoading, setError } = useSignin();
  const { login } = useAuthStore();
  const { showSuccess, showError } = useToastTriggers();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    updateSigninData({ [field]: value });
    setError(null);
  };

  const handleForgotPassword = () => {
    setFlow('forgot-password');
  };

  const handleSignIn = async () => {
    if (!signinData.emailOrPhone.trim()) {
      setError('Email or phone number is required');
      return;
    }
    
    if (!signinData.password.trim()) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Simulate API call to authenticate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, check if it's a known email/phone
      const isKnownUser = signinData.emailOrPhone.includes('ahmed.sobhi') || 
                         signinData.emailOrPhone.includes('+20');
      
      if (isKnownUser) {
        // Simulate 2FA requirement for existing users
        updateSigninData({ phoneNumber: '+20 10 1234 5678' });
        nextStep(); // Go to mobile verification
      } else {
        // Direct login for demo purposes
        const user = {
          id: '1',
          name: 'Ahmed Mohamed Sobhi',
          email: signinData.emailOrPhone,
          phone: '+20 10 1234 5678',
          companyName: 'Mora Estate',
          companyManpower: '80',
          isVerified: true,
        };

        login(user);
        showSuccess('Welcome back!', 'Successfully signed in');
        navigate('/');
      }
    } catch (error) {
      showError('Sign in failed', 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const isFormValid = signinData.emailOrPhone.trim() && signinData.password.trim();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link to="/" className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">Sign In</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 mb-8">Sign in to stay connected and in control</p>

          <div className="space-y-6">
            {/* Email/Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email / Phone number
              </label>
              <input
                type="text"
                value={signinData.emailOrPhone}
                onChange={(e) => handleInputChange('emailOrPhone', e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signinData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
