import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Calculator, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  Calendar,
  Star,
  ArrowRight,
  Users,
  Target
} from 'lucide-react';

// Commission data interface
interface CommissionRate {
  Developer: string;
  Compound: string;
  'BR Percentage': number;
}

// Project interface for new launches
interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  description: string;
  image: string;
  startingPrice: number;
  unitsAvailable: number;
  deliveryDate: string;
  commissionRate: number;
  features: string[];
  status: 'launching' | 'pre-launch' | 'sold-out';
}

// Deal interface
interface Deal {
  id: string;
  projectName: string;
  developer: string;
  clientName: string;
  unitType: string;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'completed';
  date: string;
  location: string;
}

const Dashboard: React.FC = () => {
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // Load commission rates
  useEffect(() => {
    const loadCommissionRates = async () => {
      try {
        const response = await fetch('/commissions_data.json');
        const data = await response.json();
        setCommissionRates(data);
      } catch (error) {
        console.error('Error loading commission rates:', error);
      }
    };

    loadCommissionRates();
  }, []);

  // Load projects and deals
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load user-specific deals
        const { getUserDeals } = await import('../api/public');
        const userDeals = await getUserDeals();
        
        // Transform database deals to match our interface
        const transformedDeals: Deal[] = userDeals.map((deal: any) => ({
          id: deal.id,
          projectName: deal.project_name,
          developer: deal.developer_name,
          clientName: deal.client_name,
          unitType: '', // Not stored in current schema
          price: deal.deal_value,
          commissionRate: 0, // Not stored in current schema
          commissionAmount: 0, // Not stored in current schema
          status: deal.review_status === 'verified' ? 'confirmed' : 
                 deal.review_status === 'rejected' ? 'completed' : 'pending',
          date: new Date(deal.created_at).toISOString().split('T')[0],
          location: '' // Not stored in current schema
        }));

        // Mock projects data (this could also be made user-specific if needed)
        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'Mountain View Hyde Park',
            developer: 'Mountain View',
            location: 'New Cairo',
            description: 'Luxury residential compound with modern amenities and green spaces',
            image: '/api/placeholder/400/300',
            startingPrice: 2500000,
            unitsAvailable: 150,
            deliveryDate: '2026',
            commissionRate: 4.5,
            features: ['Swimming Pool', 'Gym', 'Landscaped Gardens', 'Security'],
            status: 'launching'
          },
          {
            id: '2',
            name: 'Aliva',
            developer: 'Mountain View',
            location: 'New Capital',
            description: 'Contemporary living with stunning city views and premium finishes',
            image: '/api/placeholder/400/300',
            startingPrice: 1800000,
            unitsAvailable: 200,
            deliveryDate: '2025',
            commissionRate: 4.5,
            features: ['City Views', 'Modern Design', 'Smart Home', 'Parking'],
            status: 'launching'
          },
          {
            id: '3',
            name: 'ZED West',
            developer: 'ORA',
            location: '6th October',
            description: 'Integrated urban development with commercial and residential spaces',
            image: '/api/placeholder/400/300',
            startingPrice: 1200000,
            unitsAvailable: 300,
            deliveryDate: '2027',
            commissionRate: 3.0,
            features: ['Commercial Hub', 'Residential Units', 'Shopping Mall', 'Office Spaces'],
            status: 'pre-launch'
          }
        ];

        setProjects(mockProjects);
        setDeals(transformedDeals);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to empty arrays if API fails
        setProjects([]);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'launching':
        return 'bg-blue-100 text-blue-800';
      case 'pre-launch':
        return 'bg-purple-100 text-purple-800';
      case 'sold-out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCommission = deals.reduce((sum, deal) => sum + deal.commissionAmount, 0);
  const pendingDeals = deals.filter(deal => deal.status === 'pending').length;
  const confirmedDeals = deals.filter(deal => deal.status === 'confirmed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/inventory"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Building2 className="h-4 w-4" />
            <span>View All Properties</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCommission)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Deals</p>
              <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Deals</p>
              <p className="text-2xl font-bold text-gray-900">{pendingDeals}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Launches</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Deals Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Deals</h2>
              <Link
                to="/deals"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {deals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">{deal.projectName}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)}`}>
                        {deal.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{deal.clientName} • {deal.unitType}</p>
                    <p className="text-sm text-gray-500">{deal.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(deal.price)}</p>
                    <p className="text-sm text-green-600 font-medium">
                      +{formatCurrency(deal.commissionAmount)} commission
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">New Launches</h2>
              <Link
                to="/projects"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.developer} • {project.location}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Bed className="h-4 w-4" />
                        <span>{project.unitsAvailable} units</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Ready {project.deliveryDate}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        {project.commissionRate}% commission
                      </p>
                    </div>
                    <Link
                      to={`/projects`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





