import { useEffect, useState } from 'react';

interface TestTimerProps {
  minutes: number;
  onTimeEnd: () => void;
  onTimeUpdate?: (timeString: string) => void;
}

/**
 * Component that displays a countdown timer for test
 */
const TestTimer: React.FC<TestTimerProps> = ({ minutes, onTimeEnd, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  
  useEffect(() => {
    // Reset timer when minutes change
    setTimeLeft(minutes * 60);
  }, [minutes]);

  // Format time as mm:ss
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeEnd();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    // Call the onTimeUpdate callback whenever time changes
    if (onTimeUpdate) {
      onTimeUpdate(formatTime());
    }

    return () => clearInterval(timerId);
  }, [timeLeft, onTimeEnd, onTimeUpdate]);

  // Calculate progress percentage
  const progressPercentage = (timeLeft / (minutes * 60)) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl font-bold mb-2">{formatTime()}</div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};

export default TestTimer; 