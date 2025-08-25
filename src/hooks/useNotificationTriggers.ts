import { useNotificationPopup } from '../contexts/NotificationPopupContext';
import { 
  createWelcomePopup,
  createCommissionIncreasePopup,
  createCommissionMilestonePopup,
  createDealApprovalPopup,
  createNewLaunchPopup,
  createGeneralAnnouncementPopup
} from '../utils/notificationPopups';

// Custom hook to simplify triggering notifications from anywhere in the app
export function useNotificationTriggers() {
  const { showPopup } = useNotificationPopup();

  return {
    // Trigger welcome notification
    triggerWelcome: (userName: string) => {
      showPopup(createWelcomePopup(userName));
    },

    // Trigger commission increase notification
    triggerCommissionIncrease: (projectName: string, rate: number) => {
      showPopup(createCommissionIncreasePopup(projectName, rate));
    },

    // Trigger commission milestone notification
    triggerCommissionMilestone: (percentage: number, dealId: string) => {
      showPopup(createCommissionMilestonePopup(percentage, dealId));
    },

    // Trigger deal approval notification
    triggerDealApproval: (dealId: string, status: 'approved' | 'waiting') => {
      showPopup(createDealApprovalPopup(dealId, status));
    },

    // Trigger new launch notification
    triggerNewLaunch: (projectName: string, developerName: string) => {
      showPopup(createNewLaunchPopup(projectName, developerName));
    },

    // Trigger general announcement
    triggerAnnouncement: (title: string, message: string, actionText?: string, actionUrl?: string) => {
      showPopup(createGeneralAnnouncementPopup(title, message, actionText, actionUrl));
    },

    // Raw popup trigger for custom notifications
    showCustomPopup: showPopup,
  };
}

// Usage examples:
// const { triggerWelcome, triggerCommissionIncrease } = useNotificationTriggers();
// triggerWelcome('Ahmed');
// triggerCommissionIncrease('Palm Valley', 5);
