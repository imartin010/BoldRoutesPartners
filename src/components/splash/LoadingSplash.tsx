export default function LoadingSplash() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="loadingLines" patternUnits="userSpaceOnUse" width="60" height="60">
              <path d="M0,60 L60,0" stroke="white" strokeWidth="0.5" opacity="0.4"/>
              <path d="M20,60 L60,20" stroke="white" strokeWidth="0.3" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loadingLines)" />
        </svg>
        
        {/* Animated sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 transform -skew-x-12 animate-pulse duration-2000"></div>
      </div>
      
      {/* Loading content */}
      <div className="relative text-center">
        {/* Main loading indicator */}
        <div className="mb-8">
          <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>
        
        {/* Optional: Brand hint */}
        <div className="text-gray-500 text-sm font-medium tracking-widest uppercase">
          Bold Routes
        </div>
      </div>
    </div>
  );
}
