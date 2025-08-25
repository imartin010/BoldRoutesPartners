import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Home, Rocket, Building, Calculator, FileText, UserPlus, FileCheck, MoreHorizontal } from 'lucide-react';
import NetworkStatus from './NetworkStatus';

export default function BottomNav() {
  const { user } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/deals', label: 'Deals', icon: FileText },
    { path: '/my-commissions', label: 'Commission', icon: Calculator },
    { path: '/more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-card/95 backdrop-blur-sm border-t border-brand-border shadow-elegant-xl z-50"
      role="navigation"
      aria-label="Mobile navigation"
    >
      {/* Network Status Indicator */}
      <div className="absolute top-1 right-2" aria-hidden="true">
        <NetworkStatus className="text-xs" />
      </div>
      
      <div className="grid grid-cols-4 h-16 px-1" role="tablist">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link flex flex-col items-center justify-center px-1 py-2 rounded-lg mx-0.5 transition-all duration-200 ${
                active 
                  ? 'nav-link-active text-brand-fg bg-brand-muted' 
                  : 'text-brand-fg opacity-60 hover:opacity-100 hover:bg-brand-overlay'
              }`}
              role="tab"
              aria-selected={active}
              aria-label={`Navigate to ${item.label} ${active ? '(current page)' : ''}`}
            >
              <Icon 
                size={active ? 20 : 18} 
                className={`mb-0.5 transition-all duration-200 ${active ? 'stroke-2' : 'stroke-1'}`}
                aria-hidden="true"
              />
              <span className={`text-xs leading-tight transition-all duration-200 ${
                active ? 'font-semibold text-brand-fg' : 'font-medium text-brand-fg'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
