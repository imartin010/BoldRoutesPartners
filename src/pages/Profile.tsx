import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Camera, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useToastTriggers } from '../hooks/useToastTriggers';
import { supabase } from '../lib/supabase';

interface UserProfile {
  full_name: string;
  phone: string;
  company_name: string;
  company_manpower: string;
  address: string;
  date_of_birth: string;
  national_id: string;
  joined_date: string;
}

export default function Profile() {
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToastTriggers();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile>({
    full_name: '',
    phone: '',
    company_name: '',
    company_manpower: '',
    address: '',
    date_of_birth: '',
    national_id: '',
    joined_date: ''
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          showError('Failed to load profile', 'Please try again');
          return;
        }

        if (data) {
          setProfileData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            company_name: data.company_name || '',
            company_manpower: data.company_manpower || '',
            address: data.address || '',
            date_of_birth: data.date_of_birth || '',
            national_id: data.national_id || '',
            joined_date: data.joined_date || ''
          });
        }
      } catch (error) {
        console.error('Profile load error:', error);
        showError('Failed to load profile', 'Please try again');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, showError]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsEditing(false);
      showSuccess('Profile updated', 'Your profile information has been saved');
    } catch (error) {
      console.error('Profile save error:', error);
      showError('Failed to save profile', 'Please try again');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md lg:max-w-4xl mx-auto bg-white min-h-screen lg:min-h-0 lg:my-6 lg:rounded-lg lg:shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <Link to="/more" className="p-2 lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center text-sm text-gray-500">
            <Link to="/more" className="hover:text-gray-700">More</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Profile</span>
          </div>
          <h1 className="text-lg lg:text-2xl font-semibold text-gray-900">Profile</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Profile Photo Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600">
                  {profileData.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4 mb-1">
              {profileData.full_name}
            </h2>
            <p className="text-gray-500">Partner</p>
          </div>

          {/* Profile Information */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Personal Information
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                {/* Name */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.full_name}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="text-gray-900">{user?.email || 'Not available'}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    {isEditing ? (
                      <textarea
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.address}</p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profileData.date_of_birth ? new Date(profileData.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Company Information
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Company Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.company_name || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Number of Agents</p>
                  {isEditing ? (
                    <select
                      value={profileData.company_manpower}
                      onChange={(e) => handleInputChange('company_manpower', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select number of agents</option>
                      <option value="1-5">1-5 agents</option>
                      <option value="6-10">6-10 agents</option>
                      <option value="11-20">11-20 agents</option>
                      <option value="21-50">21-50 agents</option>
                      <option value="50+">50+ agents</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.company_manpower || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Account Information
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">National ID</p>
                  <p className="text-gray-900">{profileData.national_id || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-gray-900">
                    {profileData.joined_date ? new Date(profileData.joined_date).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Status</p>
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
