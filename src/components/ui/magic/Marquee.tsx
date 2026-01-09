import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  speed?: number;
}

export function Marquee({
  children,
  reverse = false,
  pauseOnHover = true,
  className,
  speed = 50,
}: MarqueeProps) {
  return (
    <div 
      className={cn(
        "group flex overflow-hidden",
        pauseOnHover && "hover:[&_.marquee-content]:pause",
        className
      )}
    >
      <div
        className={cn(
          "marquee-content flex shrink-0 animate-marquee gap-4",
          reverse && "animate-marquee-reverse"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
      </div>
      <div
        className={cn(
          "marquee-content flex shrink-0 animate-marquee gap-4",
          reverse && "animate-marquee-reverse"
        )}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {children}
      </div>
    </div>
  );
} 