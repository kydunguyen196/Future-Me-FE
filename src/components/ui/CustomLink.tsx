import React, { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { cn } from '@/lib/utils';

interface CustomLinkProps extends RouterLinkProps {
  /** Whether to trigger navigation loading state */
  showSpinner?: boolean;
  /** Disable the link */
  disabled?: boolean;
}

/**
 * CustomLink - A wrapper around React Router's Link that triggers outlet loading during navigation
 * 
 * @example
 * // Basic usage with outlet loading
 * <CustomLink to="/dashboard">Go to Dashboard</CustomLink>
 * 
 * @example
 * // Disable outlet loading
 * <CustomLink to="/about" showSpinner={false}>About Us</CustomLink>
 * 
 * @example
 * // Disabled link
 * <CustomLink to="/admin" disabled>Admin Panel</CustomLink>
 */
export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ 
    children, 
    onClick, 
    showSpinner = true, 
    disabled = false,
    className,
    ...props 
  }, ref) => {
    //@ts-ignore:setIsNavigating is not defined
    const { isNavigating, setIsNavigating } = useNavigationContext();

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }

      // Call the original onClick handler first
      if (onClick) {
        onClick(event);
        // If the original handler prevented default, don't show spinner
        if (event.defaultPrevented) {
          return;
        }
      }

      // Set navigating state to true to show spinner for route changes
      if (showSpinner && props.to) {
        const targetPath = typeof props.to === 'string' ? props.to : props.to.pathname;
        // Only trigger loading if navigating to a different route
        if (targetPath && targetPath !== window.location.pathname) {
          setIsNavigating(true);
        }
      }
    };

    return (
      <RouterLink
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 transition-opacity duration-200",
          disabled && "pointer-events-none opacity-50 cursor-not-allowed",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </RouterLink>
    );
  }
);

CustomLink.displayName = 'CustomLink';

// Default export for easier importing
export default CustomLink; 