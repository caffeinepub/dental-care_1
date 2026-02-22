import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatusIndicator() {
  const { isOnline, isChecking } = useNetworkStatus();

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking connection...</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <WifiOff className="w-4 h-4" />
        <span>No internet connection</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
      <Wifi className="w-4 h-4" />
      <span>Connected</span>
    </div>
  );
}
