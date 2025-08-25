import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, X } from 'lucide-react';
import { useSignup } from '../../contexts/SignupContext';
import { Link } from 'react-router-dom';

export default function AccountCreationStep() {
  const { signupData, updateSignupData, nextStep, error, setError } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    updateSignupData({ [field]: value });
    setError(null);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    if (!signupData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!signupData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (signupData.email !== signupData.confirmEmail) {
      setError('Emails do not match');
      return false;
    }
    
    if (signupData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  const isEmailValid = signupData.email && /\S+@\S+\.\S+/.test(signupData.email);
  const isEmailMatch = signupData.confirmEmail && signupData.email === signupData.confirmEmail;
  const isPasswordValid = signupData.password.length >= 8;
  const isPasswordMatch = signupData.confirmPassword && signupData.password === signupData.confirmPassword;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link to="/" className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-lg font-semibold">Sign Up</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create an Account
          </h2>
          <p className="text-gray-500 mb-8">Let's get you set up.</p>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                />
                {isEmailValid && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Confirm Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={signupData.confirmEmail}
                  onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                  onBlur={() => handleBlur('confirmEmail')}
                  placeholder="Re-enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                />
                {isEmailMatch && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Create a password"
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
              {touched.password && signupData.password && !isPasswordValid && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  Your password must have at least 8 characters
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signupData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!signupData.name || !isEmailValid || !isEmailMatch || !isPasswordValid || !isPasswordMatch}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Next
            </button>

            {/* Sign In Link */}
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/signin" className="text-gray-900 font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
