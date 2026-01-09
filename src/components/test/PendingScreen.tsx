import React from 'react';
import { Button } from '../ui/button';

interface PendingScreenProps {
  onStart: () => void;
  isLoading?: boolean;
  buttonText?: string;
}

/**
 * Screen displayed before a test starts
 */
const PendingScreen: React.FC<PendingScreenProps> = ({
  onStart,
  isLoading = false,
  buttonText = "Start Test"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 overflow-y-auto overflow-x-hidden">
      <div className="max-w-md text-center space-y-6">
        <Button 
          onClick={onStart}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? "Loading..." : buttonText}
        </Button>
      </div>
    </div>
  );
};

export default PendingScreen; 