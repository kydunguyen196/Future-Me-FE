import { useState, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNavigationContext } from '@/contexts/NavigationContext';

interface LinkProps extends ComponentPropsWithoutRef<typeof RouterLink> {
  className?: string;
  showSpinnerAlways?: boolean; // Option to always show spinner, even on same-page links
}

export function Link({ 
  children, 
  className, 
  to, 
  showSpinnerAlways = false,
  onClick,
  ...props 
}: LinkProps) {
  const location = useLocation();
  const { isNavigating } = useNavigationContext();
  //@ts-ignore:navigating is not used
  const [navigating, setNavigating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Reset navigating state when global navigation completes
  useEffect(() => {
    if (!isNavigating) {
      setNavigating(false);
    }
  }, [isNavigating]);
  
  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Skip if modifier keys are pressed (new tab, etc.)
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      if (onClick) onClick(e);
      return;
    }

    // Skip for external links
    if (typeof to === 'string' && (to.startsWith('http') || to.startsWith('mailto:'))) {
      if (onClick) onClick(e);
      return;
    }

    // Don't show loading for same-page navigation unless showSpinnerAlways is true
    const isSamePage = 
      typeof to === 'string' && 
      (to === location.pathname || to === '/' + location.pathname);
      
    if (!isSamePage || showSpinnerAlways) {
      setNavigating(true);
      
      // Add a safety timeout to reset navigation state if it gets stuck
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        setNavigating(false);
        timeoutRef.current = null;
      }, 3000); // Safety timeout in case navigation gets stuck
    }

    // Call the original onClick handler if provided
    if (onClick) onClick(e);
  };

  return (
    <RouterLink
      className={cn('transition-colors duration-200', className)}
      to={to}
      onClick={handleClick}
      {...props}
    >
      {children}
    </RouterLink>
  );
} 