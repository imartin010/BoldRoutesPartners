import React from 'react';
import { useToastTriggers } from '../hooks/useToastTriggers';
import { 
  Image, 
  Phone, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Save, 
  Copy, 
  Upload, 
  Download,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

export default function ToastDemo() {
  const {
    showPhotoUploaded,
    showMobileConfirmed,
    showDealEdited,
    showDealDeleted,
    showNetworkError,
    showSaveSuccess,
    showCopySuccess,
    showUploadSuccess,
    showDownloadSuccess,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  } = useToastTriggers();

  const toastButtons = [
    {
      label: 'Photo Uploaded',
      icon: <Image className="w-4 h-4" />,
      action: showPhotoUploaded,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      label: 'Mobile Confirmed',
      icon: <Phone className="w-4 h-4" />,
      action: showMobileConfirmed,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      label: 'Deal Edited',
      icon: <Edit className="w-4 h-4" />,
      action: showDealEdited,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Deal Deleted',
      icon: <Trash2 className="w-4 h-4" />,
      action: showDealDeleted,
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      label: 'Network Error',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => showNetworkError(() => console.log('Refreshing...')),
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'Save Success',
      icon: <Save className="w-4 h-4" />,
      action: showSaveSuccess,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Copy Success',
      icon: <Copy className="w-4 h-4" />,
      action: showCopySuccess,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      label: 'Upload Success',
      icon: <Upload className="w-4 h-4" />,
      action: () => showUploadSuccess('document.pdf'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      label: 'Download Success',
      icon: <Download className="w-4 h-4" />,
      action: () => showDownloadSuccess('report.xlsx'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      label: 'Custom Success',
      icon: <CheckCircle className="w-4 h-4" />,
      action: () => showSuccess('Custom success!', 'This is a custom success message'),
      color: 'bg-emerald-500 hover:bg-emerald-600',
    },
    {
      label: 'Custom Error',
      icon: <AlertTriangle className="w-4 h-4" />,
      action: () => showError('Custom error!', 'Something went wrong', { 
        label: 'Retry', 
        onClick: () => console.log('Retrying...') 
      }),
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      label: 'Custom Warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      action: () => showWarning('Warning!', 'Please check this carefully'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      label: 'Custom Info',
      icon: <Info className="w-4 h-4" />,
      action: () => showInfo('Information', 'Here is some useful information'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {toastButtons.map((button, index) => (
        <button
          key={index}
          onClick={button.action}
          className={`
            flex items-center justify-center space-x-2 
            ${button.color} text-white px-3 py-2 rounded-lg 
            transition-colors text-xs font-medium
          `}
        >
          {button.icon}
          <span className="hidden sm:inline">{button.label}</span>
        </button>
      ))}
    </div>
  );
}
