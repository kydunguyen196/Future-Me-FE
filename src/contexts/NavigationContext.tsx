import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStartTime, setNavigationStartTime] = useState<number | null>(null);
  
  // Track previous location path to detect changes
  const [prevPathname, setPrevPathname] = useState(location.pathname);

  // Development: Listen for manual reset events
  useEffect(() => {
    if (import.meta.env.DEV) {
      const handleReset = () => {
        console.log('Manual navigation reset triggered');
        setIsNavigating(false);
      };
      
      window.addEventListener('resetNavigation', handleReset);
      return () => window.removeEventListener('resetNavigation', handleReset);
    }
  }, []);

  useEffect(() => {
    // When location changes, STOP the loading (navigation completed)
    if (location.pathname !== prevPathname) {
      if (import.meta.env.DEV) {
        console.log('Navigation completed:', prevPathname, '->', location.pathname);
      }
      setPrevPathname(location.pathname);
      
      // Ensure minimum spinner duration of 400ms for better UX
      const minDuration = 400;
      const elapsed = navigationStartTime ? Date.now() - navigationStartTime : 0;
      const remainingTime = Math.max(0, minDuration - elapsed);
      
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setNavigationStartTime(null);
      }, remainingTime);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevPathname, navigationStartTime]);

  // Auto-reset loading state after 1 second as a safety net
  useEffect(() => {
    if (isNavigating) {
      const safetyTimer = setTimeout(() => {
        if (import.meta.env.DEV) {
          console.log('Navigation safety timeout - force reset');
        }
        setIsNavigating(false);
      }, 1000); // 1 second safety timeout (much shorter)

      return () => clearTimeout(safetyTimer);
    }
  }, [isNavigating]);

  // Wrap setIsNavigating with debug logging and timing
  const setIsNavigatingWithLogging = (value: boolean) => {
    if (import.meta.env.DEV) {
      console.log('Navigation state changed:', isNavigating, '->', value);
    }
    if (value && !isNavigating) {
      // Record the start time when navigation begins
      setNavigationStartTime(Date.now());
    }
    setIsNavigating(value);
  };

  return (
    <NavigationContext.Provider value={{ isNavigating, setIsNavigating: setIsNavigatingWithLogging }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
} 