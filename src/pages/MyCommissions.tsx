import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { ChevronDown, ChevronRight, ArrowLeft, DollarSign } from 'lucide-react';
import { formatCurrencyEGP } from '../utils/format';
import CommissionErrorModal from '../components/CommissionErrorModal';

type TabType = 'My Commission' | 'Market Commission';
type DealFilter = 'All' | 'Collected' | 'Partially Collected' | 'Pending';

interface Deal {
  id: string;
  number: string;
  collected: number;
  total: number;
  status: 'Collected' | 'Partially Collected' | 'Pending';
}

interface Transaction {
  id: string;
  number: string;
  amount: number;
  date: string;
}

interface MarketProject {
  id: string;
  name: string;
  developer: string;
  image: string;
  commission: number;
}

export default function MyCommissions() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('My Commission');
  const [dealFilter, setDealFilter] = useState<DealFilter>('All');
  const [showTransactions, setShowTransactions] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Monthly');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Mock commission data
  const commissionData = {
    total: 234450000,
    collected: 200450000,
    remaining: 34450000,
    percentage: 70
  };

  // Mock deals data
  const deals: Deal[] = [
    { id: '4132', number: 'Deal #4132', collected: 70000, total: 70000, status: 'Collected' },
    { id: '4133', number: 'Deal #4132', collected: 60000, total: 70000, status: 'Partially Collected' },
    { id: '4134', number: 'Deal #4132', collected: 60000, total: 70000, status: 'Partially Collected' },
    { id: '4135', number: 'Deal #4132', collected: 0, total: 70000, status: 'Pending' },
  ];

  // Mock transactions data
  const transactions: Transaction[] = [
    { id: '6789', number: '#6789', amount: 55000, date: '15 Oct 2025' },
    { id: '9876', number: '#9876', amount: 52000, date: '30 Nov 2025' },
    { id: '5432', number: '#5432', amount: 21000, date: '12 Dec 2025' },
    { id: '3210', number: '#3210', amount: 43000, date: '05 Jan 2026' },
  ];

  // Mock market projects data
  const marketProjects: MarketProject[] = [
    { id: '1', name: 'Jarjan', developer: 'Mountain View', image: '/api/placeholder/50/50', commission: 2.7 },
    { id: '2', name: 'Karma', developer: 'Palm Hills', image: '/api/placeholder/50/50', commission: 3.1 },
    { id: '3', name: 'Hacienda Bay', developer: 'Palm Hills Developments', image: '/api/placeholder/50/50', commission: 4.0 },
    { id: '4', name: 'New Cairo', developer: 'Madaar', image: '/api/placeholder/50/50', commission: 2.5 },
    { id: '5', name: 'Zed East', developer: 'Ora Developers', image: '/api/placeholder/50/50', commission: 3.3 },
    { id: '6', name: 'Almasar Heights', developer: 'Al Noor Real Estate Group', image: '/api/placeholder/50/50', commission: 3.0 },
  ];

  const filteredDeals = deals.filter(deal => {
    if (dealFilter === 'All') return true;
    return deal.status === dealFilter;
  });

  const getProgressWidth = (collected: number, total: number) => {
    return Math.min((collected / total) * 100, 100);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Collected': return 'bg-green-500';
      case 'Partially Collected': return 'bg-blue-500';
      case 'Pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <DollarSign className="w-10 h-10 text-gray-700" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        You don't have any commissions yet
      </h3>
      <p className="text-gray-500 mb-8 max-w-sm">
        Start closing deals to earn commissions based on project rates.
      </p>
      <Link
        to="/deals/create"
        className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        Create Deal
      </Link>
    </div>
  );

  const renderMyCommissionTab = () => {
    // Check if user has commissions
    const hasCommissions = user && commissionData.total > 0;

    if (!hasCommissions) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6">
        {/* Time Filter and Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-gray-900"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${commissionData.percentage}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{commissionData.percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Commission */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-2">Total Commission</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {formatCurrencyEGP(commissionData.total)} <span className="text-lg font-normal text-gray-500">Egp</span>
          </h2>
        </div>

        {/* Collected vs Remaining */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-gray-500 text-sm mb-2">Collected</p>
            <p className="text-2xl font-bold text-teal-600">
              {formatCurrencyEGP(commissionData.collected)} <span className="text-sm font-normal text-gray-500">Egp</span>
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-2">Remaining</p>
            <p className="text-2xl font-bold text-orange-500">
              {formatCurrencyEGP(commissionData.remaining)} <span className="text-sm font-normal text-gray-500">Egp</span>
            </p>
          </div>
        </div>

        {/* Deals Section */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Deals</h3>
          
          {/* Deal Filters */}
          <div className="flex space-x-2 mb-6 overflow-x-auto">
            {(['All', 'Collected', 'Partially Collected', 'Pending'] as DealFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setDealFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  dealFilter === filter
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Deal List */}
          <div className="space-y-4">
            {filteredDeals.map((deal) => (
              <Link
                key={deal.id}
                to={`/deals/${deal.id}`}
                className="block bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{deal.number}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatCurrencyEGP(deal.collected)} of {formatCurrencyEGP(deal.total)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(deal.status)}`}
                    style={{ width: `${getProgressWidth(deal.collected, deal.total)}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowTransactions(true)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              View All Transactions
            </button>
            
            <button
              onClick={() => setShowErrorModal(true)}
              className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
            >
              Test Network Error
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMarketCommissionTab = () => (
    <div className="space-y-4">
      {marketProjects.map((project) => (
        <div key={project.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            <span className="text-xs text-gray-500">IMG</span>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.developer}</p>
          </div>
          
          <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium">
            {project.commission} %
          </div>
        </div>
      ))}
    </div>
  );

  const renderTransactionsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setShowTransactions(false)}
            className="p-2"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <div className="w-10"></div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{transaction.number}</h3>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrencyEGP(transaction.amount)} <span className="text-sm font-normal text-gray-500">Egp</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Commission</h1>
          
          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            {(['My Commission', 'Market Commission'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'My Commission' && renderMyCommissionTab()}
          {activeTab === 'Market Commission' && renderMarketCommissionTab()}
        </div>
      </div>

      {/* Transactions Modal */}
      {showTransactions && renderTransactionsModal()}

      {/* Network Error Modal */}
      <CommissionErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={() => setShowErrorModal(false)}
      />
    </div>
  );
}
