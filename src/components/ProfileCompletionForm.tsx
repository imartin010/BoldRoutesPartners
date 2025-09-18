import React, { useState } from 'react';
import { User, Building2, Phone, MapPin, Calendar, CreditCard, Check, Building, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToastTriggers } from '@/hooks/useToastTriggers';

interface ProfileData {
  full_name: string;
  phone: string;
  company_name: string;
  company_manpower: string;
  address: string;
  is_bold_routes_member: boolean;
  bold_routes_member_id: string;
  employee_position: string;
  company_registration_status: string;
}

interface ProfileCompletionFormProps {
  onComplete: () => void;
}

export default function ProfileCompletionForm({ onComplete }: ProfileCompletionFormProps) {
  const { showSuccess, showError } = useToastTriggers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    company_name: '',
    company_manpower: '',
    address: '',
    is_bold_routes_member: false,
    bold_routes_member_id: '',
    employee_position: '',
    company_registration_status: 'not_registered'
  });

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (formData.is_bold_routes_member) {
        // Existing member - just update profile
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            ...formData,
            profile_completed: true,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } else {
        // New member - create company and member record
        const { data: result, error: functionError } = await supabase
          .rpc('create_company_and_member', {
            p_company_name: formData.company_name,
            p_company_size: formData.company_manpower,
            p_user_id: user.id,
            p_position: formData.employee_position
          });

        if (functionError) throw functionError;

        // Update profile with generated member ID
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            ...formData,
            bold_routes_member_id: result.member_id,
            profile_completed: true,
            updated_at: new Date().toISOString()
          });

        if (profileError) throw profileError;
      }

      showSuccess('Profile completed successfully!', 'Welcome to Bold Routes Partners');
      onComplete();
    } catch (error) {
      console.error('Profile completion error:', error);
      showError('Failed to save profile', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.full_name.trim() !== '' && formData.phone.trim() !== '';
      case 2:
        if (formData.is_bold_routes_member) {
          return formData.bold_routes_member_id.trim() !== '';
        } else {
          return formData.company_name.trim() !== '' && formData.employee_position.trim() !== '';
        }
      case 3:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-black rounded-full flex items-center justify-center mb-4">
            <img 
              src="/images/logo.png" 
              alt="Bold Routes" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.textContent = 'BR';
              }}
            />
            <span className="text-white font-bold text-xl hidden">BR</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us personalize your experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+20 123 456 7890"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bold Routes Membership</h2>
              <p className="text-gray-600 mb-6">Are you already registered with Bold Routes Partners?</p>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Are you already registered with Bold Routes Partners? *</label>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="is_bold_routes_member"
                        checked={formData.is_bold_routes_member === true}
                        onChange={() => handleInputChange('is_bold_routes_member', true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">Yes, I am already a member</span>
                    </label>
                    <label className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="is_bold_routes_member"
                        checked={formData.is_bold_routes_member === false}
                        onChange={() => handleInputChange('is_bold_routes_member', false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">No, I want to register as a new member</span>
                    </label>
                  </div>
                </div>

                {formData.is_bold_routes_member ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bold Routes Member ID *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.bold_routes_member_id}
                        onChange={(e) => handleInputChange('bold_routes_member_id', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter your Bold Routes Member ID"
                        required
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Please provide your existing Bold Routes Member ID</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Enter your company name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Position *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.employee_position}
                          onChange={(e) => handleInputChange('employee_position', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., Sales Manager, Director, CEO"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Size (Number of Employees)
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.company_manpower}
                          onChange={(e) => handleInputChange('company_manpower', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Complete</h2>
              <p className="text-gray-600 mb-6">Review your information before submitting</p>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.full_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.phone}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formData.address || 'Not provided'}</dd>
                  </div>
                </div>

                <h3 className="text-lg font-medium text-gray-900">Bold Routes Membership</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Member Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formData.is_bold_routes_member ? 'Existing Member' : 'New Member Registration'}
                    </dd>
                  </div>
                  {formData.is_bold_routes_member ? (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Member ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.bold_routes_member_id}</dd>
                    </div>
                  ) : (
                    <>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.company_name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Position</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.employee_position}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Company Size</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formData.company_manpower || 'Not specified'}</dd>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Profile</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
