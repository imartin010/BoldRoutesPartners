import { Globe, Check } from 'lucide-react';
import { useSplash } from '../../contexts/SplashContext';

export default function LanguageSplash() {
  const { selectedLanguage, selectLanguage, completeSplash } = useSplash();

  const languages = [
    { code: 'en', label: 'English', flag: 'US', native: 'English' },
    { code: 'ar', label: 'Arabic', flag: 'AR', native: 'العربية' }
  ];

  const handleLanguageSelect = (langCode: 'en' | 'ar') => {
    selectLanguage(langCode);
  };

  const handleContinue = () => {
    completeSplash();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
          {/* Diagonal lines pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalLines" patternUnits="userSpaceOnUse" width="40" height="40">
                <path d="M0,40 L40,0" stroke="white" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-8 text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <Globe className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Select Language</h1>
        
        {/* Subtitle */}
        <p className="text-gray-300 text-sm mb-12 max-w-sm">
          Choose your preferred language to continue
        </p>

        {/* Language options */}
        <div className="w-full max-w-sm space-y-3 mb-12">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code as 'en' | 'ar')}
              className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                selectedLanguage === lang.code
                  ? 'border-white bg-gray-800 text-white'
                  : 'border-gray-600 bg-transparent text-gray-300 hover:border-gray-400 hover:bg-gray-900'
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg font-medium mr-3">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{lang.label}</div>
                  <div className="text-sm text-gray-400">{lang.native}</div>
                </div>
              </div>
              
              {selectedLanguage === lang.code && (
                <Check className="w-5 h-5 text-white" />
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selectedLanguage}
          className="w-full max-w-xs bg-white text-black py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
