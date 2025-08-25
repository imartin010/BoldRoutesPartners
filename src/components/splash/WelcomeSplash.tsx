import { useSplash } from '../../contexts/SplashContext';
import { Link } from 'react-router-dom';

export default function WelcomeSplash() {
  const { nextStep, isFirstVisit } = useSplash();

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
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 sm:px-8 text-center animate-fade-in">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/images/logo.png" 
            alt="Bold Routes Partners" 
            className="h-20 w-auto mx-auto mb-6"
            onError={(e) => {
              // Fallback if logo fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback text logo */}
          <div className="hidden">
            <div className="text-2xl font-bold mb-2">BOLD ROUTES</div>
            <div className="text-lg text-gray-300">Partners</div>
          </div>
        </div>

        {/* Brand text */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold mb-1">
            BOLD ROUTES <span className="text-gray-300">| Partners</span>
          </h1>
        </div>

        {/* Tagline */}
        <div className="mb-12 max-w-sm">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Powering Bold Partnerships
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Join our trusted network, manage your routes, and grow your business with confidence.
          </p>
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-xs space-y-4">
          <Link
            to="/signup"
            className="block w-full bg-white text-black py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-gray-100 active:scale-95 text-center"
          >
            Create account
          </Link>
          
          <Link
            to="/signin"
            className="block w-full bg-transparent border border-gray-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 hover:bg-gray-800 active:scale-95 text-center"
          >
            Sign In
          </Link>
        </div>

        {/* Skip option for returning users */}
        {!isFirstVisit && (
          <button
            onClick={nextStep}
            className="mt-8 text-gray-400 text-sm underline hover:text-gray-300 transition-colors"
          >
            Continue to app
          </button>
        )}
      </div>
    </div>
  );
}
