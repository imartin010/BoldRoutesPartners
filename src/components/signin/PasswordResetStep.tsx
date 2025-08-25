import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useSignin } from '../../contexts/SigninContext';
import { useAuthStore } from '../../store/auth';
import { useToastTriggers } from '../../hooks/useToastTriggers';
import { useNavigate } from 'react-router-dom';

export default function PasswordResetStep() {
  const { signinData, updateSigninData, previousStep, setIsLoading, setError } = useSignin();
  const { login } = useAuthStore();
  const { showSuccess } = useToastTriggers();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    updateSigninData({ [field]: value });
    setError(null);
  };

  const validateForm = (): boolean => {
    if (signinData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (signinData.newPassword !== signinData.confirmNewPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      // Simulate API call to change password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Auto-login after successful password change
      const user = {
        id: '1',
        name: 'Ahmed Mohamed Sobhi',
        email: 'ahmed.sobhi.018@gmail.com',
        phone: signinData.phoneNumber,
        companyName: 'Mora Estate',
        companyManpower: '80',
        isVerified: true,
      };

      login(user);
      showSuccess('Password changed successfully!', 'You are now signed in');
      navigate('/');
      
    } catch (error) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const isFormValid = signinData.newPassword.length >= 8 && 
                     signinData.newPassword === signinData.confirmNewPassword;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={previousStep} className="p-2">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold">Sign In</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Password
          </h2>
          <p className="text-gray-500 mb-8">Let's Secure Your Account</p>

          <div className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signinData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={signinData.confirmNewPassword}
                  onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
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

            {/* Change Password Button */}
            <button
              onClick={handleChangePassword}
              disabled={!isFormValid || isSubmitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Changing Password...
                </div>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
