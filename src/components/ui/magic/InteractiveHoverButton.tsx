import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  children?: React.ReactNode;
}

export function InteractiveHoverButton({
  text,
  className,
  children,
  onClick,
  disabled,
  type,
}: InteractiveHoverButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={cn(
        "group relative w-full overflow-hidden rounded-md bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-3 text-white transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
      type={type}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 1,
        }}
      />
      
      {/* Particle effects */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 bg-white rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: "100%",
                opacity: 0,
              }}
              animate={{
                y: "-20%",
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
      
      {/* Button content */}
      <motion.span
        className="relative z-10 flex items-center justify-center gap-2 font-medium"
        animate={{
          y: isHovered ? -1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {children || text}
        
        {/* Arrow icon */}
        <motion.span
          className="inline-block"
          animate={{
            x: isHovered ? 4 : 0,
            rotate: isHovered ? 45 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          →
        </motion.span>
      </motion.span>
      
      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-md border-2 border-white/30"
        initial={{ opacity: 0, scale: 1 }}
        animate={{
          opacity: isHovered ? [0, 0.5, 0] : 0,
          scale: isHovered ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: isHovered ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
} 