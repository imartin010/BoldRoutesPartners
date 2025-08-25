import React from 'react';
import { DealsProvider, useDeals } from '../contexts/DealsContext';
import DealTypeStep from '../components/deals/DealTypeStep';
import ContractDetailsStep from '../components/deals/ContractDetailsStep';
// Import other steps as we create them

function CreateDealFlow() {
  const { currentStep } = useDeals();

  switch (currentStep) {
    case 'type':
      return <DealTypeStep />;
    case 'details':
      return <ContractDetailsStep />;
    // Add other cases as we create more steps
    default:
      return <DealTypeStep />;
  }
}

export default function CreateDeal() {
  return (
    <DealsProvider>
      <CreateDealFlow />
    </DealsProvider>
  );
}
