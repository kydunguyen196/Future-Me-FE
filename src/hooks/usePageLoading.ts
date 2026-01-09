import { useState, useEffect } from 'react';

interface UsePageLoadingOptions {
  minDelay?: number;
  enabled?: boolean;
}

export function usePageLoading(options: UsePageLoadingOptions = {}) {
  const { minDelay = 800, enabled = true } = options;
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minDelay);

    return () => clearTimeout(timer);
  }, [minDelay, enabled]);

  return isLoading;
}

export default usePageLoading; 