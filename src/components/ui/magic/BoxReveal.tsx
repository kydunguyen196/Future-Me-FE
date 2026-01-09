import { type ReactNode, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BoxRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  boxColor?: string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function BoxReveal({
  children,
  width = "fit-content",
  boxColor = "#3b82f6",
  duration = 0.5,
  delay = 0,
  className,
}: BoxRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div
        style={{
          width,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: delay,
          duration: 0.2,
        }}
      >
        {children}
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: boxColor,
        }}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{
          delay: delay,
          duration: duration,
          ease: "easeInOut",
        }}
      />
    </div>
  );
} 