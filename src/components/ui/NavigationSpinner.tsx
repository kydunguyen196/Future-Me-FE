import { useState, useEffect } from 'react';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

interface NavigationSpinnerProps {
  className?: string;
  position?: 'fixed' | 'absolute';
}

export function NavigationSpinner({ 
  className,
  position = 'fixed'
}: NavigationSpinnerProps) {
  const { isNavigating } = useNavigationContext();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (isNavigating) {
      // Show spinner immediately for navigation feedback
      setShowSpinner(true);
    } else {
      // Add small delay before hiding to ensure smooth transition
      const hideTimer = setTimeout(() => {
        setShowSpinner(false);
      }, 100);

      return () => clearTimeout(hideTimer);
    }
  }, [isNavigating]);

  if (!showSpinner) return null;

  return (
    <div 
      className={cn(
        "z-40 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm pointer-events-none",
        position === 'fixed' 
          ? "fixed inset-0" 
          : "absolute inset-0",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
          {/* Inner spinning ring */}
          <div className="absolute top-1 left-1 w-10 h-10 border-4 border-t-blue-600 dark:border-t-blue-400 border-transparent rounded-full animate-spin"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
        </div>
                 <p className="text-sm text-gray-600 dark:text-gray-300 font-medium animate-pulse">
           Loading page...
         </p>
      </div>
    </div>
  );
}

// Compact inline spinner for use in components
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]",
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 