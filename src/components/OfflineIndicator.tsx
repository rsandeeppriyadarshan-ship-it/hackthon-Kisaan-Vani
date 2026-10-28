import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { Language } from '../types';

interface Props {
  lang: Language;
}

export const OfflineIndicator: React.FC<Props> = ({ lang }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-white animate-pulse" />
      <span>
        {lang === 'or'
          ? 'ଅଫଲାଇନ୍ ମୋଡ୍ — ସଞ୍ଚିତ ତଥ୍ୟ ବ୍ୟବହାର ହେଉଛି।'
          : 'Offline Mode — Cached data is being used.'}
      </span>
    </div>
  );
};
