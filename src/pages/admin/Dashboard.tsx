import React, { useState, useEffect } from 'react';
import { listApplications, listDeals } from '@/api/admin';
import DealsReadyToClaim from '../../components/admin/DealsReadyToClaim';

interface KPIData {
  newApplications7d: number;
  newApplications30d: number;
  newDeals7d: number;
  newDeals30d: number;
  totalDealValue30d: number;
  topDevelopers: Array<{ name: string; count: number }>;
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch applications data
      const [apps7d, apps30d] = await Promise.all([
        listApplications({ 
          page: 1, 
          pageSize: 1000, 
          from: sevenDaysAgo.toISOString() 
        }),
        listApplications({ 
          page: 1, 
          pageSize: 1000, 
          from: thirtyDaysAgo.toISOString() 
        })
      ]);

      // Fetch deals data
      const [deals7d, deals30d] = await Promise.all([
        listDeals({ 
          page: 1, 
          pageSize: 1000, 
          from: sevenDaysAgo.toISOString() 
        }),
        listDeals({ 
          page: 1, 
          pageSize: 1000, 
          from: thirtyDaysAgo.toISOString() 
        })
      ]);

      // Calculate total deal value for last 30 days
      const totalDealValue30d = deals30d.rows.reduce((sum, deal) => {
        return sum + (Number(deal.deal_value) || 0);
      }, 0);

      // Calculate top developers by deal count
      const developerCounts: { [key: string]: number } = {};
      deals30d.rows.forEach(deal => {
        const devName = deal.developer_name || 'Unknown';
        developerCounts[devName] = (developerCounts[devName] || 0) + 1;
      });

      const topDevelopers = Object.entries(developerCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setKpiData({
        newApplications7d: apps7d.total,
        newApplications30d: apps30d.total,
        newDeals7d: deals7d.total,
        newDeals30d: deals30d.total,
        totalDealValue30d,
        topDevelopers
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-card animate-pulse">
              <div className="h-4 bg-neutral-200 rounded mb-2"></div>
              <div className="h-8 bg-neutral-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <div className="admin-card text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadKPIData} className="admin-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <button onClick={loadKPIData} className="admin-btn-ghost">
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card">
          <h3 className="text-sm font-medium text-neutral-600 mb-1">
            New Applications (7d)
          </h3>
          <p className="text-2xl font-bold text-neutral-900">
            {kpiData?.newApplications7d || 0}
          </p>
        </div>

        <div className="admin-card">
          <h3 className="text-sm font-medium text-neutral-600 mb-1">
            New Applications (30d)
          </h3>
          <p className="text-2xl font-bold text-neutral-900">
            {kpiData?.newApplications30d || 0}
          </p>
        </div>

        <div className="admin-card">
          <h3 className="text-sm font-medium text-neutral-600 mb-1">
            New Deals (7d)
          </h3>
          <p className="text-2xl font-bold text-neutral-900">
            {kpiData?.newDeals7d || 0}
          </p>
        </div>

        <div className="admin-card">
          <h3 className="text-sm font-medium text-neutral-600 mb-1">
            New Deals (30d)
          </h3>
          <p className="text-2xl font-bold text-neutral-900">
            {kpiData?.newDeals30d || 0}
          </p>
        </div>
      </div>

      {/* Deals Ready to Claim */}
      <DealsReadyToClaim />

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Total Deal Value (30d)
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(kpiData?.totalDealValue30d || 0)}
          </p>
        </div>

        <div className="admin-card">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Top Developers by Deals (30d)
          </h3>
          {kpiData?.topDevelopers && kpiData.topDevelopers.length > 0 ? (
            <div className="space-y-2">
              {kpiData.topDevelopers.map((dev, index) => (
                <div key={dev.name} className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 truncate">
                    {index + 1}. {dev.name}
                  </span>
                  <span className="text-sm font-medium text-neutral-900">
                    {dev.count} deals
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No deals found</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/admin/applications" className="admin-btn-ghost text-center">
            Review Applications
          </a>
          <a href="/admin/deals" className="admin-btn-ghost text-center">
            Review Deals
          </a>
          <a href="/admin/developers" className="admin-btn-ghost text-center">
            Manage Developers
          </a>
          <a href="/admin/inventory" className="admin-btn-ghost text-center">
            View Inventory
          </a>
        </div>
      </div>
    </div>
  );
}
