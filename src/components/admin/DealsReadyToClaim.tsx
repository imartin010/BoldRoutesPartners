import React, { useState, useEffect } from 'react';
import { Check, Clock, DollarSign, User, Building, Calendar } from 'lucide-react';
import { getDealsReadyToClaim, claimDeal } from '../../api/admin';
import { formatCurrencyEGP } from '../../utils/format';

interface DealReadyToClaim {
  id: string;
  client_name: string;
  developer_name: string;
  project_name: string;
  deal_value: number;
  total_paid: number;
  payment_status: string;
  ready_to_claim_at: string;
  created_at: string;
}

export default function DealsReadyToClaim() {
  const [deals, setDeals] = useState<DealReadyToClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingDeal, setClaimingDeal] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
    // Refresh every minute to show new deals
    const interval = setInterval(loadDeals, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDeals = async () => {
    try {
      setLoading(true);
      const data = await getDealsReadyToClaim();
      setDeals(data);
    } catch (error) {
      console.error('Failed to load deals ready to claim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to claim this deal? This action cannot be undone.')) {
      return;
    }

    try {
      setClaimingDeal(dealId);
      await claimDeal(dealId);
      setDeals(prev => prev.filter(deal => deal.id !== dealId));
    } catch (error) {
      console.error('Failed to claim deal:', error);
      alert('Failed to claim deal. Please try again.');
    } finally {
      setClaimingDeal(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const calculateProgress = (totalPaid: number, dealValue: number) => {
    return ((totalPaid / dealValue) * 100).toFixed(1);
  };

  if (loading && deals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center text-gray-500">Loading deals ready to claim...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Deals Ready to Claim
            {deals.length > 0 && (
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                {deals.length}
              </span>
            )}
          </h3>
          <button
            onClick={loadDeals}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {deals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No deals ready to claim</p>
            <p className="text-sm">Deals will appear here when clients reach 10% payment threshold</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="border border-green-200 bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <User className="h-4 w-4 text-gray-600" />
                        {deal.client_name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        {deal.developer_name} • {deal.project_name}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Deal Value:</span>
                        <div className="font-semibold">{formatCurrencyEGP(deal.deal_value)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Paid:</span>
                        <div className="font-semibold text-green-600">{formatCurrencyEGP(deal.total_paid)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <div className="font-semibold">{calculateProgress(deal.total_paid, deal.deal_value)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Ready Since:</span>
                        <div className="font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimeAgo(deal.ready_to_claim_at)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(parseFloat(calculateProgress(deal.total_paid, deal.deal_value)), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <button
                      onClick={() => handleClaimDeal(deal.id)}
                      disabled={claimingDeal === deal.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {claimingDeal === deal.id ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Claiming...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Claim Deal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
