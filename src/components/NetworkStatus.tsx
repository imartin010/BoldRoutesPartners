import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Wifi, WifiOff, Signal } from 'lucide-react';

interface NetworkStatusProps {
  className?: string;
  showText?: boolean;
}

export default function NetworkStatus({ className = '', showText = false }: NetworkStatusProps) {
  const { isOnline, isSlowConnection, connectionType } = useNetworkStatus();

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }
    if (isSlowConnection) {
      return <Signal className="w-4 h-4" />;
    }
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (isSlowConnection) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSlowConnection) return 'Slow connection';
    return 'Online';
  };

  return (
    <div className={`flex items-center ${getStatusColor()} ${className}`}>
      {getIcon()}
      {showText && (
        <span className="ml-2 text-sm">
          {getStatusText()}
          {connectionType !== 'unknown' && isOnline && (
            <span className="text-gray-500 ml-1">({connectionType})</span>
          )}
        </span>
      )}
    </div>
  );
}
