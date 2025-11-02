"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl rounded-tl-none border border-white/12 bg-linear-to-br from-primary/12 via-[#86c940]/10 to-[#9dd958]/12 px-4 py-3 shadow-[0_18px_36px_-28px_rgba(107,176,42,0.55)] backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="size-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <motion.span
        className="text-xs text-foreground/60"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
       <span className='sr-only' >AI is typing...</span>
      </motion.span>
    </div>
  );
}
