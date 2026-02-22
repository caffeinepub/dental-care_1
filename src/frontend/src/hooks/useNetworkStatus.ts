import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isChecking: false,
    lastChecked: null,
  });

  // Manual connectivity check
  const checkConnectivity = async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      // Try to fetch a small resource with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const isOnline = response.ok;
      
      setStatus({
        isOnline,
        isChecking: false,
        lastChecked: new Date(),
      });
      
      return isOnline;
    } catch (error) {
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
      });
      return false;
    }
  };

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastChecked: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connectivity check
    checkConnectivity();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...status,
    checkConnectivity,
  };
}
