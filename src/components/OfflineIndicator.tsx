import { WifiOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 rounded-full shadow-lg dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>Working Offline • Local Changes Cached</span>
    </div>
  );
};
