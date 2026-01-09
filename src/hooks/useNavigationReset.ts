import { useCallback } from 'react';
import { useNavigationContext } from '@/contexts/NavigationContext';

/**
 * Hook to manually reset navigation state if it gets stuck
 * Useful for debugging or emergency reset
 */
export function useNavigationReset() {
  const { setIsNavigating } = useNavigationContext();

  const resetNavigation = useCallback(() => {
    setIsNavigating(false);
    console.log('Navigation state manually reset');
  }, [setIsNavigating]);

  return { resetNavigation };
}

// For debugging - add to window object in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).resetNavigation = () => {
    // This will only work if a component using this hook is mounted
    console.log('Use the resetNavigation function from useNavigationReset hook instead');
  };
} 