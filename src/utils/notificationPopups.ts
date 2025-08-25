import { NotificationPopup } from '../contexts/NotificationPopupContext';

// Predefined notification popup templates
export const createWelcomePopup = (userName: string): Omit<NotificationPopup, 'id'> => ({
  type: 'welcome',
  icon: '👋',
  iconBgColor: 'bg-yellow-100',
  title: `Welcome, ${userName}!`,
  message: 'Welcome to Bold Routes Partners! Start exploring your dashboard.',
  duration: 4000,
  dismissible: true,
});

export const createCommissionIncreasePopup = (
  projectName: string, 
  commissionRate: number
): Omit<NotificationPopup, 'id'> => ({
  type: 'commission',
  icon: '📢',
  iconBgColor: 'bg-red-100',
  title: 'Commission Increased!',
  message: `Project ${projectName} now offers ${commissionRate}% commission`,
  actionText: 'View Project',
  actionUrl: '/inventory',
  duration: 6000,
  dismissible: true,
});

export const createCommissionMilestonePopup = (
  percentage: number,
  dealId: string
): Omit<NotificationPopup, 'id'> => ({
  type: 'commission',
  icon: '💹',
  iconBgColor: 'bg-green-100',
  title: 'Commission Milestone',
  message: `You've collected ${percentage}% of your commission for Deal #${dealId} 🎉`,
  actionText: 'View Commission',
  actionUrl: '/commissions',
  duration: 6000,
  dismissible: true,
});

export const createDealApprovalPopup = (
  dealId: string,
  status: 'approved' | 'waiting'
): Omit<NotificationPopup, 'id'> => ({
  type: 'deal',
  icon: '🤝',
  iconBgColor: 'bg-blue-100',
  title: 'Deal Approval',
  message: status === 'approved' 
    ? `Deal #${dealId} has been approved by Sales operation, waiting for Collection approval`
    : `Deal #${dealId} is waiting for approval`,
  actionText: 'View Deal',
  actionUrl: '/submissions',
  duration: 6000,
  dismissible: true,
});

export const createNewLaunchPopup = (
  projectName: string,
  developerName: string
): Omit<NotificationPopup, 'id'> => ({
  type: 'general',
  icon: '🚀',
  iconBgColor: 'bg-purple-100',
  title: 'New Project Launch!',
  message: `${projectName} by ${developerName} is now available. High commission rates!`,
  actionText: 'View Launches',
  actionUrl: '/launches',
  duration: 6000,
  dismissible: true,
});

export const createGeneralAnnouncementPopup = (
  title: string,
  message: string,
  actionText?: string,
  actionUrl?: string
): Omit<NotificationPopup, 'id'> => ({
  type: 'general',
  icon: '📢',
  iconBgColor: 'bg-gray-100',
  title,
  message,
  actionText,
  actionUrl,
  duration: 5000,
  dismissible: true,
});

// Demo function to trigger sample popups
export const triggerDemoPopups = (showPopup: (popup: Omit<NotificationPopup, 'id'>) => void) => {
  // Welcome popup
  setTimeout(() => {
    showPopup(createWelcomePopup('Ahmed'));
  }, 2000);

  // Commission increase popup
  setTimeout(() => {
    showPopup(createCommissionIncreasePopup('Palm Valley', 5));
  }, 5000);

  // Commission milestone popup
  setTimeout(() => {
    showPopup(createCommissionMilestonePopup(75, '203'));
  }, 8000);

  // Deal approval popup
  setTimeout(() => {
    showPopup(createDealApprovalPopup('1341', 'approved'));
  }, 11000);
};
