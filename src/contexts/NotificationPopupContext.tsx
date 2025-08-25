import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface NotificationPopup {
  id: string;
  type: 'welcome' | 'commission' | 'deal' | 'general';
  icon: string; // emoji or icon identifier
  iconBgColor: string; // Tailwind color class
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  onAction?: () => void;
  duration?: number; // auto-dismiss after X milliseconds (0 = no auto-dismiss)
  dismissible?: boolean;
}

interface NotificationPopupContextType {
  currentPopup: NotificationPopup | null;
  popupQueue: NotificationPopup[];
  showPopup: (popup: Omit<NotificationPopup, 'id'>) => void;
  dismissCurrentPopup: () => void;
  clearQueue: () => void;
}

const NotificationPopupContext = createContext<NotificationPopupContextType | undefined>(undefined);

interface NotificationPopupProviderProps {
  children: React.ReactNode;
}

export function NotificationPopupProvider({ children }: NotificationPopupProviderProps) {
  const [currentPopup, setCurrentPopup] = useState<NotificationPopup | null>(null);
  const [popupQueue, setPopupQueue] = useState<NotificationPopup[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showPopup = useCallback((popup: Omit<NotificationPopup, 'id'>) => {
    const newPopup: NotificationPopup = {
      ...popup,
      id: generateId(),
      duration: popup.duration ?? 5000, // default 5 seconds
      dismissible: popup.dismissible ?? true,
    };

    setPopupQueue(prev => [...prev, newPopup]);
  }, []);

  const dismissCurrentPopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);

  const clearQueue = useCallback(() => {
    setPopupQueue([]);
    setCurrentPopup(null);
  }, []);

  // Process queue - show next popup when current one is dismissed
  useEffect(() => {
    if (!currentPopup && popupQueue.length > 0) {
      const nextPopup = popupQueue[0];
      setCurrentPopup(nextPopup);
      setPopupQueue(prev => prev.slice(1));

      // Auto-dismiss if duration is set
      if (nextPopup.duration && nextPopup.duration > 0) {
        const timer = setTimeout(() => {
          dismissCurrentPopup();
        }, nextPopup.duration);

        return () => clearTimeout(timer);
      }
    }
  }, [currentPopup, popupQueue, dismissCurrentPopup]);

  return (
    <NotificationPopupContext.Provider
      value={{
        currentPopup,
        popupQueue,
        showPopup,
        dismissCurrentPopup,
        clearQueue,
      }}
    >
      {children}
    </NotificationPopupContext.Provider>
  );
}

export function useNotificationPopup() {
  const context = useContext(NotificationPopupContext);
  if (context === undefined) {
    throw new Error('useNotificationPopup must be used within a NotificationPopupProvider');
  }
  return context;
}
