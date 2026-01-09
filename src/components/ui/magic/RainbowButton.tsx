import React from "react";
import { cn } from "@/lib/utils";

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function RainbowButton({ children, className, ...props }: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium text-white transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        
        // Rainbow gradient background
        "bg-[linear-gradient(#121213,#121213),conic-gradient(from_180deg,#bd34fe_0deg,#41d1ff_50deg,#ffdc80_90deg,#bd34fe_180deg,#41d1ff_250deg,#ffdc80_300deg,#bd34fe_360deg)] dark:bg-[linear-gradient(#000,#000),conic-gradient(from_180deg,#bd34fe_0deg,#41d1ff_50deg,#ffdc80_90deg,#bd34fe_180deg,#41d1ff_250deg,#ffdc80_300deg,#bd34fe_360deg)]",
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
} 