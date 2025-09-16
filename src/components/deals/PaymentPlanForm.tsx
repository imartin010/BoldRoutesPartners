import React, { useState } from 'react';
import { Calculator, Percent, Calendar, CreditCard } from 'lucide-react';
import { formatCurrencyEGP } from '../../utils/format';

export interface PaymentPlan {
  downpaymentPercentage: number;
  installmentYears: number;
  installmentFrequency: 'monthly' | 'quarterly' | 'yearly';
  notes?: string;
}

interface PaymentPlanFormProps {
  dealValue: number;
  paymentPlan: PaymentPlan | null;
  onPaymentPlanChange: (plan: PaymentPlan | null) => void;
  required?: boolean;
}

export default function PaymentPlanForm({ 
  dealValue, 
  paymentPlan, 
  onPaymentPlanChange, 
  required = false 
}: PaymentPlanFormProps) {
  const [showCalculator, setShowCalculator] = useState(false);

  const handleChange = (field: keyof PaymentPlan, value: any) => {
    if (!paymentPlan) {
      onPaymentPlanChange({
        downpaymentPercentage: 5,
        installmentYears: 8,
        installmentFrequency: 'monthly',
        [field]: value
      });
    } else {
      onPaymentPlanChange({
        ...paymentPlan,
        [field]: value
      });
    }
  };

  const calculatePaymentBreakdown = () => {
    if (!paymentPlan || !dealValue) return null;

    const downpayment = dealValue * (paymentPlan.downpaymentPercentage / 100);
    const remainingAmount = dealValue - downpayment;
    const totalInstallments = paymentPlan.installmentYears * (
      paymentPlan.installmentFrequency === 'monthly' ? 12 :
      paymentPlan.installmentFrequency === 'quarterly' ? 4 : 1
    );
    const installmentAmount = remainingAmount / totalInstallments;

    return {
      downpayment,
      remainingAmount,
      totalInstallments,
      installmentAmount,
      tenPercentThreshold: dealValue * 0.10
    };
  };

  const breakdown = calculatePaymentBreakdown();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          Payment Plan Setup
          {required && <span className="text-red-500">*</span>}
        </h3>
        <button
          type="button"
          onClick={() => setShowCalculator(!showCalculator)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Calculator className="h-4 w-4" />
          {showCalculator ? 'Hide' : 'Show'} Calculator
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Downpayment Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Percent className="h-4 w-4 inline mr-1" />
            Downpayment Percentage
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={paymentPlan?.downpaymentPercentage || 5}
              onChange={(e) => handleChange('downpaymentPercentage', Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5"
            />
            <span className="absolute right-3 top-3 text-gray-500">%</span>
          </div>
        </div>

        {/* Installment Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 inline mr-1" />
            Payment Period (Years)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={paymentPlan?.installmentYears || 8}
            onChange={(e) => handleChange('installmentYears', Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="8"
          />
        </div>

        {/* Payment Frequency */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('installmentFrequency', option.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  paymentPlan?.installmentFrequency === option.value
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={paymentPlan?.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any special terms or conditions..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Payment Calculator/Breakdown */}
      {showCalculator && breakdown && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Payment Breakdown</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Deal Value:</span>
                <span className="font-semibold">{formatCurrencyEGP(dealValue)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Downpayment ({paymentPlan.downpaymentPercentage}%):</span>
                <span className="font-semibold text-blue-600">{formatCurrencyEGP(breakdown.downpayment)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Remaining Amount:</span>
                <span className="font-semibold">{formatCurrencyEGP(breakdown.remainingAmount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Installments:</span>
                <span className="font-semibold">{breakdown.totalInstallments}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Per Installment:</span>
                <span className="font-semibold">{formatCurrencyEGP(breakdown.installmentAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-orange-600 font-medium">10% Claim Threshold:</span>
                <span className="font-semibold text-orange-600">{formatCurrencyEGP(breakdown.tenPercentThreshold)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This deal will be ready to claim when the client has paid at least{' '}
              <strong>{formatCurrencyEGP(breakdown.tenPercentThreshold)}</strong> (10% of total deal value).
            </p>
          </div>
        </div>
      )}

      {!paymentPlan && required && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>Payment Plan Setup:</strong> Set up a payment plan to enable automatic progress tracking and claim notifications for this deal.
          </p>
        </div>
      )}
    </div>
  );
}
