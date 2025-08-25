import { Toast } from '../contexts/ToastContext';

// Predefined toast templates based on your design
export const createPhotoUploadedToast = (): Omit<Toast, 'id'> => ({
  type: 'success',
  title: 'Photo uploaded!',
  duration: 3000,
});

export const createMobileConfirmedToast = (): Omit<Toast, 'id'> => ({
  type: 'success',
  title: 'Mobile number confirmed successfully',
  duration: 4000,
});

export const createDealEditedToast = (): Omit<Toast, 'id'> => ({
  type: 'info',
  title: 'Deal Edited',
  duration: 3000,
});

export const createDealDeletedToast = (): Omit<Toast, 'id'> => ({
  type: 'error',
  title: 'Deal Deleted',
  duration: 4000,
});

export const createNetworkErrorToast = (onRefresh?: () => void): Omit<Toast, 'id'> => ({
  type: 'error',
  title: 'Network Error',
  message: 'Please check your internet connection',
  action: onRefresh ? {
    label: 'Refresh',
    onClick: onRefresh,
  } : undefined,
  duration: 0, // Don't auto-dismiss error toasts
});

// General toast creators
export const createSuccessToast = (
  title: string, 
  message?: string, 
  duration?: number
): Omit<Toast, 'id'> => ({
  type: 'success',
  title,
  message,
  duration,
});

export const createErrorToast = (
  title: string, 
  message?: string, 
  action?: { label: string; onClick: () => void }
): Omit<Toast, 'id'> => ({
  type: 'error',
  title,
  message,
  action,
  duration: 0, // Don't auto-dismiss errors
});

export const createWarningToast = (
  title: string, 
  message?: string, 
  duration?: number
): Omit<Toast, 'id'> => ({
  type: 'warning',
  title,
  message,
  duration,
});

export const createInfoToast = (
  title: string, 
  message?: string, 
  duration?: number
): Omit<Toast, 'id'> => ({
  type: 'info',
  title,
  message,
  duration,
});

// Common action toasts
export const createSaveSuccessToast = (): Omit<Toast, 'id'> => ({
  type: 'success',
  title: 'Saved successfully',
  duration: 2500,
});

export const createCopySuccessToast = (): Omit<Toast, 'id'> => ({
  type: 'success',
  title: 'Copied to clipboard',
  duration: 2000,
});

export const createUploadSuccessToast = (fileName?: string): Omit<Toast, 'id'> => ({
  type: 'success',
  title: 'Upload successful',
  message: fileName ? `${fileName} uploaded` : undefined,
  duration: 3000,
});

export const createDownloadSuccessToast = (fileName?: string): Omit<Toast, 'id'> => ({
  type: 'success',
  title: 'Download complete',
  message: fileName ? `${fileName} downloaded` : undefined,
  duration: 3000,
});
