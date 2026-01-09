import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { CoffeeIcon } from 'lucide-react';

interface BreakTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
}

/**
 * Component that displays a break timer between test parts
 */
export default function BreakTimer({ 
  duration, 
  onComplete, 
}: BreakTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);
  
  // Format time as mm:ss
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = (timeLeft / (duration * 60)) * 100;
  
  return (
    <div className="min-h-screen flex items-center justify-center overflow-y-auto overflow-x-hidden">
      <div className="max-w-xl w-full text-center p-8 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-4">
          <CoffeeIcon size={48} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Break Time</h2>
        <p className="mb-6">
          You've completed a module. Take a quick break before continuing.
        </p>
        
        <div className="mb-6">
          <div className="text-4xl font-bold mb-2">{formatTime()}</div>
          <div className="w-full h-3 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={onComplete}
          >
            Continue to Next Module
          </Button>
        </div>
      </div>
    </div>
  );
} 