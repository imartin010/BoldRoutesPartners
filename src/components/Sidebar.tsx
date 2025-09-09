import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../contexts/SidebarContext';
import { UserMenu } from './UserMenu';
import { Home, Rocket, Building, Calculator, FileText, UserPlus, FileCheck, Info, Briefcase, TrendingUp, MoreHorizontal, LayoutDashboard, Building2 } from 'lucide-react';

export default function Sidebar() {
  const { isExpanded, setIsExpanded } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const baseNavLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/deals', label: 'My Deals', icon: Briefcase },
    { path: '/projects', label: 'Projects', icon: Building2 },
    { path: '/inventory', label: 'Inventory', icon: Building },
    { path: '/my-commissions', label: 'My Commission', icon: TrendingUp },
    { path: '/commissions', label: 'Commission Rates', icon: Calculator },
    { path: '/close-deal', label: 'Close a Deal', icon: FileText },
    { path: '/more', label: 'More', icon: MoreHorizontal },
  ];

  // Navigation items - no conditional items since all users are authenticated
  const navLinks = [
    ...baseNavLinks,
    { path: '/apply', label: 'Apply', icon: UserPlus },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <aside 
      className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:bg-brand-card lg:border-r lg:border-brand-border lg:shadow-elegant lg:transition-all lg:duration-300 lg:ease-in-out lg:z-50 ${
        isExpanded ? 'lg:w-64' : 'lg:w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      role="navigation"
      aria-label="Desktop navigation"
    >
      {/* Sidebar Content */}
      <div className="flex flex-col flex-1 min-h-0 pt-20">
        {/* Logo Section - Only show when expanded */}
        {isExpanded && (
          <div className="flex items-center justify-center py-6 px-4 transition-all duration-300">
            <Link 
              to="/" 
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-fg rounded-lg"
              aria-label="Bold Routes Partners home"
            >
              <img 
                src="/images/logo.png" 
                alt="Bold Routes Partners logo" 
                className="h-12 w-auto transition-all duration-300"
              />
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 pb-4 space-y-1 transition-all duration-300 ${isExpanded ? 'px-4' : 'px-2'}`}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link group/item flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-brand-fg text-brand-bg'
                    : 'text-brand-fg opacity-60 hover:opacity-100 hover:bg-brand-overlay'
                }`}
                title={!isExpanded ? link.label : undefined}
                aria-label={`Navigate to ${link.label} ${active ? '(current page)' : ''}`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors duration-200 flex-shrink-0 ${
                    active ? 'text-brand-bg' : 'text-brand-fg opacity-40 group-hover/item:opacity-100'
                  }`}
                  aria-hidden="true"
                />
                <span className={`ml-3 transition-all duration-300 whitespace-nowrap overflow-hidden ${
                  isExpanded ? 'opacity-100' : 'opacity-0'
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`pb-4 border-t border-brand-border pt-4 transition-all duration-300 ${isExpanded ? 'px-4' : 'px-2'}`}>
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
