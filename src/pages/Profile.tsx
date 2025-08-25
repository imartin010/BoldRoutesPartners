import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Camera, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useToastTriggers } from '../hooks/useToastTriggers';

export default function Profile() {
  const { user } = useAuthStore();
  const { showSuccess } = useToastTriggers();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Ahmed Sobhi',
    phone: user?.phone || '01154282183',
    email: user?.email || 'ahmed.sobhi@bold-routes.com',
    address: 'New Cairo, Cairo Governorate, Egypt',
    dateOfBirth: '1990-05-15',
    nationalId: '29005150123456',
    joinedDate: '2022-03-15'
  });

  const handleSave = () => {
    setIsEditing(false);
    showSuccess('Profile updated', 'Your profile information has been saved');
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

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
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4 mb-1">
              {profileData.name}
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
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.name}</p>
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
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.email}</p>
                    )}
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
                        value={profileData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {new Date(profileData.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>
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
                  <p className="text-gray-900">{profileData.nationalId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Member Since</p>
                  <p className="text-gray-900">
                    {new Date(profileData.joinedDate).toLocaleDateString()}
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
