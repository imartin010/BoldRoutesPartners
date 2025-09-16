import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, DollarSign, CreditCard, FileText, Check, AlertCircle } from 'lucide-react';
import { listPaymentRecords, addPaymentRecord, updatePaymentRecord, deletePaymentRecord } from '../../api/admin';
import { formatCurrencyEGP } from '../../utils/format';

interface PaymentRecord {
  id: string;
  deal_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

interface PaymentTrackerProps {
  dealId: string;
  dealValue: number;
  paymentPlan?: {
    downpaymentPercentage: number;
    installmentYears: number;
    installmentFrequency: 'monthly' | 'quarterly' | 'yearly';
    notes?: string;
  };
  totalPaid: number;
  paymentStatus: string;
  onPaymentUpdate?: () => void;
}

export default function PaymentTracker({
  dealId,
  dealValue,
  paymentPlan,
  totalPaid,
  paymentStatus,
  onPaymentUpdate
}: PaymentTrackerProps) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: '',
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
  }, [dealId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await listPaymentRecords(dealId);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      reference_number: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingPayment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.payment_date) return;

    try {
      setLoading(true);
      const paymentData = {
        deal_id: dealId,
        amount: parseFloat(formData.amount),
        payment_date: formData.payment_date,
        payment_method: formData.payment_method || undefined,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined
      };

      if (editingPayment) {
        await updatePaymentRecord(editingPayment.id, paymentData);
      } else {
        await addPaymentRecord(paymentData);
      }

      await loadPayments();
      resetForm();
      onPaymentUpdate?.();
    } catch (error) {
      console.error('Failed to save payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment: PaymentRecord) => {
    setFormData({
      amount: payment.amount.toString(),
      payment_date: payment.payment_date.split('T')[0],
      payment_method: payment.payment_method || '',
      reference_number: payment.reference_number || '',
      notes: payment.notes || ''
    });
    setEditingPayment(payment);
    setShowAddForm(true);
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      setLoading(true);
      await deletePaymentRecord(paymentId);
      await loadPayments();
      onPaymentUpdate?.();
    } catch (error) {
      console.error('Failed to delete payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const percentage = dealValue > 0 ? (totalPaid / dealValue) * 100 : 0;
    const claimThreshold = dealValue * 0.10;
    const readyToClaim = totalPaid >= claimThreshold;
    
    return {
      percentage: Math.min(percentage, 100),
      readyToClaim,
      claimThreshold,
      remaining: Math.max(0, dealValue - totalPaid)
    };
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Payment Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Payment Progress
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            paymentStatus === 'claimed' ? 'bg-green-100 text-green-800' :
            paymentStatus === 'ready_to_claim' ? 'bg-yellow-100 text-yellow-800' :
            paymentStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {paymentStatus === 'claimed' ? 'Claimed' :
             paymentStatus === 'ready_to_claim' ? 'Ready to Claim' :
             paymentStatus === 'in_progress' ? 'In Progress' : 'Pending'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{progress.percentage.toFixed(1)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                progress.readyToClaim ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="text-xs text-gray-500">Total Paid</div>
              <div className="font-semibold text-green-600">{formatCurrencyEGP(totalPaid)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Deal Value</div>
              <div className="font-semibold">{formatCurrencyEGP(dealValue)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Remaining</div>
              <div className="font-semibold text-gray-600">{formatCurrencyEGP(progress.remaining)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Claim Threshold</div>
              <div className={`font-semibold ${progress.readyToClaim ? 'text-green-600' : 'text-orange-600'}`}>
                {formatCurrencyEGP(progress.claimThreshold)}
              </div>
            </div>
          </div>

          {progress.readyToClaim && paymentStatus !== 'claimed' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 font-medium">
                This deal is ready to be claimed!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Plan Details */}
      {paymentPlan && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Payment Plan</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Downpayment:</span>
              <div className="font-medium">{paymentPlan.downpaymentPercentage}%</div>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <div className="font-medium">{paymentPlan.installmentYears} years</div>
            </div>
            <div>
              <span className="text-gray-600">Frequency:</span>
              <div className="font-medium capitalize">{paymentPlan.installmentFrequency}</div>
            </div>
          </div>
          {paymentPlan.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Notes:</span>
              <div className="text-sm text-gray-800 mt-1">{paymentPlan.notes}</div>
            </div>
          )}
        </div>
      )}

      {/* Payment Records */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Records
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </button>
          </div>
        </div>

        {/* Add/Edit Payment Form */}
        {showAddForm && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingPayment ? 'Edit Payment' : 'Add New Payment'}
            </h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Transaction ID, check number, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Additional notes about this payment..."
                />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingPayment ? 'Update Payment' : 'Add Payment'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Payment List */}
        <div className="p-6">
          {loading && payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No payments recorded yet</p>
              <p className="text-sm">Click "Add Payment" to record the first payment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrencyEGP(payment.amount)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                        {payment.payment_method && (
                          <div className="text-sm text-gray-600 capitalize">
                            {payment.payment_method.replace('_', ' ')}
                          </div>
                        )}
                      </div>
                      {payment.reference_number && (
                        <div className="text-sm text-gray-500 mt-1">
                          Ref: {payment.reference_number}
                        </div>
                      )}
                      {payment.notes && (
                        <div className="text-sm text-gray-600 mt-2">
                          {payment.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(payment)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
