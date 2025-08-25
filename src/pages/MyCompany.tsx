import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, MapPin, Phone, Mail, Globe, Users } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export default function MyCompany() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  // Mock company data
  const companyData = {
    name: 'Bold Routes Real Estate',
    type: 'Real Estate Brokerage',
    address: 'New Cairo, Cairo Governorate, Egypt',
    phone: '+201002275857',
    email: 'info@bold-routes.com',
    website: 'www.bold-routes.com',
    employees: '50-100',
    established: '2020',
    license: 'RE-2020-001234',
    description: 'Leading real estate brokerage specializing in premium properties in New Cairo and surrounding areas.'
  };

  const companyStats = [
    { label: 'Active Deals', value: '24' },
    { label: 'Total Commission', value: '2.4M EGP' },
    { label: 'Projects', value: '15+' },
    { label: 'Partners', value: '8' }
  ];

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
            <span className="text-gray-900">My Company</span>
          </div>
          <h1 className="text-lg lg:text-2xl font-semibold text-gray-900">My Company</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Company Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {companyData.name}
            </h2>
            <p className="text-gray-500">
              {companyData.type}
            </p>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {companyStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 lg:p-6 text-center">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm lg:text-base text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Company Details */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Company Information
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="text-gray-900">{companyData.address}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-900">{companyData.phone}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900">{companyData.email}</p>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Website</p>
                    <p className="text-gray-900">{companyData.website}</p>
                  </div>
                </div>

                {/* Employees */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Company Size</p>
                    <p className="text-gray-900">{companyData.employees} employees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">
                Additional Details
              </h3>
              
              <div className="space-y-4 lg:space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Established</p>
                  <p className="text-gray-900">{companyData.established}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">License Number</p>
                  <p className="text-gray-900">{companyData.license}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-900">{companyData.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
