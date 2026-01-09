import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: number;
  gradient?: boolean;
}

export function ScrollProgress({ 
  className, 
  color = "#3b82f6",
  height = 3,
  gradient = false
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const gradientStyle = gradient ? {
    background: "linear-gradient(to right, #3b82f6, #8b5cf6, #06b6d4)",
    backgroundSize: "200% 100%",
  } : {
    backgroundColor: color,
  };

  return (
    <motion.div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 origin-left",
        gradient && "animate-gradient-x",
        className
      )}
      style={{
        scaleX,
        height: `${height}px`,
        ...gradientStyle
      }}
    />
  );
}

interface CircularScrollProgressProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
}

export function CircularScrollProgress({
  className,
  size = 60,
  strokeWidth = 4,
  color = "#3b82f6",
  backgroundColor = "#e5e7eb",
  showPercentage = false
}: CircularScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    return scrollYProgress.onChange((latest) => {
      setProgress(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          style={{
            strokeDasharray,
            strokeDashoffset
          }}
          animate={{
            strokeDashoffset
          }}
          transition={{
            duration: 0.35,
            ease: "easeInOut"
          }}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{progress}%</span>
        </div>
      )}
    </div>
  );
} 