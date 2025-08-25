import { useToast } from '../contexts/ToastContext';
import {
  createPhotoUploadedToast,
  createMobileConfirmedToast,
  createDealEditedToast,
  createDealDeletedToast,
  createNetworkErrorToast,
  createSuccessToast,
  createErrorToast,
  createWarningToast,
  createInfoToast,
  createSaveSuccessToast,
  createCopySuccessToast,
  createUploadSuccessToast,
  createDownloadSuccessToast,
} from '../utils/toastUtils';

// Custom hook to simplify triggering toasts from anywhere in the app
export function useToastTriggers() {
  const { addToast } = useToast();

  return {
    // Predefined toasts matching your design
    showPhotoUploaded: () => addToast(createPhotoUploadedToast()),
    showMobileConfirmed: () => addToast(createMobileConfirmedToast()),
    showDealEdited: () => addToast(createDealEditedToast()),
    showDealDeleted: () => addToast(createDealDeletedToast()),
    showNetworkError: (onRefresh?: () => void) => addToast(createNetworkErrorToast(onRefresh)),

    // Common action toasts
    showSaveSuccess: () => addToast(createSaveSuccessToast()),
    showCopySuccess: () => addToast(createCopySuccessToast()),
    showUploadSuccess: (fileName?: string) => addToast(createUploadSuccessToast(fileName)),
    showDownloadSuccess: (fileName?: string) => addToast(createDownloadSuccessToast(fileName)),

    // General toast types
    showSuccess: (title: string, message?: string, duration?: number) => 
      addToast(createSuccessToast(title, message, duration)),
    
    showError: (title: string, message?: string, action?: { label: string; onClick: () => void }) => 
      addToast(createErrorToast(title, message, action)),
    
    showWarning: (title: string, message?: string, duration?: number) => 
      addToast(createWarningToast(title, message, duration)),
    
    showInfo: (title: string, message?: string, duration?: number) => 
      addToast(createInfoToast(title, message, duration)),

    // Raw toast trigger for complete customization
    showCustomToast: addToast,
  };
}

// Usage examples:
// const { showPhotoUploaded, showSuccess, showError } = useToastTriggers();
// showPhotoUploaded();
// showSuccess('Data saved', 'Your changes have been saved successfully');
// showError('Failed to save', 'Please try again', { label: 'Retry', onClick: retryFunction });
