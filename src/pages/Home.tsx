import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useNotificationPopup } from '../contexts/NotificationPopupContext';
import { useToastTriggers } from '../hooks/useToastTriggers';
import Card from '../components/Card';
import DealsChart from '../components/DealsChart';
import ProjectCard from '../components/ProjectCard';
import DashboardStat from '../components/DashboardStat';
import EmptyState from '../components/EmptyState';
import { Bell, Plus, Eye } from 'lucide-react';
import { formatCurrencyEGP } from '../utils/format';
import { createWelcomePopup } from '../utils/notificationPopups';

export default function Home() {
  const { user } = useAuthStore();
  const { showPopup } = useNotificationPopup();
  const { showSuccess } = useToastTriggers();

  // Mock user data - in real app this would come from API
  const hasDeals = user ? true : false; // Show populated state for logged in users
  const userEarnings = 234450000; // EGP from design
  
  // Mock deals data for chart
  const dealsData = [
    { month: 'Mar', deals: 15 },
    { month: 'Apr', deals: 25 },
    { month: 'May', deals: 35 },
    { month: 'Jun', deals: 20 },
    { month: 'Jul', deals: 99 }, // Peak month
    { month: 'Aug', deals: 45 },
    { month: 'Sep', deals: 30 }
  ];

  // Mock projects data
  const projects = [
    {
      title: 'Jarian in New Cairo',
      developer: 'Mountain View',
      commission: 2.7,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'
    },
    {
      title: 'Jarian in New Cairo',
      developer: 'Mountain View',
      commission: 2.7,
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop'
    },
    {
      title: 'Jarian in New Cairo',
      developer: 'Mountain View',
      commission: 2.7,
      image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400&h=300&fit=crop'
    }
  ];

  const handleWelcomeNewUser = () => {
    showPopup(createWelcomePopup(user?.name || 'Ahmed'));
  };

  const handleAddDeal = () => {
    showSuccess('Redirecting to deals', 'Taking you to create a new deal');
    // In real app, navigate to deal creation
  };

  // Show welcome popup for new users automatically
  useEffect(() => {
    if (user && !hasDeals) {
      const timer = setTimeout(() => {
        handleWelcomeNewUser();
      }, 2000); // Show after 2 seconds for new users
      
      return () => clearTimeout(timer);
    }
  }, [user, hasDeals]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button 
            onClick={handleWelcomeNewUser}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>

        {hasDeals ? (
          /* Populated Dashboard State */
          <div className="space-y-6">
            {/* Total Commission Card */}
            <Card className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <div className="mb-2">
                <span className="text-gray-300 text-sm">Total Commission</span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {formatCurrencyEGP(userEarnings)}
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardStat label="Contract" value="56" />
              <DashboardStat label="CIL" value="78" />
              <DashboardStat label="EOI" value="34" />
              <DashboardStat label="Reservation" value="84" />
            </div>

            {/* Deals Chart */}
            <DealsChart data={dealsData} />

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <Link 
                  to="/inventory"
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  View All
                  <Eye className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={index}
                    title={project.title}
                    developer={project.developer}
                    commission={project.commission}
                    image={project.image}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="space-y-6">
            {/* Empty Deals Section */}
            <Card className="p-8">
              <EmptyState
                title="No Deals yet"
                subtitle="Start by creating your first deal and enjoy the highest commission rates in the market."
                actionText="Add Deal"
                onAction={handleAddDeal}
              />
            </Card>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <Link 
                  to="/inventory"
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  View All
                  <Eye className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, index) => (
                  <ProjectCard
                    key={index}
                    title={project.title}
                    developer={project.developer}
                    commission={project.commission}
                    image={project.image}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
