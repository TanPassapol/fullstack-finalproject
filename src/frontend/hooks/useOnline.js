import { useState, useEffect } from 'react';

/**
 * Returns true when the browser has network access.
 * Listens to the native online/offline window events.
 */
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
