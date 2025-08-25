import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  HelpCircle, 
  FileText,
  ChevronRight,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications,
          onChange: setNotifications
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          type: 'toggle',
          value: darkMode,
          onChange: setDarkMode
        },
        {
          icon: Globe,
          label: 'Language',
          type: 'link',
          path: '/language-selection',
          rightText: 'English'
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          icon: Shield,
          label: 'Biometric Authentication',
          type: 'toggle',
          value: biometric,
          onChange: setBiometric
        },
        {
          icon: Shield,
          label: 'Privacy Settings',
          type: 'link',
          path: '/privacy'
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          label: 'Help & Support',
          type: 'link',
          path: '/help'
        },
        {
          icon: FileText,
          label: 'Terms & Conditions',
          type: 'link',
          path: '/terms'
        },
        {
          icon: FileText,
          label: 'Privacy Policy',
          type: 'link',
          path: '/privacy-policy'
        }
      ]
    }
  ];

  const renderToggle = (value: boolean, onChange: (value: boolean) => void) => (
    <button
      onClick={() => onChange(!value)}
      className="p-1"
    >
      {value ? (
        <ToggleRight className="w-8 h-8 text-blue-600" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-gray-400" />
      )}
    </button>
  );

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
            <span className="text-gray-900">Settings</span>
          </div>
          <h1 className="text-lg lg:text-2xl font-semibold text-gray-900">Settings</h1>
          <div className="w-10"></div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {settingsSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-8">
                {/* Section Title */}
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6 px-2">
                  {section.title}
                </h2>

                {/* Section Items */}
                <div className="space-y-1 lg:space-y-2">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;

                  if (item.type === 'toggle') {
                    return (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-4 bg-white rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {item.label}
                          </span>
                        </div>
                        {renderToggle(item.value, item.onChange)}
                      </div>
                    );
                  }

                  if (item.type === 'link') {
                    return (
                      <Link
                        key={itemIndex}
                        to={item.path || '#'}
                        className="block p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.rightText && (
                              <span className="text-gray-500 text-sm">
                                {item.rightText}
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    );
                  }

                  return null;
                })}
                </div>
              </div>
            ))}
          </div>

          {/* App Version */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Bold Routes Partners
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Version 1.1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
