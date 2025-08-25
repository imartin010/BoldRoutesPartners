import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useToastTriggers } from '../hooks/useToastTriggers';

type Language = 'English' | 'العربية';

interface LanguageOption {
  code: string;
  name: Language;
  flag: string;
}

export default function LanguageSelection() {
  const navigate = useNavigate();
  const { showSuccess } = useToastTriggers();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');

  const languages: LanguageOption[] = [
    {
      code: 'US',
      name: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'AR',
      name: 'العربية',
      flag: '🇸🇦'
    }
  ];

  const handleSave = () => {
    // Save language preference to localStorage
    localStorage.setItem('appLanguage', selectedLanguage);
    
    showSuccess('Language updated', `App language changed to ${selectedLanguage}`);
    navigate('/more');
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md lg:max-w-2xl mx-auto bg-white min-h-screen lg:min-h-0 lg:my-6 lg:rounded-lg lg:shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <Link to="/more" className="p-2 lg:hidden">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          {/* Desktop breadcrumb */}
          <div className="hidden lg:flex items-center text-sm text-gray-500">
            <Link to="/more" className="hover:text-gray-700">More</Link>
            <span className="mx-2">/</span>
            <Link to="/settings" className="hover:text-gray-700">Settings</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Language</span>
          </div>
          <h1 className="text-lg lg:text-2xl font-semibold text-gray-900">App Language</h1>
          <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Language</h2>
            <p className="text-gray-500">Choose your preferred language to continue</p>
          </div>

          {/* Language Options */}
          <div className="space-y-3 mb-8">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.name)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedLanguage === language.name
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Flag/Code */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700">
                        {language.code}
                      </span>
                    </div>
                    
                    {/* Language Name */}
                    <span className="font-medium text-gray-900">
                      {language.name}
                    </span>
                  </div>
                  
                  {/* Check Mark */}
                  {selectedLanguage === language.name && (
                    <Check className="w-6 h-6 text-gray-900" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
