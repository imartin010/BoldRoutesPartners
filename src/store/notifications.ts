import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'launch' | 'commission' | 'reservation' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: {
    dealId?: string;
    amount?: number;
    projectName?: string;
    expiryHours?: number;
  };
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [
    {
      id: 'notif-1',
      type: 'launch',
      title: 'New launch alert!',
      message: '"Skyline Residences" just launched — check it out under New Launches.',
      timestamp: new Date('2024-01-15T10:30:00'),
      read: false,
      data: { projectName: 'Skyline Residences' }
    },
    {
      id: 'notif-2',
      type: 'commission',
      title: 'Commission collected',
      message: "You've received EGP 45,000 for Deal #BR-1984.",
      timestamp: new Date('2024-01-14T14:20:00'),
      read: false,
      data: { dealId: 'BR-1984', amount: 45000 }
    },
    {
      id: 'notif-3',
      type: 'reservation',
      title: 'Reservation deal expiring soon',
      message: 'Reservation for Deal #BR-2008 will expire in 24 hours.',
      timestamp: new Date('2024-01-13T09:15:00'),
      read: false,
      data: { dealId: 'BR-2008', expiryHours: 24 }
    },
    {
      id: 'notif-4',
      type: 'general',
      title: 'Morem ipsum dolor sit amet,',
      message: 'Vorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
      timestamp: new Date('2024-01-12T16:45:00'),
      read: true
    }
  ],
  unreadCount: 3,

  addNotification: (notificationData) =>
    set((state) => {
      const newNotification: Notification = {
        ...notificationData,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
        read: false,
      };
      const updatedNotifications = [newNotification, ...state.notifications];
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map(notification => ({ ...notification, read: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const updatedNotifications = state.notifications.filter(notification => notification.id !== id);
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    }),

  getUnreadCount: () => get().unreadCount,
}));
