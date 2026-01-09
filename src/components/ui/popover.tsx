import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom' | 'left' | 'right'; 
  width?: string;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  open: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  width = 'auto',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(controlledOpen || false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Controlled vs uncontrolled handling
  const open = controlledOpen !== undefined ? controlledOpen : isOpen;
  
  const handleToggle = () => {
    const newOpenState = !open;
    if (onOpenChange) {
      onOpenChange(newOpenState);
    } else {
      setIsOpen(newOpenState);
    }
  };
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open && 
        triggerRef.current && 
        contentRef.current && 
        !triggerRef.current.contains(event.target as Node) && 
        !contentRef.current.contains(event.target as Node)
      ) {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') {
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [open, onOpenChange]);
  
  // Determine placement styles
  const getPlacementStyles = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full ml-2';
      case 'left':
        return 'right-full mr-2';
      case 'bottom':
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    }
  };
  
  return (
    <div className="relative inline-block">
      <div 
        ref={triggerRef}
        onClick={handleToggle}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      
      {open && (
        <div 
          ref={contentRef}
          className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg ${getPlacementStyles()} ${className}`}
          style={{ width }}
        >
          {content}
        </div>
      )}
    </div>
  );
}; 