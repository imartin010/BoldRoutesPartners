import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import OfflineModal from '../components/OfflineModal';

interface NetworkContextType {
  isOnline: boolean;
  showOfflineModal: boolean;
  showTimeoutModal: (message?: string) => void;
  showErrorModal: (message?: string) => void;
  hideModal: () => void;
  retryLastAction: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: React.ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const { isOnline } = useNetworkStatus();
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [modalType, setModalType] = useState<'offline' | 'timeout' | 'error'>('offline');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);
  const [wasOffline, setWasOffline] = useState(false);

  // Show offline modal when connection is lost
  useEffect(() => {
    if (!isOnline && !wasOffline) {
      setModalType('offline');
      setShowOfflineModal(true);
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      setShowOfflineModal(false);
      setWasOffline(false);
    }
  }, [isOnline, wasOffline]);

  const showTimeoutModal = (message?: string) => {
    setModalType('timeout');
    setModalMessage(message || 'Request timeout!, Please try again');
    setShowOfflineModal(true);
  };

  const showErrorModal = (message?: string) => {
    setModalType('error');
    setModalMessage(message || 'An unexpected error occurred. Please try again.');
    setShowOfflineModal(true);
  };

  const hideModal = () => {
    setShowOfflineModal(false);
    setModalMessage('');
  };

  const retryLastAction = () => {
    if (lastAction) {
      lastAction();
    }
    hideModal();
  };

  const setRetryAction = (action: () => void) => {
    setLastAction(() => action);
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        showOfflineModal,
        showTimeoutModal,
        showErrorModal,
        hideModal,
        retryLastAction,
      }}
    >
      {children}
      
      <OfflineModal
        isOpen={showOfflineModal}
        onClose={hideModal}
        onRetry={retryLastAction}
        type={modalType}
        message={modalMessage || undefined}
      />
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
