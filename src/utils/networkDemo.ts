import { useNetwork } from '../contexts/NetworkContext';

// Utility functions for testing network error states
export function useNetworkDemo() {
  const { showTimeoutModal, showErrorModal } = useNetwork();

  const simulateTimeout = () => {
    showTimeoutModal('Request timeout!, Please try again');
  };

  const simulateServerError = () => {
    showErrorModal('Server error. Please try again later.');
  };

  const simulateGenericError = () => {
    showErrorModal('An unexpected error occurred. Please try again.');
  };

  return {
    simulateTimeout,
    simulateServerError,
    simulateGenericError,
  };
}

// Example of how to use in a component:
/*
import { useNetworkDemo } from '../utils/networkDemo';

function MyComponent() {
  const { simulateTimeout } = useNetworkDemo();
  
  return (
    <button onClick={simulateTimeout}>
      Test Timeout Error
    </button>
  );
}
*/
